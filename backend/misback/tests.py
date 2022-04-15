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
    raw_str_list = ["[194,431]\n", "[194,431]\n", "[194,431]\n", "[194,431]\n"]
    points = [{'x': eval(raw_str)[0], 'y': eval(raw_str)[1]} for raw_str in raw_str_list]
    print(points)
