import datetime
import json
import os
import uuid
import jwt

from django.utils import timezone
from django.conf import settings

from misback.models import Project


# Functions
# Generate payload, expire in 7 days
def generate_payload(uid):
    return {
        'uid': uid,
        'expire': (timezone.now() + datetime.timedelta(days=7)).timestamp()
    }


# Generate token
def generate_token(payload):
    token = jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm="HS256"
    )
    return token


# Decode token
def extract_token(token):
    data = jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=['HS256']
    )
    return data


# Transform the datetime when serialize as json
class DateEnconding(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime.datetime.date):
            return o.strftime('%Y/%m/%d')


# Save the file to destination
def handle_uploaded_file(file, dst):
    dirname = os.path.dirname(dst)
    if not os.path.isdir(dirname):
        os.mkdir(dirname)
    with open(dst, 'wb+') as destination:
        for chunk in file.chunks():
            destination.write(chunk)


# Create name for upload video file
def generate_file_name(filename):
    ext = filename.split('.')[-1]
    new_filename = '{}.{}'.format(uuid.uuid4().hex[:10], ext)
    # return the whole path to the file
    return new_filename


# Combine the dir path and file name
def combine_media_file_path(dirname, filename):
    # return the whole path to the file
    return os.path.join(os.path.abspath('.'), "media", dirname, filename)


# Create media file url
def get_media_file_url(obj: Project, file_name: str):
    return '/'.join([
        settings.BASE_URL,
        'media',
        str(obj.pid),
        file_name
    ])


# Create media video url
def get_media_video_url(file_path: str):
    return '/'.join([
        '/api',
        'misback',
        'get-video',
        file_path
    ])


# Read points from points.txt
def get_point_list(obj: Project):
    file_path = os.path.join(settings.MEDIA_ROOT, "{pid}".format(pid=obj.pid), "points.txt")
    if not os.path.isfile(file_path):
        return []
    fo = open(file_path, "r")
    raw_point_list = fo.readlines()
    fo.close()
    points = [{'x': eval(raw_point)[0], 'y': eval(raw_point)[1]} for raw_point in raw_point_list]
    return points


# Detele dir and files
def delete_media_dir(dir_name: str):
    delete_file_list = []
    for root, __, files in os.walk(os.path.join(os.path.abspath('.'), 'media', dir_name)):
        for file_name in files:
            delete_file_list.append(os.path.join(dir_name, file_name))
            os.remove(os.path.join(root, file_name))
    return delete_file_list


# Handle file iterate
def file_iterator(file_name, chunk_size=8192, offset=0, length=None):
    with open(file_name, "rb") as f:
        f.seek(offset, os.SEEK_SET)
        remaining = length
        while True:
            bytes_length = chunk_size if remaining is None else min(remaining, chunk_size)
            data = f.read(bytes_length)
            if not data:
                break
            if remaining:
                remaining -= len(data)
            yield data


# Get file size by file path
def get_file_size(file_path):
    return os.path.getsize(file_path)
