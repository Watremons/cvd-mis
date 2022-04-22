# -*- coding:utf-8 -*-
# Import from standard libs
import json
import mimetypes
import re
import traceback
import logging
from wsgiref.util import FileWrapper
from celery.result import AsyncResult

# Import from django libs
from django.http import JsonResponse, StreamingHttpResponse
from django.utils import timezone
from django.forms.models import model_to_dict
from django.utils.decorators import method_decorator

# Import from DRF lib
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework import viewsets

# Import from customized component
# from backend.misback import customSerializers, models, paginations
from misback import customSerializers, models, paginations
from misback.tasks import cvd_detect_task

# Import from utils
from misback.utils import DateEnconding
from misback.utils import generate_payload, generate_token, extract_token
from misback.utils import combine_media_file_path, generate_file_name, handle_uploaded_file, delete_media_dir, get_file_size, file_iterator

# Set log file
logger = logging.getLogger("django")


# Create your views here.


# Decorations:
# Access auth by token;
# Return 401 if no token or expire
# Return 404 else
def token_auth(function):
    def authenticate(request, *args, **kwargs):
        token = request.META.get("HTTP_TOKEN", None)
        if token:
            try:
                data = extract_token(token)
                if data['expire'] < timezone.now().timestamp():
                    return JsonResponse({"message": "身份认证过期，请重新登陆", "status": 401})
                return function(request, *args, **kwargs)
            except Exception as e:
                logging.error(e.args)
                logging.error(traceback.format_exc())
                logging.error('########################################################')
                return JsonResponse({"message": "检测到可能的恶意攻击，登陆已被拦截", "status": 404, "errorInfo": traceback.format_exc()})
        else:
            return JsonResponse({"message": "您尚未登录，请先登录", "status": 401})
    return authenticate


# Login View
# Params: userName, userPassword
# Return 404 if no account, wrong password
# Return 200 if success
def log_in(request):
    # 若已经登录，直接进入已登录账号
    if request.method == "POST":
        # 从参数获取phoneNum和password
        user_name = request.POST.get('userName', None)
        password = request.POST.get('password', None)
        if user_name and password:
            user_name = user_name.strip()
            try:
                # 从数据库获取phonenum和对应userId，取出salt
                # 获取失败则捕捉错误
                log_in_user = models.User.objects.filter(userName=user_name)
                if not log_in_user.exists():
                    return JsonResponse({"message": "该账号不存在", "status": 404})
                log_in_user = log_in_user.first()

                # 判断是否和存储密码相同
                if (log_in_user.logindata.password == password):
                    # 若相同，设置登录状态为True，设置登录id为userId
                    payload = generate_payload(log_in_user.uid, log_in_user.authority)
                    token = generate_token(payload)
                    # logging.debug(request.session.get('userId', None))
                    response = JsonResponse({
                        "message": "登录成功",
                        "status": 200,
                        "token": token
                        })
                    # response["Access-Control-Allow-Credentials"] = "true"
                    # response["Access-Control-Allow-Methods"] = 'GET, POST, PATCH, PUT, OPTIONS'
                    # response["Access-Control-Allow-Headers"] = "Origin,Content-Type,Cookie,Accept,Token"
                    return response
                else:
                    return JsonResponse({"message": "密码错误", "status": 404})
            except Exception as e:
                logging.error(e.args)
                logging.error(traceback.format_exc())
                logging.error('########################################################')
                return JsonResponse({"message": "数据库错误", "status": 404, "errorInfo": traceback.format_exc()})
        else:
            return JsonResponse({"message": "登录表单填写不完整", "status": 404})
    else:
        return JsonResponse({"message": "请求方式未注册", "status": 404})


# 获取当前登录用户视图
# Params: /
# Return 404 if no token
# Return 200 if success
def get_now_user(request):
    if request.method == "GET":
        token = request.META.get("HTTP_TOKEN", None)
        if token:
            try:
                data = extract_token(token)
                if data['uid']:
                    query_user_set = models.User.objects.filter(pk=data['uid'])
                    if not query_user_set.exists():
                        return JsonResponse({"message": "该账号不存在", "status": 404})
                    now_user = query_user_set.first()
                else:
                    return JsonResponse({
                        "message": "用户信息验证失败，token错误",
                        "status": 404
                    })

                return JsonResponse({
                    "message": "获取当前账号成功",
                    "data": model_to_dict(now_user),
                    "status": 200
                })
            except Exception as e:
                logging.error(e.args)
                logging.error(traceback.format_exc())
                logging.error('########################################################')
                return JsonResponse({"message": "检测到可能的恶意攻击，登陆已被拦截", "status": 404, "errorInfo": traceback.format_exc()})
        else:
            return JsonResponse({"message": "您尚未登录，请先登录", "status": 401})
    else:
        return JsonResponse({"message": "请求方式未注册", "status": 404})


# 登出函数视图
# 从redis获取对应session并删除
# 前端自己清除对应token
# 登出成功，返回消息和200状态码
# 登出失败，返回消息和404状态码
def log_out(request):
    if request.method == "POST":
        request.session.flush()
        # del request.session['isLogin']
        # del request.session['userId']
        # del request.session['userName']
        return JsonResponse({"message": "登出成功", "status": 200})
    else:
        return JsonResponse({"message": "请求方式未注册", "status": 404})


# 注册函数视图
# 从参数获取userName，phonenum,email,password,verifyCode
# 验证判断其合法性，并创建对应数据存入数据库
# 注册成功，返回消息和200状态码
# 注册失败，返回消息和404状态码
def sign_up(request):
    if request.method == "POST":
        userName = request.POST.get('userName', None)
        password = request.POST.get('password', None)

        if userName and password:  # 获取数据
            sameNameUser = models.PersonalProfile.objects.filter(userName=userName)
            if sameNameUser:  # 用户名唯一
                return JsonResponse({"message": "用户已经存在，请重新输入用户名！", "status": 404})

            # 当一切都OK的情况下，创建新用户
            try:
                newUserInfo = models.User.objects.create(
                    userName=userName
                )

                newLoginData = models.LoginData.objects.create(
                    uid=newUserInfo,
                    userPassword=password,
                )

                logger.debug(json.dumps(newLoginData, cls=DateEnconding))
                logger.debug(json.dumps(newUserInfo, cls=DateEnconding))

                return JsonResponse({"message": "注册成功", "status": 200})
            except Exception as e:
                logging.error(e.args)
                logging.error(traceback.format_exc())
                logging.error('########################################################')
                return JsonResponse({"message": "数据库出错，注册失败", "status": 404, "errorInfo": traceback.format_exc()})
        else:
            return JsonResponse({"message": "注册表单填写不完整", "status": 404})
    else:
        return JsonResponse({"message": "请求方式未注册", "status": 404})


# 创建Project视图
# 从参数获取创建Project的必要数据和文件并保存
# 验证判断其合法性，并创建对应数据存入数据库
# 创建成功，返回消息和200状态码
# 创建失败，返回消息和404状态码
@token_auth
def create_project(request):
    if request.method == "POST":
        # print('request', json.dumps(request.POST))
        # 获取基本参数
        projectName = request.POST.get('projectName', None)
        rawVideoFileName = request.POST.get('videoFileName', None)
        description = request.POST.get('description', None)
        # 获取当前用户信息
        token = request.META.get("HTTP_TOKEN", None)
        data = extract_token(token=token)
        if data['uid']:
            query_user_set = models.User.objects.filter(pk=data['uid'])
            if not query_user_set.exists():
                return JsonResponse({"message": "该账号不存在", "status": 404})
            now_user = query_user_set.first()
        if not now_user:
            return JsonResponse({
                "message": "用户信息验证失败，token错误",
                "status": 404
            })
        # 获取视频文件
        videoFile = request.FILES.get('videoFile', None)
        # print('videoFile', type(videoFile), videoFile)
        videoFileName = generate_file_name(filename=rawVideoFileName)

        if projectName and videoFileName and description and videoFile:  # 检查数据完整性
            # 当一切都OK的情况下，创建新Project
            try:
                newProjectInfo = models.Project.objects.create(
                    projectName=projectName,
                    videoFile=videoFileName,
                    projectStatus=0,
                    uid=now_user,
                    description=description
                )
                dirname = "{pid}".format(pid=newProjectInfo.pid)
                file_path = combine_media_file_path(dirname=dirname, filename=newProjectInfo.videoFile)
                handle_uploaded_file(videoFile, file_path)

                return JsonResponse({"message": "新建项目成功", "status": 200})
            except Exception as e:
                logging.error(e.args)
                logging.error(traceback.format_exc())
                logging.error('########################################################')
                return JsonResponse({"message": "数据库出错，创建失败", "status": 404, "errorInfo": traceback.format_exc()})
        else:
            return JsonResponse({"message": "表单填写不完整", "status": 404})
    else:
        return JsonResponse({"message": "请求方式未注册", "status": 404})


# run_detect(run-detect)创建一个新的检测项目
# Params: pid
# Return 404 if no pid, no pageNum
# Return 200 if success
@token_auth
def run_detect(request):
    if request.method == "POST":
        # 从参数获取pid
        pid = request.POST.get('pid', None)
        if pid:
            try:
                query_project_set = models.Project.objects.filter(pid=pid)
                if not query_project_set.exists():
                    return JsonResponse({"message": "检测项目pid错误", "status": 404})
                # Change the status
                query_project_set.update(projectStatus=1)

                query_project = query_project_set.first()
                project_run_celery = cvd_detect_task.delay(
                    pid=query_project.pid,
                    video_file=query_project.videoFile,
                    make_pic=0
                )
                logging.info(f'Run detect to project {pid}')
                logging.info(f'task_id: {project_run_celery.task_id}')

                # Change the status to doing(1)
                target_project = models.Project.objects.filter(pid=pid)
                if not target_project.exists():
                    return JsonResponse({"message": f"不存在project实体pid为{pid}", "status": 404})
                target_project.update(taskId=project_run_celery.task_id)

                return JsonResponse({
                    'status': 200,
                    'message': '成功启动检测，请重新查看project以获取task_id',
                })

            except Exception as e:
                logging.error(e.args)
                logging.error(traceback.format_exc())
                logging.error('########################################################')
                return JsonResponse({"message": "数据库错误", "status": 404, "errorInfo": traceback.format_exc()})
        else:
            return JsonResponse({"message": "表单填写不完整", "status": 404})
    else:
        return JsonResponse({"message": "请求方式未注册", "status": 404})


# async_result(async-result)通过处理task_id获取结果
# Params: taskId
# Return 404 if no taskId
# Return 200 if success
@token_auth
def async_result(request, taskId):
    if request.method == "GET":
        if taskId:
            try:
                task_result = AsyncResult(id=taskId)
                print('task_result', task_result)

                return JsonResponse({
                    'status': 200,
                    'message': '成功获取task_result',
                    'data': {
                        'status': task_result.status,
                        'result': task_result.result,
                        'successful': task_result.successful(),
                        'traceback': task_result.traceback,
                        'failed': task_result.failed()
                    }
                })

            except Exception as e:
                logging.error(e.args)
                logging.error(traceback.format_exc())
                logging.error('########################################################')
                return JsonResponse({"message": "数据库错误", "status": 404, "errorInfo": traceback.format_exc()})
        else:
            return JsonResponse({"message": "表单填写不完整", "status": 404})
    else:
        return JsonResponse({"message": "请求方式未注册", "status": 404})


# get_video(get-video)以视频流的形式返回视频文件
# Params: pk, filename
# Return 404 if no pid, no pageNum
# Return 200 if success
def get_video(request, pk, filename):
    if request.method == "GET":
        if pk and filename:
            try:
                range_header = request.META.get('HTTP_RANGE', '').strip()
                range_re = re.compile(r'bytes\s*=\s*(\d+)\s*-\s*(\d*)', re.I)
                range_match = range_re.match(range_header)
                whole_file_path = combine_media_file_path(dirname=str(pk), filename=filename)

                size = get_file_size(whole_file_path)
                content_type, encoding = mimetypes.guess_type(whole_file_path)
                content_type = 'application/octet-stream'
                if range_match:
                    first_byte, last_byte = range_match.groups()
                    first_byte = int(first_byte) if first_byte else 0
                    last_byte = first_byte + 1024 * 1024 * 10
                    if last_byte >= size:
                        last_byte = size - 1
                    length = last_byte - first_byte + 1
                    response = StreamingHttpResponse(file_iterator(whole_file_path, offset=first_byte, length=length), status=206, content_type=content_type)
                    response['Content-Length'] = str(length)
                    response['Content-Range'] = 'bytes %s-%s/%s' % (first_byte, last_byte, size)
                else:
                    response = StreamingHttpResponse(FileWrapper(open(whole_file_path, 'rb')), content_type=content_type)
                    response['Content-Length'] = str(size)
                response['Accept-Ranges'] = 'bytes'
                return response
            except Exception as e:
                logging.error(e.args)
                logging.error(traceback.format_exc())
                logging.error('########################################################')
                return JsonResponse({"message": "数据库错误", "status": 404, "errorInfo": traceback.format_exc()})
        else:
            return JsonResponse({"message": "表单填写不完整", "status": 404})
    else:
        return JsonResponse({"message": "请求方式未注册", "status": 404})

# # create_project(create-project)创建一个新的检测项目
# # Params: bookId, pageNum
# # Return 404 if no bookId, no pageNum
# # Return 200 if success
# @token_auth
# def create_project(request):
#     if request.method == "POST":
#         # 从参数获取bookId和pageNum
#         book_id = request.POST.get('bookId', None)
#         page_num = request.POST.get('pageNum', None)
#         if book_id and page_num:
#             try:
#                 query_book_set = models.Books.objects.filter(bookId=book_id)
#                 if not query_book_set.exists():
#                     return JsonResponse({"message": "书籍Id错误", "status": 404})

#                 query_page_set = models.Pages.objects.filter(bookId=book_id, pageIndex=page_num)
#                 if not query_page_set.exists():
#                     return JsonResponse({"message": "该书籍没有该页", "status": 404})
#                 # Lock page
#                 query_page_set.update(pageLock=1)

#                 query_page = query_page_set.first()

#                 query_boxes = models.WordBoxs.objects.filter(pageId=query_page.pageId)

#                 page_dict = {
#                     "pageId": query_page.pageId,
#                     "pageIndex": query_page.pageIndex,
#                     "pagePhotoUrl": query_page.pagePhotoUrl,
#                     "bookId": query_page.bookId.bookId,
#                     "pageContent": query_page.pageContent
#                 }

#                 boxList = []
#                 for box in query_boxes:
#                     box_dict = model_to_dict(box)
#                     boxList.append(box_dict)
#                 page_dict["boxList"] = boxList
#                 return JsonResponse({"status": 200, 'pageInfo': page_dict})
#             except Exception as e:
#                 logging.error(e.args)
#                 logging.error(traceback.format_exc())
#                 logging.error('########################################################')
#                 return JsonResponse({"message": "数据库错误", "status": 404})
#         else:
#             return JsonResponse({"message": "登录表单填写不完整", "status": 404})
#     else:
#         return JsonResponse({"message": "请求方式未注册", "status": 404})


# # save_page_boxes(save-page-boxes)根据pageId存入一系列的box，可能update，可能insert
# @token_auth
# def save_page_boxes(request):
#     if request.method == "POST":
#         page_id = request.POST.get('pageId', None)
#         box_list = request.POST.getlist('boxList', None)
#         auto_save = request.POST.get('autoSave', None)
#         if page_id and box_list and auto_save:
#             try:
#                 # Check if the page has already been written
#                 now_page_set = models.Pages.objects.filter(pageId=page_id)
#                 if not now_page_set.exists():
#                     return JsonResponse({"message": "该页面不存在", "status": 404})
#                 now_page = now_page_set.first()
#                 if now_page.pageStatus != 1:
#                     return JsonResponse({"message": "该页面在该环节已被其他用户处理", "status": 402})

#                 recog_param = []
#                 for box in box_list:
#                     if "boxId" in box.keys():
#                         target_box = models.WordBoxs.objects.filter(boxId=box.boxId)
#                         if not target_box.exists():
#                             return JsonResponse({"message": f"不存在box实体boxId为{box.boxId}", "status": 404})
#                         target_box.update(
#                             boxX=box.boxX,
#                             boxY=box.boxY,
#                             boxWidth=box.boxWidth,
#                             boxHeight=box.boxHeight
#                         )
#                     else:
#                         models.WordBoxs.objects.create(
#                             boxX=box.boxX,
#                             boxY=box.boxY,
#                             boxWidth=box.boxWidth,
#                             boxHeight=box.boxHeight
#                         )
#                     recog_param.append([box.boxX, box.boxY, (box.boxHeight, box.boxWidth)])
#                 if auto_save == 1:  # Page status stay
#                     now_page_set.filter(pageId=page_id).update(pageStatus=1, pageLock=0)
#                 else:  # Page transfer to Module Recognition: 2
#                     now_page_set.filter(pageId=page_id).update(pageStatus=2, pageLock=0)
#                     # AI Model Function Call: Module Recognition
#                     page_url = now_page_set.filter(pageId=page_id).first().pagePhotoUrl
#                     recog_result = k_means(
#                         os.path.join(os.getcwd(), page_url),
#                         recog_param
#                     )

#                     index = 0
#                     for result in recog_result:
#                         box_list[index].word = result['value']
#                         index += 1
#                         target_box = models.WordBoxs.objects.filter(boxId=box_list[index].boxId).update(word=box_list[index].word)
#                     token = request.META.get("token", None)
#                     now_user_id = jwt.decode(
#                         token,
#                         settings.SECRET_KEY,
#                         algorithms=['HS256']
#                     )['user_id']
#                     models.UserOperations.objects.create(
#                         pageId=page_id,
#                         userId=now_user_id,
#                         opType='L'
#                     )

#                 return JsonResponse({"message": "更新成功", "status": 200})
#             except Exception as e:
#                 logging.error(e.args)
#                 logging.error(traceback.format_exc())
#                 logging.error('########################################################')
#                 return JsonResponse({"message": "数据库错误", "status": 404})
#         else:
#             return JsonResponse({"message": "登录表单填写不完整", "status": 404})
#     else:
#         return JsonResponse({"message": "请求方式未注册", "status": 404})


# # get_page_word(get-page-word)根据bookId和pageNum获取页和按字聚合的boxList
# @token_auth
# def get_page_word(request):
#     if request.method == "POST":
#         # 从参数获取bookId和pageNum
#         book_id = request.POST.get('bookId', None)
#         page_num = request.POST.get('pageNum', None)
#         if book_id and page_num:
#             try:
#                 query_book_set = models.Books.objects.filter(bookId=book_id)
#                 if not query_book_set.exists():
#                     return JsonResponse({"message": "书籍Id错误", "status": 404})

#                 query_page_set = models.Pages.objects.filter(bookId=book_id, pageIndex=page_num)
#                 if not query_page_set.exists():
#                     return JsonResponse({"message": "该书籍没有该页", "status": 404})
#                 # Lock page
#                 query_page_set.update(pageLock=1)

#                 query_page = query_page_set.first()

#                 query_boxes = models.WordBoxs.objects.filter(pageId=query_page.pageId)

#                 page_dict = {
#                     "pageId": query_page.pageId,
#                     "pageIndex": query_page.pageIndex,
#                     "pagePhotoUrl": query_page.pagePhotoUrl,
#                     "bookId": query_page.bookId.bookId,
#                     "pageContent": query_page.pageContent
#                 }

#                 boxList = []
#                 for box in query_boxes:
#                     box_dict = model_to_dict(box)
#                     boxList.append(box_dict)

#                 # Get the list group by word
#                 boxList.sort(key=itemgetter('word'))
#                 sorted_boxList = groupby(boxList, itemgetter('word'))
#                 result_dict = dict([(key, list(group)) for key, group in sorted_boxList])
#                 wordlist = []
#                 for key in result_dict:
#                     word_to_box_list = []
#                     for element in result_dict[key]:
#                         word_to_box_list.append(element)
#                     wordlist.append({'word': key, "boxList": word_to_box_list})

#                 page_dict["wordlist"] = wordlist
#                 return JsonResponse(page_dict)
#             except Exception as e:
#                 logging.error(e.args)
#                 logging.error(traceback.format_exc())
#                 logging.error('########################################################')
#                 return JsonResponse({"message": "数据库错误", "status": 404})
#         else:
#             return JsonResponse({"message": "登录表单填写不完整", "status": 404})
#     else:
#         return JsonResponse({"message": "请求方式未注册", "status": 404})


# # save_page_word(save-page-word)Module Recognition: 根据pageId保存修改后的boxList
# @token_auth
# def save_page_word(request):
#     if request.method == "POST":
#         page_id = request.POST.get('pageId', None)
#         box_list = request.POST.getlist('boxList', None)
#         auto_save = request.POST.get('autoSave', None)
#         if page_id and box_list and auto_save:
#             try:
#                 # Check if the page has already been written
#                 now_page_set = models.Pages.objects.filter(pageId=page_id)
#                 if not now_page_set.exists():
#                     return JsonResponse({"message": "该页面不存在", "status": 404})
#                 now_page = now_page_set.first()
#                 if now_page.pageStatus != 2:
#                     return JsonResponse({"message": "该页面在该环节已被其他用户处理", "status": 402})

#                 text = ""
#                 for box in box_list:
#                     text += box.word
#                     target_box = models.WordBoxs.objects.filter(boxId=box.boxId)
#                     if not target_box.exists():
#                         return JsonResponse({"message": f"不存在box实体boxId为{box.boxId}", "status": 404})
#                     target_box.update(
#                         boxX=box.boxX,
#                         boxY=box.boxY,
#                         boxWidth=box.boxWidth,
#                         boxHeight=box.boxHeight,
#                         word=box.word,
#                     )

#                 if auto_save == 1:  # Page status stay
#                     now_page_set.filter(pageId=page_id).update(pageStatus=2, pageLock=0)
#                 else:  # Page transfer to Module Annotation: 3
#                     resultText = seg(text)
#                     now_page_set.filter(pageId=page_id).update(pageContent=resultText, pageStatus=3, pageLock=0)
#                     token = request.META.get("token", None)
#                     now_user_id = jwt.decode(
#                         token,
#                         settings.SECRET_KEY,
#                         algorithms=['HS256']
#                     )['user_id']
#                     models.UserOperations.objects.create(
#                         pageId=page_id,
#                         userId=now_user_id,
#                         opType='R'
#                     )

#                 return JsonResponse({"message": "更新成功", "status": 200})
#             except Exception as e:
#                 logging.error(e.args)
#                 logging.error(traceback.format_exc())
#                 logging.error('########################################################')
#                 return JsonResponse({"message": "数据库错误", "status": 404})
#         else:
#             return JsonResponse({"message": "登录表单填写不完整", "status": 404})
#     else:
#         return JsonResponse({"message": "请求方式未注册", "status": 404})


# # save_page(save-page)根据bookId保存页面的标识结果，即pageContent
# @token_auth
# def save_page(request):
#     if request.method == "POST":
#         page_id = request.POST.get('pageId', None)
#         page_content = request.POST.get('pageContent', None)
#         auto_save = request.POST.get('autoSave', None)
#         if page_id and page_content and auto_save:
#             try:
#                 # Check if the page has already been written
#                 now_page_set = models.Pages.objects.filter(pageId=page_id)
#                 if not now_page_set.exists():
#                     return JsonResponse({"message": "该页面不存在", "status": 404})
#                 now_page = now_page_set.first()
#                 if now_page.pageStatus != 3:
#                     return JsonResponse({"message": "该页面在该环节已被其他用户处理", "status": 402})

#                 if auto_save == 1:  # Page status stay
#                     now_page_set.update(pageContent=page_content, pageStatus=3, pageLock=0)
#                 else:  # Page transfer to Finished: 4
#                     now_page_set.update(pageContent=page_content, pageStatus=4, pageLock=0)

#                 token = request.META.get("token", None)
#                 now_user_id = jwt.decode(
#                     token,
#                     settings.SECRET_KEY,
#                     algorithms=['HS256']
#                 )['user_id']
#                 models.UserOperations.objects.create(
#                     pageId=page_id,
#                     userId=now_user_id,
#                     opType='A'
#                 )

#                 return JsonResponse({"message": "更新成功", "status": 200})
#             except Exception as e:
#                 logging.error(e.args)
#                 logging.error(traceback.format_exc())
#                 logging.error('########################################################')
#                 return JsonResponse({"message": "数据库错误", "status": 404})
#         else:
#             return JsonResponse({"message": "登录表单填写不完整", "status": 404})
#     else:
#         return JsonResponse({"message": "请求方式未注册", "status": 404})


# # pic_locate(pic-locate)扫描raw目录并将原始图片进行定位，结果保存到数据库
# def pic_locate(request):
#     if request.method == "POST":
#         # 从参数获取bookId和pageNum
#         doFlag = request.POST.get('doFlag', None)
#         if doFlag and doFlag == '1':
#             try:
#                 # 0.Copy the file from raw to media
#                 raw_path = os.path.join(os.getcwd(), 'raw')
#                 media_path = os.path.join(os.getcwd(), 'media')
#                 books_exist_list = []
#                 page_id_list = []
#                 for root, dir_list, file_list in os.walk(raw_path):
#                     # 0.1.Create the book object and make dir
#                     for dir_name in dir_list:
#                         book_name = dir_name.split("_")[0]
#                         book_page_num = dir_name.split("_")[1]
#                         book_set = models.Books.objects.filter(bookName=book_name)
#                         if book_set.exists():
#                             books_exist_list.append(book_set.first())
#                             continue
#                         models.Books.objects.create(
#                             bookName=book_name,
#                             bookPageNum=book_page_num
#                         )

#                         os.makedirs(os.path.join(media_path, book_name))
#                     # 0.2.Copy the pic to media and create page object
#                     for file_name in file_list:
#                         page_index = file_name.split(".")[0]
#                         __, book_name_with_num = os.path.split(root)
#                         book_name = book_name_with_num.split("_")[0]

#                         book_set = models.Books.objects.filter(bookName=book_name)
#                         if not book_set.exists():
#                             break
#                         book_object = book_set.first()

#                         # Copy the file to media
#                         shutil.copy(
#                             os.path.join(root, file_name),
#                             os.path.join(media_path, book_name, file_name)
#                         )

#                         # Create page object
#                         page_object = models.Pages.objects.create(
#                             pageIndex=page_index,
#                             pagePhotoUrl=os.path.join(book_name, file_name),
#                             bookId=book_object,
#                         )
#                         page_id_list.append(page_object)

#                 shutil.rmtree(os.path.join(os.getcwd(), 'raw'))
#                 # 1.Do image location by pageId
#                 no_pic_list = []
#                 success_list = []
#                 for page in page_id_list:
#                     pic_path = os.path.join(os.getcwd(), 'media', page.pagePhotoUrl)
#                     print(pic_path)
#                     if not os.path.isfile(pic_path):
#                         no_pic_list.append(model_to_dict(page))
#                         continue
#                     # extract the data to box object
#                     result = splitImg.splitImg(pic_path)
#                     for element in result:
#                         boxX = element[0]
#                         boxY = element[1]
#                         boxWidth = element[2][0]
#                         boxHeight = element[2][1]
#                         models.WordBoxs.objects.create(
#                             boxX=boxX,
#                             boxY=boxY,
#                             boxWidth=boxWidth,
#                             boxHeight=boxHeight,
#                             pageId=page
#                         )
#                     models.Pages.objects.filter(pageId=page.pageId).update(pageStatus=1)
#                     success_list.append(model_to_dict(page))
#                 return JsonResponse({
#                     "status": 200,
#                     'successList': json.dumps(success_list),
#                     'no_pic_list': json.dumps(no_pic_list)
#                 })

#             except Exception as e:
#                 logging.error(e.args)
#                 logging.error(traceback.format_exc())
#                 logging.error('########################################################')
#                 return JsonResponse({"message": "数据库错误", "status": 404})
#         else:
#             return JsonResponse({"message": "登录表单填写不完整", "status": 404})
#     else:
#         return JsonResponse({"message": "请求方式未注册", "status": 404})


# # test_locate(test-locate)测试定位模块
# def test_locate(request):
#     if request.method == "POST":
#         # 从参数获取bookId和pageNum
#         doFlag = request.POST.get('doFlag', None)
#         if doFlag and doFlag == '1':
#             try:
#                 pic_path = os.path.join(os.getcwd(), 'media', 'TestBook', '1.jpg')
#                 result = []
#                 if os.path.isfile(pic_path):
#                     result = splitImg.splitImg(pic_path)
#                 else:
#                     result.append(pic_path)
#                 return JsonResponse({"status": 200, 'result': result})
#             except Exception as e:
#                 logging.error(e.args)
#                 logging.error(traceback.format_exc())
#                 logging.error('########################################################')
#                 return JsonResponse({"message": "数据库错误", "status": 404})
#         else:
#             return JsonResponse({"message": "登录表单填写不完整", "status": 404})
#     else:
#         return JsonResponse({"message": "请求方式未注册", "status": 404})


# Classes inherited from ModelViewSet which can generate RESTFUL URI
@method_decorator(token_auth, name='dispatch')
class UserViewSet(viewsets.ModelViewSet):
    queryset = models.User.objects.all()
    serializer_class = customSerializers.UserSerializer
    pagination_class = paginations.MyFormatResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['userName']
    # filter_class = filters.UserFilter
    filterset_fields = ['authority']
    # 默认按uid排序, 可按uid或userProjectNum排序
    ordering = ['uid']
    ordering_fields = ['uid']


@method_decorator(token_auth, name='dispatch')
class LoginDataViewSet(viewsets.ModelViewSet):
    queryset = models.LoginData.objects.all()
    serializer_class = customSerializers.LoginDataSerializer


@method_decorator(token_auth, name='dispatch')
class ProjectViewSet(viewsets.ModelViewSet):
    queryset = models.Project.objects.all()
    serializer_class = customSerializers.ProjectSerializer
    pagination_class = paginations.MyFormatResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['projectName']
    # filter_class = filters.UserFilter
    filterset_fields = ['projectStatus', 'uid']
    # 默认按uid排序, 可按uid或userProjectNum排序
    ordering = ['pid']
    ordering_fields = ['pid']

    # 重写用于get all的list函数，使其判断权限后在request上增加指定uid过滤
    def list(self, request, *args, **kwargs):
        token = request.META.get("HTTP_TOKEN", None)
        token_data = extract_token(token)
        uid = token_data['uid']
        authority = token_data['authority']
        request.GET._mutable = True
        if authority != 1:
            request.query_params['uid'] = uid
        # print(request.query_params['uid'])
        return super(ProjectViewSet, self).list(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance:
            dir_name = "{pid}".format(pid=instance.pid)
            result = delete_media_dir(dir_name=dir_name)
            logging.info("Delete files with project", dir_name, ":")
            logging.info(result)
        return super(ProjectViewSet, self).destroy(request, *args, **kwargs)
