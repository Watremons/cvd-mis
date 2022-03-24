import logging
import subprocess
import os

# Set log file
logger = logging.getLogger("django")


def SendParamsToCmd(pid: int, project_name: str, video_file: str, make_pic: int):
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
        "\tvideo_vibrate_detect(pid={0}, project_name='{1}', video_file='{2}', make_pic={3})\n".format(pid, project_name, video_file, make_pic)
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
        logging.error('returncode:', exc.returncode)
        logging.error('cmd:', exc.cmd)
        logging.error('output:', exc.output.decode())
        return list("Return a non-list result!")
