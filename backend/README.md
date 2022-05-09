# CVD-MIS后端

## 0.简介

本系统（Cement Vibration Detection MIS）用于进行水泥振捣违规检测及相关信息的可视化展示

本部分为CVD-MIS后端部分

启动方式

```bash
# 后端服务器（原生轻量级wsgi服务器）
python manage.py runserver
# 后端服务器（asgi服务器daphne，用于支持eventstream）
daphne backend.asgi:application

# celery职程
celery -A backend worker -l info -P eventlet -c 1000
celery -A backend worker -l info -c 4
# 由于celery 4.x以上版本不支持windows10操作系统，因此需要降低版本到3.x版本或
# celery多职程
celery multi start w1 -A backend -l info --pidfile=../../celery/%n.pid \
                                        --logfile=../../celery/%n%I.log
```

停止方式

```bash
# 服务器可直接使用Ctrl+C停止
# celery职程可直接使用Ctrl+C停止
# celery多职程
celery multi stopwait w1 -A backend -l info
```

## 1.配置说明

### 1.1.模型运行相关配置

#### 1.1.1 GPU

Nvidia Geforce RTX 3060 Laptop

Nvidia驱动版本: 511.79 WHQL



#### 1.1.2 Pytorch

conda: 4.10.3

Anaconda: 2021.11版本

```bash
# Download latest version in tsinghua mirror source
# Installing: set environment variables manual instead of automatic
```



CUDA版本: 11.3

CUDA是显卡厂商NVIDIA推出的运算平台。 CUDA是一种由NVIDIA推出的通用并行计算架构，该架构使GPU能够解决复杂的计算问题。

```
# 1. Get the driver version of your GPU
https://www.nvidia.cn/Download/index.aspx?lang=cn

# 2. Get the cuda version by the corresponding driver version
https://docs.nvidia.com/cuda/cuda-toolkit-release-notes/index.html

# 3.Download the correct cuda toolkit
https://developer.nvidia.com/cuda-toolkit-archive
```



cuDNN版本：

NVIDIA cuDNN是用于深度神经网络的GPU加速库。它强调性能、易用性和低内存开销。

```bash
# Download by anaconda

```



pytorch版本:

```bash
# Set the tsinghua mirror source
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main/
conda config --set show_channel_urls yes
conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud//pytorch/

# install pytorch
conda install pytorch torchvision torchaudio cudatoolkit=11.3
```

检查pytorch和cuda是否可用

```python
import torch
torch.cuda.is_available()
# cuda是否可用

torch.cuda.device_count()
# 返回gpu数量

torch.cuda.get_device_name(0)
# 返回gpu名字，设备索引默认从0开始

torch.cuda.current_device()
# 返回当前设备索引
```

### 1.2.后端运行相关配置

Python版本：3.9.7（随anaconda安装）

需要包：
```
conda install django
conda install pymysql
conda install -c conda-forge djangorestframework
conda install -c conda-forge django-cors-headers
conda install -c conda-forge coreapi
conda install -c conda-forge django-filter
conda install -c conda-forge daphne
conda install -c conda-forge channels

pip install pycocotools
pip install pyheatmap
pip install celery
pip install eventlet
```

## 2.数据库设计

本部分为CVD-MIS后端数据库设计，分为user表，project表



### 2.1 user

| 字段名      | 字段类型    | 默认值                   | 可为空 | 键关系                     | 注释                 |
| ----------- | ----------- | ------------------------ | ------ | -------------------------- | -------------------- |
| uid         | int         |                          | False  | primary                    | 用户id               |
| user_name   | varchar(20) | 游客用户                 | False  |                            | 用户名               |
| user_des    | varchar(50) | 这个人很懒，没有留下简介 | True   |                            | 用户简介             |
| project_num | int         | 0                        | False  |                            | 用户拥有的检测项目数 |
| create_date | timestamp   | date.now()               | False  |                            | 用户注册时间         |
| aid         | int         | 0                        | False  | foregin(authority) cascade | 用户权限             |
| description | varchar(50) |                          | True   |                            | 备注                 |



### 2.2 login_data

| 字段名   | 字段类型    | 默认值 | 可为空 | 键关系                | 注释         |
| -------- | ----------- | ------ | ------ | --------------------- | ------------ |
| uid      | int         |        | False  | foregin(user) cascade | 引用的用户id |
| password | varchar(20) |        | False  |                       | 用户名       |



### 2.3 project

| 字段名         | 字段类型    | 默认值 | 可为空 | 键关系                | 注释                                    |
| -------------- | ----------- | ------ | ------ | --------------------- | --------------------------------------- |
| pid            | int         |        | False  | primary               | 检测项目id                              |
| project_name   | varchar(20) |        | False  |                       | 检测项目名称                            |
| video_file     | varchar(50) |        | False  |                       | 检测项目视频文件名                      |
| project_status | int         | 0      | False  |                       | 检测项目状态，0未启动，1进行中，2已完成 |
| description    | varchar(50) |        | True   |                       | 检测项目备注                            |
| uid            | int         |        | False  | foregin(user) cascade | 检测项目所属用户                        |





## 相关链接

[清华大学开源软件镜像站](https://mirrors.tuna.tsinghua.edu.cn/)

[CUDA](https://developer.nvidia.com/cuda-toolkit-archive)