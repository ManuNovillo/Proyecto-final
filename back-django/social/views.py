from django.http import JsonResponse
from django.core.paginator import Paginator
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_http_methods
from functools import wraps

import jwt
from jwt import InvalidTokenError

import os


SECRET_KEY = os.getenv('SECRET_KEY_SUPABASE')
ALGORITHM = "HS256"
AUDIENCE = "authenticated"

def verify_supabase_token(token):
    if SECRET_KEY is None:
        return None
    try:
        decoded = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            audience=AUDIENCE
        )
        return decoded  # contiene el sub (id del usuario), email, etc.
    except InvalidTokenError as e:
        print("Token inválido:", str(e))
        return None
from social.serializers import PostSerializer, UserSerializer, CommentSerializer
from social.models import Post, User, Comment



def require_supabase_token(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        auth = request.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            return JsonResponse({'error': 'Token no encontrado'}, status=401)
        token = auth.split(' ')[1]
        payload = verify_supabase_token(token)
        if not payload:
            return JsonResponse({'error': 'Token inválido'}, status=401)
        request.user_payload = payload
        return view_func(request, *args, **kwargs)
    return wrapper


@require_http_methods(["POST"])
def create_user(request):
    serializer = UserSerializer(data=request.POST)
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

