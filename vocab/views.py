import json
import os
import traceback
import uuid
from django.http import HttpRequest, JsonResponse
from django.conf import settings
from django.shortcuts import redirect, render
from .utils import (is_sqlite, read_db, commit_to_db, create_vocab_objects,
                    get_definitions, get_ranking)


def index(request: HttpRequest):
    if request.method == 'POST':
        if db := request.FILES.get('db'):
            name = f'{uuid.uuid4().hex}.db'
            file_path = os.path.join(settings.MEDIA_ROOT, name)
            with open(file_path, 'wb') as f:
                f.write(db.read())
            if not is_sqlite(file_path):
                # TODO: add error message
                os.remove(file_path)
                return redirect('vocab:index')
        else:
            name = 'vocab'
            file_path = os.path.abspath('vocab/static/vocab/vocab.db')
        data = read_db(file_path, num_rows=None)
        data = get_definitions(data)
        return render(request, 'vocab/data_table.html', {'data': json.dumps(data),
                                                         'db_name': name,
                                                         'books': data['books'],
                                                         'books_count': data['books_count'],
                                                         'authors': data['book_authors']})
    ranking = get_ranking()
    return render(request, 'vocab/main.html', {'is_main': True,
                                               'ranking': ranking})


def word_definition(request: HttpRequest):
    print(request.POST)
    word = request.POST['word']
    word_id = request.POST['word_id']
    db_name = request.POST['db_name']
    if db_name == 'vocab':
        file_path = os.path.abspath('vocab/static/vocab/vocab.db')
    else:
        file_path = os.path.join(settings.MEDIA_ROOT, db_name)
    error_message = {
        'word': word,
        'word_id': word_id,
        'failed': True
    }
    records = read_db(file_path, word=word)
    for record in records:
        word, title, authors, word_ctx, usage, id_ = record
        try:
            dict_record, _ = commit_to_db(word, title, authors, word_ctx, usage)
            if dict_record.error_fetching:
                return JsonResponse(error_message)
        except:
            print(traceback.format_exc())
            return JsonResponse(error_message)
    scraped = create_vocab_objects(word, dict_record)
    if not scraped:
        return JsonResponse(error_message)
    word_data = get_definitions(records)['words'][word]
    data = {
        'word': word,
        'failed': word_data['failed'],
        'loading': False,
        'word_id': word_id,
        'definitions': word_data['definitions'],
        'pron': word_data['pron'],
        'etymologies': word_data['etymologies'],
        'examples': word_data['examples']
    }
    return JsonResponse(data)
