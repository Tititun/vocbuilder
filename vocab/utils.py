from collections import defaultdict
import logging
import re
import sqlite3
import traceback
from typing import List, Tuple
from django.db.models import Count

import django
django.setup()

from vocab.scrapers.webster import scrape_webster
from vocab.models import (
    Authors, Book, Definition, DictRecord, Derived, Etymology, ExampleUsage,
    Inflection, Sense, SenseExample, SenseLabel, SenseUsageNote, SenseSequence,
    Usage, Word
)


logger = logging.getLogger('VOCAB_UTILS')
logging.basicConfig(encoding='utf-8', level=logging.INFO)
logging.getLogger('WEBSTER_SCRAPER').setLevel(logging.WARNING)


def fetch_or_create(model, **kwargs):
    """create an object for given model with kwargs"""
    obj, created = model.objects.get_or_create(**kwargs)
    if created:
        obj.save()
    return obj


def is_sqlite(file):
    """check if file is sqlite3 database"""
    con = sqlite3.connect(file)
    cur = con.cursor()
    try:
        cur.execute("PRAGMA integrity_check")
        return True
    except sqlite3.DatabaseError:
        con.close()
        return


def read_db(path: str, num_rows: int = None,
            word: str = None, rand: bool = False) -> List[List[Tuple[str]]]:
    """
    read the sqlite3 database and return a list of tuples with values:
    stem, title, authors, word, usage
    """
    context = {}
    conn = sqlite3.connect(path)
    cursor = conn.cursor()
    if word:
        context['word'] = word
        statement = '''
        select w.stem, bi.title, bi.authors, w.word, l."usage", ROW_NUMBER() OVER()
        from LOOKUPS l JOIN WORDS w ON l.word_key = w.id 
        JOIN BOOK_INFO bi ON l.book_key = bi.id
        WHERE w.stem = :word AND w.lang = 'en';
        '''
    else:
        statement = '''
        select w.stem, bi.title, bi.authors, w.word, l."usage", ROW_NUMBER() OVER()
        from LOOKUPS l JOIN WORDS w ON l.word_key = w.id 
        JOIN BOOK_INFO bi ON l.book_key = bi.id WHERE w.lang = 'en'
        '''
        if rand:
            statement += ' order by RANDOM()'
    cursor.execute(statement, context)
    result = cursor.fetchall()[:num_rows]
    cursor.close()
    conn.close()
    return result


# def fetch_db_data(words):


def commit_to_db(stem: str, title: str, authors: str, word_orig: str,
                         usage: str):
    logger.debug('commit_to_db is called with argumments:\n'
                 f'stem: {stem}\n'
                 f'title: {title}\n'
                 f'authors: {authors}\n'
                 f'word: {word_orig}\n'
                 f'usage: {usage}\n')
    word = fetch_or_create(Word, stem=stem)
    authors = fetch_or_create(Authors, name=authors)
    book = fetch_or_create(Book, title=title, authors=authors)
    fetch_or_create(Usage, context_word=word_orig, usage=usage.strip(),
                    word=word, book=book)
    dict_record, created = DictRecord.objects.get_or_create(
        word=word,
        dictionary_id=1
    )
    return dict_record, created


def create_vocab_objects(word, dict_record) -> bool:
    try:
        logger.info('new dictionary record created. Trying scraping...')
        data = scrape_webster(word)
        if not data:
            logger.error('scraping failed')
            dict_record.error_fetching = True
            dict_record.save()
            return False
        logger.info('successfully scraped the definition')
        dict_record.pronunciation=', '.join(data['pronunciations'])
        dict_record.did_you_know_header=data['did_you_know']['header']
        dict_record.did_you_know=data['did_you_know']['text']
        dict_record.url=data['url']
        dict_record.save()
        for etymology in data['etymologies']:
            Etymology.objects.create(
                etymology=etymology['etymology'],
                part_of_speech=etymology['part_of_speech'],
                dict_record=dict_record
            )
        for example in data['examples']:
            ExampleUsage.objects.create(
                text=example,
                dict_record=dict_record
            )
        for derived in data['derived']:
            Derived.objects.create(
                text=derived['text'],
                pronunciation=derived['pronunciation'],
                part_of_speech=derived['part_of_speech'],
                dict_record=dict_record
            )
        for entry in data['entries']:
            definition = Definition.objects.create(
                part_of_speech=entry['part_of_speech'],
                dict_record=dict_record
            )
            for inflection in entry['inflections']:
                Inflection.objects.create(
                    inflection=inflection,
                    definition=definition
                )
            for sseq_dict in entry['sense_sequences']:
                sense_sequence = SenseSequence.objects.create(
                    role=sseq_dict['role'],
                    definition=definition
                )
                for sense_dict in sseq_dict['senses']:
                    sense = Sense.objects.create(
                        definition=sense_dict['definition'],
                        letter=sense_dict['letter'],
                        sense_sequence=sense_sequence
                    )
                    for sense_example in sense_dict['examples']:
                        SenseExample.objects.create(
                            text=sense_example,
                            sense=sense
                        )
                    for sense_label in sense_dict['labels']:
                        SenseLabel.objects.create(
                            label=sense_label,
                            sense=sense,
                        )
                    for usage_note in sense_dict['usage_notes']:
                        SenseUsageNote.objects.create(
                            usage_note=usage_note,
                            sense=sense,
                        )
        logger.info('successfully created database entries')
        return True
    except:
        logger.error(f'Error in {word}')
        logger.error(traceback.format_exc())
        dict_record.error_fetching = True
        dict_record.save()
        return False


def get_definitions(records):
    data = {}
    failed_count = 0
    words = defaultdict(lambda: {
            'usages': [],
            'definitions': []
        })
    word_definitions = {
        w.stem: {
            'definitions': [
                 {'sense_key': s.id,
                  'sense_definition': s.definition,
                  'tags': [t.label for t in s.senselabel_set.all()
                           if t not in ['see usage paragraph below']],
                  'letter': s.letter}
                  for dr in w.dictrecord_set.all()
                  for df in dr.definition_set.all()
                  for ss in df.sensesequence_set.all()
                  for s in ss.sense_set.all()],
            'etymologies': [
                {'etymology': e.etymology,
                 'part_of_speech': e.part_of_speech}
                for dr in w.dictrecord_set.all()
                for e in dr.etymology_set.all()
            ],
            'examples': [
                ex.text
                for dr in w.dictrecord_set.all()
                for ex in dr.exampleusage_set.all()
            ],
            'pron': w.dictrecord_set.all()[0].pronunciation,
            'failed': w.dictrecord_set.all()[0].error_fetching
        }
        for w in
        Word.objects
            .filter(stem__in=[r[0] for r in records])
            .prefetch_related(
            'dictrecord_set__definition_set__sensesequence_set__sense_set__senselabel_set',
            'dictrecord_set__etymology_set',
            'dictrecord_set__exampleusage_set',
        )
        }

    for w, data in word_definitions.items():
        for sense in data['definitions']:
            definition = sense.get('sense_definition', '')
            match = re.search(
                r'(see\s(?P<gr>\w+)\s)?((?P<gr1>\w+)\s)?(entry\s\d+\D?\s)?'
                r'(?P<gr2>(\w+)\s)?sense\s(transitive\s)?\d+[a-z]?(\(\d\))?',
                definition)
            if match:
                for group in ['gr', 'gr1', 'gr2']:
                    linked_word = match.group(group)
                    if linked_word:
                        sense['linked_group'] = match.group()
                        sense['linked_word'] = 'https://www.merriam-webster.com/dictionary/' + linked_word
                        break
    books = set()
    books_count = defaultdict(int)
    seen = set()
    book_authors = set()
    for stem, title, authors, word, usage, id_ in records:
        words[stem]['usages'].append({
            'usage': usage,
            'context': word,
            'book': {
                'title': title,
                'authors': authors
            }
        })
        books_count[title] += 1
        words[stem]['definitions'] = word_definitions.get(stem, {}).get('definitions', [])
        words[stem]['pron'] = word_definitions.get(stem, {}).get('pron', None)
        words[stem]['etymologies'] = word_definitions.get(stem, {}).get('etymologies', [])
        words[stem]['examples'] = word_definitions.get(stem, {}).get('examples', [])
        words[stem]['word_id'] = id_
        words[stem]['failed'] = word_definitions.get(stem, {}).get('failed')
        if stem in word_definitions and not words[stem]['definitions']:
            words[stem]['failed'] = True
        if words[stem]['failed'] and stem not in seen:
            failed_count += 1
        seen.add(stem)
        books.add(title)
        book_authors.add(authors)
    data['words'] = words
    data['books'] = sorted(list(books), key=lambda x: x.lower())
    data['book_authors'] = sorted(list(book_authors), key=lambda x: x.lower())
    data['books_count'] = books_count
    data['words_count'] = len(words)
    data['defined_words_count'] = sum(
        [1 if words[w]['definitions'] else 0 for w in words])
    data['failed_count'] = failed_count
    return data


def get_ranking():
    words = Word.objects.annotate(usage_count=Count('usage')).values_list(
        'stem', 'usage_count').order_by('-usage_count')[:15]
    return words



if __name__ == '__main__':
    from django.db import connection
    records = read_db('static/vocab/vocab.db', num_rows=None)
    # print(records)
    get_definitions(records)['words'].items()
    print(len(connection.queries))

    # Word.objects.all().annotate(sense_count=Count('dictrecord__definition__sensesequence__sense')).filter(sense_count=0).delete()
    # Word.objects.filter(dictrecord__error_fetching=1).delete()

    # words_to_del = set()
    # words = Word.objects.prefetch_related(
    #         'dictrecord_set__definition_set__sensesequence_set__sense_set')
    # for w in words:
    #     for dr in w.dictrecord_set.all():
    #         for df in dr.definition_set.all():
    #             for sseq in df.sensesequence_set.all():
    #                 for s in sseq.sense_set.filter(definition__regex='such as$'):
    #                     print(s.definition)
    #                     words_to_del.add(w.id)
    #                     print(w.stem)
    # print(words_to_del)
    # Word.objects.filter(stem='Oriental').delete()
