from django.db import models
from masters.models import Master
from services.models import Service
from django.core.validators import FileExtensionValidator
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db.models.signals import post_delete
from django.dispatch import receiver
from PIL import Image as PilImage
import zipfile
import io


class Image(models.Model):
    master = models.ForeignKey(Master, related_name='photo_of_the_work',
                               on_delete=models.SET_NULL, null=True, blank=True)
    service = models.ForeignKey(Service, related_name='example', on_delete=models.SET_NULL, null=True, blank=True)
    image = models.FileField('Фото роботи', upload_to='gallery', help_text='.jpeg/.jpg, .png та .zip',
                             validators=[FileExtensionValidator(allowed_extensions=['jpeg', 'jpg', 'png', 'zip'])])
    thumbnail = models.FileField('Мініатюра', upload_to='gallery/thumbnails', null=True, blank=True)
    description = models.TextField('Короткий опис (до 100 символів)', max_length=100, null=True, blank=True)

    class Meta:
        app_label = 'masters'
        verbose_name = 'зображення'
        verbose_name_plural = 'Зображення'

    def save(self, *args, **kwargs):
        if self.image.name.endswith('.zip'):
            with zipfile.ZipFile(self.image.file, 'r') as zip_ref:
                for filename in zip_ref.namelist():
                    if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                        file_data = zip_ref.read(filename)
                        temp_path = default_storage.save('gallery/' + filename, ContentFile(file_data))

                        # Create a thumbnail
                        image = PilImage.open(io.BytesIO(file_data))
                        image.thumbnail((700, 700))  # Resize the image
                        thumbnail_io = io.BytesIO()
                        image.save(thumbnail_io, format='JPEG')
                        thumbnail_path = default_storage.save('gallery/thumbnails/' + filename, ContentFile(thumbnail_io.getvalue()))

                        img = Image(master=self.master, service=self.service, description=self.description,
                                    image=temp_path, thumbnail=thumbnail_path)
                        img.save()
        else:
            super().save(*args, **kwargs)

    def __str__(self):
        return self.image.url.split('/')[-1]


@receiver(post_delete, sender=Image)
def delete_image(sender, instance, **kwargs):
    instance.image.delete(False)
    if instance.thumbnail:
        instance.thumbnail.delete(False)
