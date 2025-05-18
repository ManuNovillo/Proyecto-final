from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = 'User'
        fields = '__all__'


class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = 'User'
        exclude = ['deleted', 'profile_picture', 'following', 'description']

