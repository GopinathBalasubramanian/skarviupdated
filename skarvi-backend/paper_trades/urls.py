from django.urls import path
from . import views
from rest_framework_simplejwt import views as jwt_views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('hedging/', views.HedgingAPIView.as_view(), name='hedging-create'),
    path('hedging/<int:id>', views.HedgingAPIView.as_view(), name='hedging-trades-detail'),
    path('hedging/list/', views.HedgingListAPIView.as_view(), name='hedging-list'),
    path('api/token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    # path('paper_trades/hedging/<int:id>/', views.HedgingAPIView.as_view(), name='hedging-detail'),

    path('hedging/duplicate/', views.HedgingDuplicateView.as_view(), name='hedging-duplicate'),
    path('upload-trades/', views.HedgingBulkUploadView.as_view(), name='hedging-upload'),
    # path('api/hedging-trades/', views.HedgingAPIView.as_view(), name='hedging-trades'),
]
