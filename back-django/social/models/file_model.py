from django.db import models

class File(models.Model):

    class FileType(models.TextChoices):
        jpg = 'image/jpeg', 'image/jpeg'
        pbg = 'image/png', 'image/png'
        webp = 'image/webp', 'image/webp'
        gif = 'image/gif', 'image/gif'
        mp4 = 'video/mp4', 'video/mp4'

    data = models.BinaryField()
    type = models.CharField(max_length=100, choices=FileType.choices)

    class Meta:
        db_table = 'file'