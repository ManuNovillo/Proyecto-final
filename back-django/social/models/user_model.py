from . import File
from django.db import models


class User(models.Model):
    email = models.EmailField(unique=True)
    nickname = models.CharField(max_length=30, unique=True)
    profile_picture = models.ForeignKey(File, on_delete=models.PROTECT)
    deleted = models.BooleanField(default=False)
    firebase_id = models.IntegerField(unique=True)

    class Meta:
        db_table = 'user'
