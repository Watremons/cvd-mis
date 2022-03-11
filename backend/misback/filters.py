import django_filters

from misback.models import User


class UserFilter(django_filters.rest_framework.FilterSet):
    """
    个人信息过滤器
    """
    minAuth = django_filters.NumberFilter(field_name='authority', lookup_expr='gte')
    maxAuth = django_filters.NumberFilter(field_name='authority', lookup_expr='lte')

    class Meta:
        model = User
        fields = ['minAuth', 'maxAuth', 'state']
