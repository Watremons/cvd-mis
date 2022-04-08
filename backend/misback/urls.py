from django.urls import path
from rest_framework.routers import DefaultRouter
from misback import views

router = DefaultRouter()

urlpatterns = [
    # log_in(login)根据账号密码登陆
    path('login/', views.log_in, name='login'),
    # log_out(logout)登出当前账号
    path('logout/', views.log_out, name='logout'),
    # get_now_user(now-user)获取当前登录的用户信息
    path('now-user/', views.get_now_user, name='now-user'),

    # 运行检测模型
    path('run-detect/', views.run_detect, name='run-detect'),

    # 以下为对任意模型的增删改查

    # 无参数：get=list all,post=create new
    path('user', views.UserViewSet.as_view({'get': 'list', 'post': 'create'})),
    # 有参数：get=retrieve one,put=partial_update one,delete=delete one
    path('user/<int:pk>/', views.UserViewSet.as_view({'get': 'retrieve', 'put': 'partial_update', 'delete': 'destroy'})),

    # 无参数：get=list all,post=create new
    path('logindata', views.LoginDataViewSet.as_view({'post': 'create'})),
    # 有参数：get=retrieve one,put=partial_update one,delete=delete one
    path('logindata/<int:pk>/', views.LoginDataViewSet.as_view({'get': 'retrieve', 'put': 'partial_update'})),

    # 无参数：get=list all,post=create new
    path('project', views.ProjectViewSet.as_view({'get': 'list', 'post': 'create'})),
    # 有参数：get=retrieve one,put=partial_update one,delete=delete one
    path('project/<int:pk>/', views.ProjectViewSet.as_view({'get': 'retrieve', 'put': 'partial_update', 'delete': 'destroy'})),
]
