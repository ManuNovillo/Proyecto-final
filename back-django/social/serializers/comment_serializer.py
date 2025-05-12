from .user_serializer import UserSerializer
from rest_framework import serializers


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = 'Comment'
        fields = '__all__'

class CommentCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = 'Comment'
        exclude = ['deleted']
        