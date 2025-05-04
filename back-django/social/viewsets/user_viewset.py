from rest_framework import viewsets, permissions

from social.models import User

class UserViewSet(viewsets.ModelViewSet):

    queryset = User.objects.all()  
    serializer_class = UserSerializer
    

