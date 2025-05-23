from rest_framework import serializers
from django.contrib.auth.models import User
from .models import HedgingSpr

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']

class HedgingSprSerializer(serializers.ModelSerializer):
    traded_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), allow_null=True)

    class Meta:
        model = HedgingSpr
        fields = '__all__'
