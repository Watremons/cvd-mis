import time
import os
import cv2
import numpy as np
from PIL import Image

from pyheatmap.heatmap import HeatMap
from sqlalchemy import false

from nets.yolox import YOLO
from nets import yolact_dect
from nets.yolact_dect import YOLACT


def distance(point1, point2):
    differ = (point1[0] - point2[0])**2 + (point1[1] - point2[1])**2
    return differ**0.5


def vibrate_point_dect(segm_image, cut_images_locate, pic_index):
    gray = cv2.cvtColor(segm_image, cv2.COLOR_BGR2GRAY)
    gray[0][:] = 255
    gray[-1][:] = 255
    gray[:][0] = 255
    gray[:][-1] = 255
    binary, contours, hierarchy = cv2.findContours(gray, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    area = []
    # 找到最大的轮廓
    for k in range(len(contours)):
        area.append(cv2.contourArea(contours[k]))
    max_idx = np.argmax(np.array(area))
    area[max_idx] = 0
    max_idx = np.argmax(np.array(area))
    area[max_idx] = 0
    second_idx = np.argmax(np.array(area))

    out_contours = np.concatenate((contours[max_idx], contours[second_idx]), axis=0)
    rect = cv2.minAreaRect(out_contours)

    points = cv2.boxPoints(rect)
    points = np.int0(points)

    points = points.tolist()
    max_point = max([points[0][1], points[1][1], points[2][1], points[3][1]])
    p1 = list()
    for i in range(4):
        if points[i][1] == max_point:
            p1 = points[i]
            p1_id = i
    points.pop(p1_id)
    min_dist = (points[0][0] - p1[0]) ** 2 + (points[0][1] - p1[1]) ** 2
    p2 = points[0]

    for i in range(len(points)):
        dist = (points[i][0] - p1[0]) ** 2 + (points[i][1] - p1[1]) ** 2
        if min_dist > dist:
            p2 = points[i]
    vp = [int((p1[0] + p2[0]) / 2 + cut_images_locate[pic_index][0]),
          int((p1[1] + p2[1]) / 2 + cut_images_locate[pic_index][1])]

    threshold = distance(p1, p2)

    return vp, threshold


def apply_heatmap(image, data):
    """
    Create heatMap image

    :param image: raw pic as background
    :param data: an array of number pair as point
    :returns: image with heatmap
    :raises IOError: save pic or read pic error
    """
    # create a new pic from raw image, which background is black
    background = Image.new("RGB", (image.shape[1], image.shape[0]), color=0)
    # create Heatmap
    hm = HeatMap(data)
    hit_img = hm.heatmap(base=background, r=35)  # base: 背景图片，r: 热力半径，默认为10
    hit_img = cv2.cvtColor(np.asarray(hit_img), cv2.COLOR_RGB2BGR)  # Image格式转换成cv2格式
    overlay = image.copy()
    alpha = 0.4
    cv2.rectangle(overlay, (0, 0), (image.shape[1], image.shape[0]), (255, 0, 0), -1)  # 设置蓝色为热度图基本色蓝色
    image_with_base = cv2.addWeighted(overlay, alpha, image, 1-alpha, 0)  # 将背景热度图覆盖到原图
    image_with_heatmap = cv2.addWeighted(hit_img, alpha, image_with_base, 1-alpha, 0)  # 将热度图覆盖到原图
    return image_with_heatmap


def point2str(point):
    """
    Transform number pair to str

    :param point: number pair
    :returns: image with heatmap
    :raises IOError: save pic or read pic error
    """
    return "[{0},{1}]\n".format(point[0], point[1])


def video_vibrate_detect(project_name: str, video_file: str, make_pic: int):
    """
    do video_vibrate_detect

    :param project_name:  name of detection project
    :returns: total frame num and total point num
    :raises IOError: save pic or read pic error
    """
    yolo = YOLO()
    yolact = YOLACT()
    print("[Info] '{0}' project detection start!".format(project_name))
    # 检查目标目录是否存在，并创建
    # 数据文件保存路径
    out_dir = os.path.join(os.getcwd(), 'media', project_name)
    if not os.path.isdir(out_dir):
        os.mkdir(out_dir)
    # 调用摄像头，若有参数则改为获取参数指定的视频文件
    capture = cv2.VideoCapture(os.path.join(out_dir, video_file))
    # capture=cv2.VideoCapture(0)

    # 获取原始视频帧率及总帧数
    # print("FPS = {0}".format(capture.get(cv2.CAP_PROP_FPS)))
    # print("Frame Number = {0}".format(capture.get(cv2.CAP_PROP_FRAME_COUNT)))

    fourcc = cv2.VideoWriter_fourcc(*"XVID")
    out = cv2.VideoWriter(os.path.join(out_dir, '{0}_result.avi'.format(project_name)), fourcc, 25, (600, 584))

    fps = 0.0
    points = []
    point = None
    raw_frame = None

    frame_count = 0

    # while (True): #调用摄像头
    while capture.isOpened():  # 读取视频文件
        t1 = time.time()
        # 读取某一帧, 返回ref表示是否正确读取，返回frame表示本帧的BGR格式图像，frame.shape = (640,480,3)
        ref, frame = capture.read()
        if raw_frame is None:
            # 保存起始帧用于热力图绘制
            raw_frame = frame
            # 保存起始的原始图片
            cv2.imwrite(os.path.join(out_dir, 'raw.jpg'), frame)

        # 格式转变，BGRtoRGB
        try:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        except Exception as e:
            # print(e.args)  # 打印错误信息
            capture.release()  # 释放读取的文件
            break

        # 转变成Image
        frame = Image.fromarray(np.uint8(frame))

        # 1. 使用yolo进行振捣棒位置识别并对振捣棒截图
        # function: 返回值为原始图像，切割出的振捣棒，标注振捣棒的原图
        _, cut_images, cut_images_locate = yolo.detect_image(frame)
        for index in range(len(cut_images)):
            img = cut_images[index]
            # 2. 使用yolact将1得到的截图中的振捣棒识别
            segm_image = yolact_dect.detect_image(yolact, img)
            # 3. 使用振捣棒点位识别函数从截图中得到振捣棒底部点坐标
            point, threshold = vibrate_point_dect(segm_image, cut_images_locate, index)

        # RGBtoBGR满足opencv显示格式
        frame = cv2.cvtColor(np.array(frame), cv2.COLOR_RGB2BGR)
        # 帧率取起始和当前时间间隔
        fps = (fps + (1./(time.time()-t1))) / 2
        # 在当前帧左上角设置帧率显示
        frame = cv2.putText(frame, "fps= %.2f" % (fps), (0, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        # 在当前帧显示点位坐标
        if point is not None:
            cv2.circle(frame, (point[0], point[1]), 5, (0, 255, 255), -1, 0, 0)
            frame = cv2.putText(frame, "[{}, {}]".format(point[0], point[1]), (point[0], point[1]), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            points.append(point)

        cv2.imshow("video", frame)
        out.write(frame)
        if make_pic == 1:
            cv2.imwrite(os.path.join(out_dir, "{:05d}.jpg".format(frame_count)), frame)
        frame_count += 1

        c = cv2.waitKey(1) & 0xff
        if c == 27:
            capture.release()
            break
    # 后端绘制热力图
    image_with_heatmap = apply_heatmap(raw_frame, points)
    cv2.imwrite(os.path.join(out_dir, "heatmap.jpg"), image_with_heatmap)
    # 保存点坐标到文本文件，改为前端渲染
    fo = open(os.path.join(out_dir, 'points.txt'), "w")
    fo.writelines(map(point2str, points))
    fo.close()
    print("[Info] {0} Finished!".format(project_name))
    return frame_count, len(points)


if __name__ == '__main__':
    # print(video_vibrate_detect([2000,4000],[[50,60],[120,40]],[100,256]))
    # sys.argv = [project_name: str, video_path: str, make_pic: int]
    # video_vibrate_detect(eval(sys.argv[1]), eval(sys.argv[2]), eval(sys.argv[3]))
    # print(rateModel(torch.from_numpy(np.array([57.2]))))
    video_vibrate_detect(project_name='test', video_file='test.mp4', make_pic=1)
