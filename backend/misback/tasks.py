# Create celery tasks
from __future__ import absolute_import, unicode_literals
import logging

import os
import subprocess
from celery import shared_task

from misback import models


@shared_task
def cvd_detect_task(pid: int, video_file: str, make_pic: int):
    script_path = os.path.join(os.getcwd(), 'vbar_detect_v3', 'run_detect_{0}.py'.format(pid))

    # print(script_path)

    fo = open(script_path, mode="w", encoding='utf-8')
    fo.writelines([
        "from run_video_detect import video_vibrate_detect\n",
        "if __name__ == '__main__':\n",
        "\tvideo_vibrate_detect(pid={0}, video_file='{1}', make_pic={2})\n".format(pid, video_file, make_pic)
    ])
    fo.close()
    logging.info("Ready to run script to start detection.")
    try:
        result = subprocess.check_output(
            ['python', '-u', str(script_path)],
            stdin=subprocess.PIPE,
            stderr=subprocess.STDOUT
        ).decode()

        # Change the status to "Done"
        query_project_set = models.Project.objects.filter(pid=pid)
        if not query_project_set.exists():
            return ({"message": "检测项目pid错误", "status": -1})
        query_project_set.update(projectStatus=2)
        os.remove(script_path)

        return ({"message": result, "status": 0})
    except subprocess.CalledProcessError as exc:
        logging.error('returncode:', exc.returncode)
        logging.error('cmd:', exc.cmd)
        logging.error('output:', exc.output.decode())
        return ({
            "message": {
                "returncode": exc.returncode,
                'cmd': exc.cmd,
                'output': exc.output.decode()
            },
            "status": -1
        })
