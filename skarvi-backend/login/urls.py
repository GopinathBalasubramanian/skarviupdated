from django.urls import path
from .views import LoginAPIView, LogoutView 

urlpatterns = [
    path('login/token/', LoginAPIView.as_view(), name='token_obtain_pair'),
    path('auth/logout/', LogoutView.as_view(), name='token_blacklist'), 
]
