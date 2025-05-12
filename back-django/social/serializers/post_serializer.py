from rest_framework import serializers

from .user_serializer import UserSerializer


class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = 'Post'
        fields = '__all__'

class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = 'Post'
        exclude = ['deleted', 'user', 'date_uploaded']