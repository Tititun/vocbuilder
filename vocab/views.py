import os
import uuid
from django.http import HttpRequest, JsonResponse
from django.conf import settings
from django.shortcuts import redirect, render
from .utils import is_sqlite


def index(request: HttpRequest):
    if request.method == 'POST':
        if db := request.FILES.get('db'):
            name = f'{uuid.uuid4()}.db'
            file_path = os.path.join(settings.MEDIA_ROOT, name)
            with open(file_path, 'wb') as f:
                f.write(db.read())
            if not is_sqlite(file_path):
                # TODO: add error message
                os.remove(file_path)
                return redirect('vocab:index')

        return JsonResponse({'success': 'success'})
    return render(request, 'vocab/main.html')
