from rest_framework import serializers
from django.contrib.auth.models import User
from .models import SellerTransactionSpr, BuyerTransactionSpr, InterimTransactionSPR

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']
class SellerTransactionSprSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerTransactionSpr
        fields = '__all__'

class BuyerTransactionSprSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyerTransactionSpr
        fields = '__all__'

class BuyerTransactionSprSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyerTransactionSpr
        fields = '__all__'
        
class InterimTransactionSprSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterimTransactionSPR
        fields = '__all__'