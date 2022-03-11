# from operator import itemgetter  #itemgetter用来去dict中的key，省去了使用lambda函数
# from itertools import groupby  #itertool还包含有其他很多函数，比如将多个list联合起来。。

# d1 = {'name': 'zhangsan', 'age': 20, 'country': 'China'}
# d2 = {'name': 'wangwu', 'age': 19, 'country': 'USA'}
# d3 = {'name': 'lisi', 'age': 22, 'country': 'JP'}
# d4 = {'name': 'zhaoliu', 'age': 22, 'country': 'USA'}
# d5 = {'name': 'pengqi', 'age': 22, 'country': 'USA'}
# d6 = {'name': 'lijiu', 'age': 22, 'country': 'China'}
# lst = [d1, d2, d3, d4, d5, d6]

# # 通过country进行分组：

# lst.sort(key=itemgetter('country'))  # 需要先排序，然后才能groupby。lst排序后自身被改变
# lstg = groupby(lst, itemgetter('country'))
# # lstg = groupby(lst,key=lambda x:x['country']) 等同于使用itemgetter()

# # for key,group in lstg:
# #     for g in group: #group是一个迭代器，包含了所有的分组列表
# #         print(key,g)

# result = dict([(key, list(group)) for key, group in lstg])
# print(result)
# wordlist = []
# for key in result:
#     word_to_box_list = []
#     for element in result[key]:
#         word_to_box_list.append(element)
#     wordlist.append({'word': key, "boxList": word_to_box_list})

# print(wordlist)

from hashlib import sha256
from django.conf import settings
import hmac
import base64
import jwt
import datetime


def get_sign(data):
    message = data.encode('utf-8')
    sign = base64.b64encode(hmac.new(settings.SECRET_KEY.encode('utf-8'), message, digestmod=sha256).digest())
    sign = str(sign, 'utf-8')
    print('Signature:', sign)
    return sign


if __name__ == "__main__":
    # get_sign("dadadas")
    SECRET_KEY = 'django-insecure-ugwq(&0%=l3jd=%#)3k!73#03q%4fdyb!1espeb*+6vga#ia*7'
    token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHBpcmUiOiIyMDIxLzA5LzAyIn0.Edm6LyFV6_ob5R3ix8QoY9vrWq3UyqBfkW6eUVSsKO8"
    now_user_id = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=['HS256']
    )['user_id']
    print(now_user_id)

    expire = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=['HS256']
    )['expire']
    print(expire)
    timestamp = (datetime.datetime.now() + datetime.timedelta(days=7)).timestamp()
    print()
