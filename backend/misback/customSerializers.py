from rest_framework import serializers
from misback.models import User, LoginData, Project
from misback import models
from django.db.models import Q


class UserSerializer(serializers.ModelSerializer):
    # readonly for user
    userProjectNum = serializers.SerializerMethodField()

    def get_userProjectNum(self, obj):
        return models.Project.objects.filter(Q(pid=obj.pid)).count()

    class Meta:
        model = User
        fields = '__all__'


class LoginDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginData
        fields = '__all__'


class ProjectSerializer(serializers.ModelSerializer):
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
