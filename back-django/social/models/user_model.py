from django.db import models
from django.core.validators import MinLengthValidator


class User(models.Model):
    email = models.EmailField(unique=True)
    nickname = models.CharField(max_length=30, unique=True)
    profile_picture = models.URLField()
    description = models.TextField(max_length=500, blank=True, null=True)
    deleted = models.BooleanField(default=False)
    supabase_id = models.CharField(unique=True, max_length=36, validators=[MinLengthValidator(36)])
    following = models.ManyToManyField('self', symmetrical=False, blank=True)

    class Meta:
        db_table = 'user'
