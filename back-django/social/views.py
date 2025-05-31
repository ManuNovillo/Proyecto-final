from django.http import JsonResponse
from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.decorators import api_view

import jwt
from jwt import InvalidTokenError

from social.serializers import PostSerializer, UserSerializer, UserCreateSerializer, PostCreateSerializer
from social.models import Post, User

import os

from datetime import datetime, timezone


SECRET_KEY = os.getenv('SECRET_KEY_SUPABASE')
ALGORITHM = "HS256"
AUDIENCE = "authenticated"

POSTS_PER_PAGE = 5

def get_token_data(token):
    if SECRET_KEY is None:
        return None
    try:
        decoded = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            audience=AUDIENCE,
            leeway=10
        )
        return decoded
    except InvalidTokenError as e:
        print("Invalid token")
        return None


def get_user_from_token(request):
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return None
    token = auth.split(' ')[1]
    token_data = get_token_data(token)
    if token_data is None:
        print("Token data is None")
        return None
    supabase_id = token_data.get('sub')
    if supabase_id is None:
        print("Supabase ID is None")
        return None
    try:
        user = User.objects.get(supabase_id=supabase_id, deleted=False)
        return user
    except User.DoesNotExist:
        print("User does not exist")
        return None
    
@api_view(["POST"])
def create_user(request):
    print(request.data)
    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse(serializer.data, status=201)
    print(serializer.errors)
    return JsonResponse(serializer.errors, status=400)


@api_view(["GET"])
def get_latest_posts(request):
    milliseconds = int(request.GET.get('date'))
    print("Milliseconds", milliseconds)
    date = datetime.fromtimestamp(milliseconds / 1000, timezone.utc) 
    print(date)
    queryset = Post.objects.filter(deleted=False)
    if date:
        queryset = queryset.filter(date_uploaded__lt=date)
    posts = queryset.order_by('-date_uploaded')[:POSTS_PER_PAGE]
    serializer = PostSerializer(posts, many=True)
    return JsonResponse(serializer.data, safe=False)


@api_view(["GET"])
def get_latest_posts_following(request):
    print("following")
    user = get_user_from_token(request)
    print(user)
    if user is None:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    milliseconds = int(request.GET.get('date'))
    date = datetime.fromtimestamp(milliseconds / 1000, timezone.utc) 
    print(date)
    queryset = Post.objects.filter(user__in=user.following.all(), deleted=False)
    if date:
        queryset = queryset.filter(date_uploaded__lt=date)
    posts = queryset.order_by('-date_uploaded')[:POSTS_PER_PAGE]
    serializer = PostSerializer(posts, many=True)
    return JsonResponse(serializer.data, safe=False)


@api_view(["GET"])
def get_user_by_supabase_id(request, supabase_id):
    user = get_object_or_404(User, supabase_id=supabase_id, deleted=False)
    serializer = UserSerializer(user)
    return JsonResponse(serializer.data, safe=False)


@api_view(["GET"])
def get_user_posts(request, id):
    user = get_object_or_404(User, id=id, deleted=False)
    milliseconds = int(request.GET.get('date'))
    date = datetime.fromtimestamp(milliseconds / 1000, timezone.utc) 
    print(date)
    queryset = Post.objects.filter(user=user, deleted=False)
    if date:
        queryset = queryset.filter(date_uploaded__lt=date)
    posts = queryset.order_by('-date_uploaded')[:POSTS_PER_PAGE]
    serializer = PostSerializer(posts, many=True)
    return JsonResponse(serializer.data, safe=False)


@api_view(["POST"])
def create_post(request):
    print(request.data)
    print("dadad")
    user = get_user_from_token(request)
    if (user is None):
        return JsonResponse({"error": "Unauthorized"}, status=401)
    serializer = PostCreateSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse(serializer.data, status=201)
    print(serializer.errors)
    return JsonResponse(serializer.errors, status=400)


@api_view(["PUT"])
def update_user_profile(request, id):
    print(id)
    print(User.objects.filter(id=id, deleted=False).values())
    user = get_object_or_404(User, id=id, deleted=False)
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return JsonResponse(serializer.data, status=200)
    return JsonResponse(serializer.errors, status=400)


@api_view(["GET"])
def get_user_by_nickname(request, nickname):
    print(nickname)
    print("dadadd")
    user = get_object_or_404(User, nickname__iexact=nickname, deleted=False)
    serializer = UserSerializer(user)
    return JsonResponse(serializer.data, safe=False)

@api_view(["PUT"])
def like_post(request, id):
    user = get_user_from_token(request)
    if (user is None):
        return JsonResponse({"error": "Unauthorized"}, status=401)
    post = get_object_or_404(Post, id=id, deleted=False)
    post.likes += 1
    post.save()
    return Response({"likes": post.likes}, status=200)

@api_view(["PUT"])
def follow_user(request, id):
    user = get_user_from_token(request)
    if (user is None):
        return JsonResponse({"error": "Unauthorized"}, status=401)
    user_to_follow = get_object_or_404(User, id=id, deleted=False)
    if user_to_follow in user.following.all():
        return JsonResponse({"error": "Already following"}, status=400)
    user.following.add(user_to_follow)
    user.save()
    return Response({"message": "Following user"}, status=200)

@api_view(["PUT"])
def unfollow_user(request, id):
    user = get_user_from_token(request)
    if (user is None):
        return JsonResponse({"error": "Unauthorized"}, status=401)
    user_to_unfollow = get_object_or_404(User, id=id, deleted=False)
    if user_to_unfollow not in user.following.all():
        return JsonResponse({"error": "Not following"}, status=400)
    user.following.remove(user_to_unfollow)
    user.save()
    return Response({"message": "Unfollowed user"}, status=200)