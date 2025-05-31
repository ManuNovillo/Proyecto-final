from django.urls import path
from . import views

urlpatterns = [
    path('users/create/', views.create_user),
    path('posts/latest/', views.get_latest_posts),
    path('users/<int:id>/posts/', views.get_user_posts),
    path('users/<str:supabase_id>/', views.get_user_by_supabase_id),
    path('posts/create/', views.create_post),
    path('users/update/<int:id>/', views.update_user_profile),
    path('users/nickname/<str:nickname>/', views.get_user_by_nickname),
    path('posts/following', views.get_latest_posts_following),
    path('posts/<int:id>/like/', views.like_post),
    path('users/follow/<int:id>/', views.follow_user),
    path('users/unfollow/<int:id>/', views.unfollow_user)
]