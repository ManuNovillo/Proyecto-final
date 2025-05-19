from rest_framework import serializers
from social.models import User

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = '__all__'


class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ['deleted', 'profile_picture', 'following', 'description']

