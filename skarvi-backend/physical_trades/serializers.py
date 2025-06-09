from rest_framework import serializers
from django.contrib.auth.models import User
from .models import SellerTransactionSpr, BuyerTransactionSpr, InterimTransactionSPR
from .models import (
    QuantityPositionSummary,
    QuantityPositionDaily,
    QPESummary,
    QPEDaily,
    VaRReport,
    DailyM2MPnL
)


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
        
        



class QuantityPositionSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = QuantityPositionSummary
        fields = '__all__'


class QuantityPositionDailySerializer(serializers.ModelSerializer):
    class Meta:
        model = QuantityPositionDaily
        fields = '__all__'


class QPESummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = QPESummary
        fields = '__all__'


class QPEDailySerializer(serializers.ModelSerializer):
    class Meta:
        model = QPEDaily
        fields = '__all__'


class VaRReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = VaRReport
        fields = '__all__'


class DailyM2MPnLSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyM2MPnL
        fields = '__all__'
