from django.http import JsonResponse
from django.core.paginator import Paginator
from social.serializers import PostSerializer

from social.models.post_model import Post

def get_latest_posts(request):
    paginator = Paginator(Post.objects.filter(deleted=False).order_by('date_uploades').values(), 20)
    page = request.GET.get('page')
    posts = paginator.get_page(page).object_list
    serializer = PostSerializer(posts, many=True)
    return JsonResponse(serializer.data, safe=False)
