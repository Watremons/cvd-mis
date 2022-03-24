# Create celery tasks
from __future__ import absolute_import, unicode_literals
import logging

import os
import subprocess
from celery import shared_task

from misback import models


@shared_task
def cvd_detect_task(pid: int):
    # projectNameStr = json.dumps(project_name, separators=(',', ':'))
    # videoPathStr = json.dumps(video_path, separators=(',', ':'))
    # makePicStr = json.dumps(make_pic, separators=(',', ':'))
    # print(popuListStr)
    # print(transMatrixStr)
    # print(infectedListStr)
    query_project_set = models.Project.objects.filter(pid=pid)
    if not query_project_set.exists():
        return ({"message": "检测项目pid错误", "status": -1})

    # Change the status
    query_project_set.update(projectStatus=1)

    # Set the params
    query_project = query_project_set.first()
    project_name = query_project.projectName
    video_file = query_project.videoFile
    make_pic = 0

    script_path = os.path.join(os.getcwd(), 'vbar_detect_v3', 'run_detect_{0}.py'.format(pid))

    # print(script_path)

    fo = open(script_path, "w")
    fo.writelines([
        "from run_video_detect import video_vibrate_detect\n",
        "if __name__ == '__main__':\n",
        "\tvideo_vibrate_detect(pid={0}, project_name='{1}', video_file='{2}', make_pic={3})\n".format(pid, project_name, video_file, make_pic)
    ])
    fo.close()
    logging.info("Ready to run script to start detection.")
    try:
        result = subprocess.check_output(
            ['python', '-u', str(script_path)],
            stdin=subprocess.PIPE,
            stderr=subprocess.STDOUT,
        ).decode()
        # print(resultList)
        query_project_set.update(projectStatus=1)
        return ({"message": result, "status": 0})
    except subprocess.CalledProcessError as exc:
        logging.error('returncode:', exc.returncode)
        logging.error('cmd:', exc.cmd)
        logging.error('output:', exc.output.decode())
        print('returncode:', exc.returncode)
        print('cmd:', exc.cmd)
        print('output:', exc.output.decode())
        return ({"message": "Return a non-list result!", "status": -1})
