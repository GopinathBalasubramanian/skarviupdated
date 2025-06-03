from django.urls import path
from .views import SellerTransactionSprView


urlpatterns = [
    path('api/save-trade', SellerTransactionSprView.as_view(), name='save-trade'),
    path('api/physical-trades/sold', SellerTransactionSprView.as_view(), name='physical_trades-sold'),
    path('api/physical-trades/bought', SellerTransactionSprView.as_view(), name='physical-trades-bought'),

]