from django.db import models
from main.models import CustomUser as User


class Master(models.Model):
    first_name = models.CharField("Ім'я майстра", max_length=50)
    last_name = models.CharField("Прізвище майстра", max_length=50)
    profile_picture = models.ImageField("Фото профілю", upload_to="masters")
    specializations = models.CharField("Спеціалізації майстра\n(вказати через кому)", max_length=100)
    intro = models.TextField("Коротко про себе", max_length=1000)
    date_of_joining = models.DateField("Дата початку роботи")
    calendar = models.CharField('ID календаря майстра', max_length=150)

    def __str__(self):
        return self.first_name + " " + self.last_name

    class Meta:
        verbose_name = "майстер"
        verbose_name_plural = "Майстри"

    def get_rating(self):
        reviews = self.reviews.all()
        if reviews.count() != 0:
            return round(sum([review.rating for review in reviews]) / reviews.count(), 1)
        return 'ще немає'


class Review(models.Model):
    master = models.ForeignKey(Master, related_name='reviews', on_delete=models.CASCADE)
    rating = models.IntegerField()
    content = models.TextField()
    created_by = models.ForeignKey(User, related_name='reviews', on_delete=models.CASCADE)
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return f'{self.created_by.first_name} {self.created_by.last_name} про ' \
               f'{self.master.first_name} {self.master.last_name} '

    class Meta:
        verbose_name = "Відгук"
        verbose_name_plural = "Відгуки"
