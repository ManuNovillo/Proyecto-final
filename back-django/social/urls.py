from django.urls import path
from . import views

urlpatterns = [
    path('users/create/', views.create_user),
    path('posts/latest/', views.get_latest_posts),
    path('users/<str:supabase_id>/posts/', views.get_user_posts),
    path('users/<str:supabase_id>/', views.get_user_by_supabase_id),
    path('posts/<int:post_id>/comments/', views.get_post_comments),
    path('posts/create/', views.create_post),
    path('posts/<int:post_id>/comments/create/', views.upload_comment),
    path('users/update/<int:id>/', views.update_user_profile),
    path('users/nickname/<str:nickname>/', views.get_user_by_nickname),
    path('posts/following', views.get_latest_posts_following)
]