from django.db import models


class Post(models.Model):
    text = models.TextField(null=True, blank=True)
    file = models.URLField(null=True, blank=True)
    deleted = models.BooleanField(default=False)
    date_uploaded = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(
        'User',
        on_delete=models.PROTECT,
        related_name='posts'
    )

    class Meta:
        db_table = 'post'