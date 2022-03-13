import subprocess
import json
import os


def SendParamsToCmd(project_name: str, video_file: str, make_pic: int):
    # projectNameStr = json.dumps(project_name, separators=(',', ':'))
    # videoPathStr = json.dumps(video_path, separators=(',', ':'))
    # makePicStr = json.dumps(make_pic, separators=(',', ':'))
    # print(popuListStr)
    # print(transMatrixStr)
    # print(infectedListStr)

    script_path = os.path.join(os.getcwd(), 'vbar_detect_v3', 'run_detect.py')

    # print(script_path)

    fo = open(script_path, "w")
    fo.writelines([
        "import os\n",
        "from run_video_detect import video_vibrate_detect\n",
        "if __name__ == '__main__':\n",
        "\tvideo_vibrate_detect(project_name='{0}', video_file='{1}', make_pic={2})\n".format(project_name, video_file, make_pic)
    ])
    fo.close()
    try:
        result = subprocess.check_output(
            ['python', '-u', str(script_path)],
            stdin=subprocess.PIPE,
            stderr=subprocess.STDOUT,
        )
        # print(resultList)
        return result
    except subprocess.CalledProcessError as exc:
        print('returncode:', exc.returncode)
        print('cmd:', exc.cmd)
        print('output:', exc.output.decode())
        return list("Return a non-list result!")
