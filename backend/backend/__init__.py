from __future__ import absolute_import, unicode_literals
import pymysql
from .celery import app as celery_app

pymysql.version_info = (1, 4, 13, "final", 0)
pymysql.install_as_MySQLdb()

__all__ = ['celery_app']
