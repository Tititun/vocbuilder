from django.http import HttpRequest, JsonResponse
from django.shortcuts import render


def index(request: HttpRequest):
    if request.method == 'POST':
        print(request.POST)
        print(request.FILES)
        return JsonResponse({'success': 'success'})
    return render(request, 'vocab/main.html')
