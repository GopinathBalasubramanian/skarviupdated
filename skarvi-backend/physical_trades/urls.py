from django.urls import path
from .views import SellerTransactionSprView


urlpatterns = [
    path('api/save-trade', SellerTransactionSprView.as_view(), name='save-trade'),

]