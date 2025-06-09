from django.urls import path
from .views import SellerTransactionSprView,BuyerTransactionSprView,SendInterimTransactionEmailView, CloneTransactionView,save_note,QuantityPositionSummary
from .views import (
    QuantityPositionSummaryListView,
    QuantityPositionDailyListView,
    QPESummaryListView,
    QPEDailyListView,
    VaRReportListView
)

urlpatterns = [
    path('api/save-trade', SellerTransactionSprView.as_view(), name='save-trade'),
    path('api/physical-trades/sold', SellerTransactionSprView.as_view(), name='physical_trades-sold'),
    path('api/physical-trades/bought', BuyerTransactionSprView.as_view(), name='physical-trades-bought'),
    path('api/send-interim-transaction-email', SendInterimTransactionEmailView.as_view(), name='send-interim-email'),
    path('api/clone-transaction', CloneTransactionView.as_view(), name='clone-transaction'),
    path('api/buyer_trades/save-note/', save_note, name='save-note'), 
    path("api/quantity-position-summary", QuantityPositionSummaryListView.as_view(), name="quantity-position-summary"),
    path("api/quantity-position-daily/", QuantityPositionDailyListView.as_view(), name="quantity-position-daily"),
    path("api/qpe-summary/", QPESummaryListView.as_view(), name="qpe-summary"),
    path("api/qpe-daily/", QPEDailyListView.as_view(), name="qpe-daily"),
    path("api/var-report/", VaRReportListView.as_view(), name="var-report"),





]