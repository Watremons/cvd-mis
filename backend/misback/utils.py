import datetime
import json
import os
import jwt

from django.utils import timezone
from django.conf import settings


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
def generate_file_path(dirname, filename):
    # ext = filename.split('.')[-1]
    # filename = '{}.{}'.format(uuid.uuid4().hex[:10], ext)
    # return the whole path to the file
    return os.path.join(os.path.abspath('.'), "media", dirname, filename)
