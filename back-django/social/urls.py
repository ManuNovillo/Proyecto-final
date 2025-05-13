from django.urls import path
from . import views

urlpatterns = [
    path('users/create', views.create_user),
    path('posts/latest', views.get_latest_posts),
    path('users/<int:supabase_id>/posts/', views.get_user_posts),
    path('users/<str:supabase_id>/', views.get_user_by_supabase_id),
    path('posts/<int:post_id>/comments/', views.get_post_comments),
    path('posts/upload', views.upload_post),
    path('posts/<int:post_id>/comments/create', views.upload_comment),
]