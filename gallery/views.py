from django.shortcuts import render
from .models import Image


# Create your views here.
def main(request):
    images = Image.objects.all()
    columns = [[], [], []]
    for i, image in enumerate(images):
        columns[i % 3].append(image)
    return render(request, 'gallery/index.html', {'columns': columns})
