from django.db import models

FILE_TYPE_CHOICES = [
    ('image', 'image'),
    ('video', 'video'),
    ('none', 'none'),
]

class Post(models.Model):
    text = models.TextField(null=True, blank=True)
    file = models.URLField(null=True, blank=True)
    deleted = models.BooleanField(default=False)
    date_uploaded = models.DateTimeField(auto_now_add=True)
    file_type = models.CharField(max_length=50, choices=FILE_TYPE_CHOICES)
    user = models.ForeignKey(
        'User',
        on_delete=models.PROTECT,
        related_name='posts'
    )

    class Meta:
        db_table = 'post'