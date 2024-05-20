import json
import logging
import os
import traceback
import uuid
from django.http import HttpRequest, JsonResponse
from django.conf import settings
from django.shortcuts import redirect, render
from .utils import (is_sqlite, read_db, commit_to_db, create_vocab_objects,
                    get_definitions, get_ranking)

logger = logging.getLogger('IMAGE_SCRAPER')
logging.basicConfig(encoding='utf-8', level=logging.INFO)


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
    logger.info(f'requested word definition with POST data {request.POST}')
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
    logger.info(f'db path is {file_path}')
    records = read_db(file_path, word=word)
    logger.info(f'total records in db is {len(records)}')
    for record in records:
        logger.info('processing record')
        word, title, authors, word_ctx, usage, id_ = record
        try:
            dict_record, _ = commit_to_db(word, title, authors, word_ctx, usage)
            if dict_record.error_fetching:
                logger.error(f'Failed fetching the record')
                return JsonResponse(error_message)
        except:
            logger.error(traceback.format_exc())
            return JsonResponse(error_message)
    scraped = create_vocab_objects(word, dict_record)
    if not scraped:
        logger.error('Error in commiting the definition to db')
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
    if not data['definitions']:
        data['failed'] = True
    logger.info(f'returning JSON response with data: {data}')
    return JsonResponse(data)
