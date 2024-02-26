from django.db import models
from django.contrib.auth.models import User


class Service(models.Model):
    service_name = models.CharField("Назва послуги", max_length=50)
    service_picture = models.ImageField("Фото приблизного результату", upload_to="services")
    intro = models.TextField("Коротко про послугу", max_length=1000)
    price = models.IntegerField("Ціна послуги (грн)", default=None)
    service_time = models.IntegerField("Тривалість послуги (хв)", default=60)
    first_description = models.CharField("Характеристика 1", max_length=50)
    second_description = models.CharField("Характеристика 2", max_length=50)
    third_description = models.CharField("Характеристика 3", max_length=50)

    def __str__(self):
        return self.service_name

    class Meta:
        app_label = 'masters'
        verbose_name = "Послуга"
        verbose_name_plural = "Послуги"
