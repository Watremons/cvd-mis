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
from django.http import JsonResponse, StreamingHttpResponse, HttpResponse
from django.utils import timezone
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
                    return JsonResponse({
                        "message": "登录成功",
                        "status": 200,
                        "token": token
                    })
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
        return JsonResponse({"message": "请求方式未注册", "status": 405})


# 获取当前登录用户视图
# Params: /
# Return 404 if no token
# Return 200 if success
@token_auth
def get_now_user(request):
    if request.method == "GET":
        token = request.META.get("HTTP_TOKEN", None)
        if token:
            try:
                data = extract_token(token)
                if not data['uid']:
                    return JsonResponse({
                        "message": "用户信息验证失败，token错误",
                        "status": 404
                    })

                query_user_set = models.User.objects.filter(pk=data['uid'])
                if not query_user_set.exists():
                    return JsonResponse({"message": "该账号不存在", "status": 404})
                now_user = query_user_set.first()
                return JsonResponse({
                    "message": "获取当前账号成功",
                    "data": now_user.to_dict(),
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
        return JsonResponse({"message": "请求方式未注册", "status": 405})


# 获取所有用户基本信息
# Params: /
# Return 404 if no token
# Return 200 if success
@token_auth
def user_basic(request):
    if request.method == "GET":
        try:
            query_user_set = models.User.objects.all()
            user_basic_set = []
            for user in query_user_set:
                user_basic_info = {}
                user_basic_info['uid'] = user.uid
                user_basic_info['userName'] = user.userName
                user_basic_set.append(user_basic_info)

            return JsonResponse({
                "message": "获取基本信息成功",
                "data": user_basic_set,
                "status": 200
            })
        except Exception as e:
            logging.error(e.args)
            logging.error(traceback.format_exc())
            logging.error('########################################################')
            return JsonResponse({"message": "检测到可能的恶意攻击，登陆已被拦截", "status": 404, "errorInfo": traceback.format_exc()})
    else:
        return JsonResponse({"message": "请求方式未注册", "status": 405})


# 登出函数视图
# 从redis获取对应session并删除
# 前端自己清除对应token
# 登出成功，返回消息和200状态码
# 登出失败，返回消息和404状态码
@token_auth
def log_out(request):
    if request.method == "POST":
        request.session.flush()
        return JsonResponse({"message": "登出成功", "status": 200})
    else:
        return JsonResponse({"message": "请求方式未注册", "status": 405})


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
        return JsonResponse({"message": "请求方式未注册", "status": 405})


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
            return JsonResponse({"message": "表单填写不完整", "status": 406})
    else:
        return JsonResponse({"message": "请求方式未注册", "status": 405})


# run_detect(run-detect)运行指定检测项目
# Params: pid
# Return 404 if no pid
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
            return JsonResponse({"message": "表单填写不完整", "status": 406})
    else:
        return JsonResponse({"message": "请求方式未注册", "status": 405})


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
            return JsonResponse({"message": "表单填写不完整", "status": 406})
    else:
        return JsonResponse({"message": "请求方式未注册", "status": 405})


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
            return JsonResponse({"message": "表单填写不完整", "status": 406})
    else:
        return JsonResponse({"message": "请求方式未注册", "status": 405})


# Classes inherited from ModelViewSet which can generate RESTFUL URI
@method_decorator(token_auth, name='dispatch')
class UserViewSet(viewsets.ModelViewSet):
    queryset = models.User.objects.all()
    serializer_class = customSerializers.UserSerializer
    pagination_class = paginations.MyFormatResultsSetPagination
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['userName']
    filterset_fields = ['authority']
    # 默认按uid排序, 可按uid或userProjectNum排序
    ordering = ['uid']
    ordering_fields = ['uid']

    # 重写创建函数，检查用户名是否重复
    def create(self, request, *args, **kwargs):
        user_name = request.POST.get('userName', None)
        if not user_name:
            return HttpResponse(status=406, content="表单填写不完整：缺少用户名")
        now_user = models.User.objects.filter(userName=user_name)
        if now_user.exists():
            return HttpResponse(status=406, content="用户名已存在，请重新输入")
        return super(UserViewSet, self).create(request, *args, **kwargs)

    # 重写更新函数，检查用户名是否重复
    def partial_update(self, request, *args, **kwargs):
        user_name = request.POST.get('userName', None)
        if user_name:
            now_user = models.User.objects.filter(userName=user_name)
            if now_user.exists():
                return HttpResponse(status=406, content="用户名已存在，请重新输入")
        return super(UserViewSet, self).partial_update(request, *args, **kwargs)


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
    filterset_fields = ['projectStatus', 'uid']
    # 默认按uid排序, 可按pid
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
