from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('users', 'users.views.UserViewSet', basename='user')

