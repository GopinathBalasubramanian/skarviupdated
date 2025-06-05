from django.urls import path
from .views import SellerTransactionSprView,BuyerTransactionSprView,SendInterimTransactionEmailView


urlpatterns = [
    path('api/save-trade', SellerTransactionSprView.as_view(), name='save-trade'),
    path('api/physical-trades/sold', SellerTransactionSprView.as_view(), name='physical_trades-sold'),
    path('api/physical-trades/bought', BuyerTransactionSprView.as_view(), name='physical-trades-bought'),
    path('api/send-interim-transaction-email', SendInterimTransactionEmailView.as_view(), name='send-interim-email'),


]