from django.db import models


# Create your models here.
class User(models.Model):
    AUTH_TYPE = (
        (0, "Normal User"),  # 普通用户
        (1, 'Admin'),  # 管理员
    )

    uid = models.AutoField(db_column='uid', null=False, primary_key=True, verbose_name='用户id')
    userName = models.CharField(db_column='user_name', max_length=20, default='游客用户', null=False, verbose_name='用户名')
    userDes = models.CharField(db_column='user_des', max_length=50, default='这个人很懒，没有留下简介', null=False, verbose_name='用户简介')
    createDate = models.DateField(db_column='create_date', null=False, auto_now_add=True, verbose_name='用户注册时间')
    authority = models.IntegerField(db_column='authority', default=0, null=False, choices=AUTH_TYPE, verbose_name='用户权限')
    description = models.CharField(db_column='description', max_length=50, null=True, verbose_name='备注')

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
    videoFile = models.CharField(db_column='video_file', max_length=50, null=False, verbose_name="检测项目文件名，保存路径为/media/<pid>_<projectName>/<videoFile>")
    projectStatus = models.IntegerField(db_column='project_status', null=False, default=0, choices=STATUS_TYPE, verbose_name="检测项目当前状态, 0未启动, 1进行中, 2已完成")
    taskId = models.CharField(db_column='task_id', max_length=36, null=True, verbose_name='检测线程taskId')
    uid = models.ForeignKey(User, models.CASCADE, db_column='uid', null=False, verbose_name="检测项目所属用户")
    description = models.CharField(db_column='description', max_length=50, null=True, verbose_name='备注')

    class Meta:
        db_table = 'project'
