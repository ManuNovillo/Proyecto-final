from django.http import JsonResponse
from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_http_methods
from django.db import connection
from functools import wraps

import jwt
from jwt import InvalidTokenError

from social.serializers import PostSerializer, UserSerializer, CommentSerializer, UserCreateSerializer, PostCreateSerializer, CommentCreateSerializer
from social.models import Post, User, Comment

import os


SECRET_KEY = os.getenv('SECRET_KEY_SUPABASE')
ALGORITHM = "HS256"
AUDIENCE = "authenticated"

def get_token_data(token):
    if SECRET_KEY is None:
        return None
    try:
        decoded = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            audience=AUDIENCE
        )
        return decoded
    except InvalidTokenError as e:
        return None


def get_user_from_token(request):
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return None
    token = auth.split(' ')[1]
    token_data = get_token_data(token)
    if token_data is None:
        return None
    supabase_id = token_data.get('sub')
    if supabase_id is None:
        return None
    try:
        user = User.objects.get(supabase_id=supabase_id, deleted=False)
        return user
    except User.DoesNotExist:
        return None
    
    
@require_http_methods(["POST"])
def create_user(request):
    serializer = UserCreateSerializer(data=request.POST)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse(serializer.data, status=201)
    return JsonResponse(serializer.errors, status=400)


@require_http_methods(["GET"])
def get_latest_posts(request):
    paginator = Paginator(Post.objects.filter(deleted=False).order_by('-date_uploaded').values(), 20)
    page = request.GET.get('page')
    posts = paginator.get_page(page).object_list
    serializer = PostSerializer(posts, many=True)
    return JsonResponse(serializer.data, safe=False)


@require_http_methods(["GET"])
def get_latest_posts_following(request):
    user = get_user_from_token(request)
    if user is None:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    paginator = Paginator(Post.objects.filter(deleted=False, user__in=user.following).order_by('-date_uploaded').values(), 20)
    page = request.GET.get('page')
    posts = paginator.get_page(page).object_list
    serializer = PostSerializer(posts, many=True)
    return JsonResponse(serializer.data, safe=False)

@require_http_methods(["GET"])
def get_user_by_supabase_id(request, supabase_id):
    user = get_object_or_404(User, supabase_id=supabase_id, deleted=False)
    serializer = UserSerializer(user)
    return JsonResponse(serializer.data, safe=False)


@require_http_methods(["GET"])
def get_user_posts(request, supabase_id):
    user = get_object_or_404(User, supabase_id=supabase_id, deleted=False)
    posts = Post.objects.filter(user=user, deleted=False).order_by('-date_uploaded')
    paginator = Paginator(posts, 10)
    page = request.GET.get('page')
    posts = paginator.get_page(page).object_list
    serializer = PostSerializer(posts, many=True)
    return JsonResponse(serializer.data, safe=False)


@require_http_methods(["GET"])
def get_post_comments(request, post_id):
    post = get_object_or_404(Post, id=post_id, deleted=False)
    comments = Comment.objects.filter(post=post, deleted=False).order_by('-date_uploaded')
    paginator = Paginator(comments, 10)
    page = request.GET.get('page')
    comments = paginator.get_page(page).object_list
    serializer = CommentSerializer(comments, many=True)
    return JsonResponse(serializer.data, safe=False)


@require_http_methods(["POST"])
@require_supabase_token
def upload_post(request):
    serializer = PostSerializer(data=request.POST)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse(serializer.data, status=201)
    return JsonResponse(serializer.errors, status=400)


@require_http_methods(["PUT"])
@require_supabase_token
def update_user_profile(request):
    user = get_object_or_404(User, id=request.POST.get('id'), deleted=False)
    serializer = UserSerializer(user, data=request.POST, partial=True)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse(serializer.data, status=200)
    return JsonResponse(serializer.errors, status=400)


@require_http_methods(["POST"])
@require_supabase_token
def upload_comment(request):
    serializer = CommentSerializer(data=request.POST)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse(serializer.data, status=201)
    return JsonResponse(serializer.errors, status=400)