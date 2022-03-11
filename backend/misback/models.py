import os
import uuid
from django.db import models


# Function
def page_directory_path(instance, filename):
    ext = filename.split('.').pop()
    filename = '{0}.{1}'.format(
        instance.pageIndex,
        ext
    )

    return os.path.join(instance.bookId.bookName, filename)  # 系统路径分隔符差异，增强代码重用性


def file_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = '{}.{}'.format(uuid.uuid4().hex[:10], ext)
    # return the whole path to the file
    return os.path.join(instance.userId, "avatar", filename)


# Create your models here.
class User(models.Model):
    AUTH_TYPE = (
        (0, "Normal User"),  # 普通用户
        (1, 'Admin'),  # 管理员
    )

    uid = models.AutoField(db_column='uid', null=False, primary_key=True, verbose_name='用户id')
    userName = models.CharField(db_column='user_name', max_length=20, default='游客用户', null=False, verbose_name='用户名')
    userDes = models.CharField(db_column='user_des', max_length=50, default='这个人很懒，没有留下简介', null=False, verbose_name='用户简介')
    projectNum = models.IntegerField(db_column='project_num', default=0, null=False, verbose_name='用户拥有的检测项目数')
    createDate = models.DateField(db_column='create_date', null=False, auto_now_add=True, verbose_name='用户注册时间')
    authority = models.IntegerField(db_column='authority', default=0, null=False, choices=AUTH_TYPE, verbose_name='用户权限')
    description = models.CharField(db_column='description', null=True, verbose_name='备注')

    class Meta:
        db_table = 'user'


class LoginData(models.Model):
    uid = models.OneToOneField(User, models.CASCADE, null=False, db_column='uid', primary_key=True)
    password = models.CharField(db_column='password', null=False, max_length=20)

    class Meta:
        db_table = 'login_data'


class Project(models.Model):
    STATUS_TYPE = (
        (0, 'Todo'),  # 待进行
        (1, 'Doing'),  # 进行中
        (2, 'Done')  # 已完成
    )

    pid = models.AutoField(db_column='pid', null=False, primary_key=True, verbose_name='检测项目id')
    projectName = models.CharField(db_column='project_name', max_length=20, default='新项目', null=False, verbose_name='检测项目名称')
    videoFile = models.CharField(db_column='video_file', max_length=50, null=False, verbose_name="检测项目文件名")
    projectStatus = models.IntegerField(db_column='project_status', null=False, default=0, choices=STATUS_TYPE, verbose_name="检测项目当前状态, 0未启动, 1进行中, 2已完成")
    uid = models.ForeignKey(User, models.CASCADE, db_column='uid', null=False, verbose_name="检测项目所属用户")
    description = models.CharField(db_column='description', null=True, verbose_name='备注')

    class Meta:
        db_table = 'project'
