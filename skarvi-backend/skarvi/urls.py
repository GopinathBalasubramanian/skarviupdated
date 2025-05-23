from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf.urls.static import static
from django.conf import settings

# Import for Swagger
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from rest_framework_simplejwt.views import TokenObtainPairView


schema_view = get_schema_view(
   openapi.Info(
      title="Your API Title",
      default_version='v1',
      description="API documentation for your project",
   ),
   public=True,
   permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('login.urls')), 
   #  path('paper_trades/', include('paper_trades.urls')),
   #  path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), 
   
   path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('paper_trades/', include('paper_trades.urls')),


    # Swagger and Redoc URLs
    re_path(r'^swagger/$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    re_path(r'^redoc/$', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
]
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
