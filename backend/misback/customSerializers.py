from rest_framework import serializers
from misback.models import User, LoginData, Project
from misback import models
from django.db.models import Q
from misback.utils import get_media_file_url, get_point_list


class UserSerializer(serializers.ModelSerializer):
    # readonly for user
    userProjectNum = serializers.SerializerMethodField()

    def get_userProjectNum(self, obj: User):
        return models.Project.objects.filter(Q(uid=obj.uid)).count()

    class Meta:
        model = User
        fields = '__all__'


class LoginDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginData
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
    # readonly for project
    projectHeatmapUrl = serializers.SerializerMethodField()
    projectThumbUrl = serializers.SerializerMethodField()
    projectRawVideoUrl = serializers.SerializerMethodField()
    projectResultVideoUrl = serializers.SerializerMethodField()
    projectResultPointList = serializers.SerializerMethodField()

    def get_projectHeatmapUrl(self, obj: Project):
        return get_media_file_url(obj, "heatmap.jpg")

    def get_projectThumbUrl(self, obj: Project):
        return get_media_file_url(obj, "raw.jpg")

    def get_projectRawVideoUrl(self, obj: Project):
        return get_media_file_url(obj=obj, file_name=obj.videoFile)

    def get_projectResultVideoUrl(self, obj: Project):
        return get_media_file_url(obj=obj, file_name="{pid}_{projectName}_result.avi".format(pid=obj.pid, projectName=obj.projectName))

    def get_projectResultPointList(self, obj: Project):
        return get_point_list(obj)

    class Meta:
        model = Project
        fields = '__all__'


# 如何添加只读字段
# class PersonalProfileSerializer(serializers.ModelSerializer):
#     # 为头像URL生成一个只读字段，返回给前端
#     avatarUrl = serializers.SerializerMethodField("GetAvatarUrl")

#     # DRF对于只读字段SerializerMethodField的生成函数
#     def GetAvatarUrl(self, obj):
#         return "http://47.112.227.85" + obj.avatar.url

#     class Meta:
#         model = PersonalProfile
#         fields = '__all__'
