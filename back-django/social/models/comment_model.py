from django.db import models


class Comment(models.Model):
    text = models.TextField()
    deleted = models.BooleanField(default=False)
    user = models.ForeignKey(
        'User',
        on_delete=models.PROTECT,
        related_name='comments'
    )
    post = models.ForeignKey(
        'Post',
        on_delete=models.PROTECT,
        related_name='comments'
    )

    class Meta:
        db_table = 'comment'