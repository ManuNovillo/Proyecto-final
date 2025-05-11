from django.db import models


class User(models.Model):
    email = models.EmailField(unique=True)
    nickname = models.CharField(max_length=30, unique=True)
    profile_picture = models.URLField()
    description = models.TextField(max_length=500, blank=True, null=True)
    deleted = models.BooleanField(default=False)
    supabase_id = models.IntegerField(unique=True)

    class Meta:
        db_table = 'user'
