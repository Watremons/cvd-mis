# 水泥振捣违规检测系统

## 0.简介

本系统（Cement Vibration Detection MIS）用于进行水泥振捣违规检测及相关信息的可视化展示

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

### 1.2.前端运行相关配置

### 1.3.后端运行相关配置

Python版本：3.9.7（随anaconda安装）

需要包：
```
conda install django
conda install pymysql
conda install -c conda-forge djangorestframework
conda install -c conda-forge django-cors-headers
conda install -c conda-forge coreapi
markdown
conda install -c conda-forge django-filter

pip install pycocotools
```

## 相关链接

[清华大学开源软件镜像站](https://mirrors.tuna.tsinghua.edu.cn/)

[CUDA](https://developer.nvidia.com/cuda-toolkit-archive)