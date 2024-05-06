import logging
import sqlite3
import traceback

import django
django.setup()

from vocab.scrapers.webster import scrape_webster
from vocab.models import (
    Authors, Book, Definition, Dictionary, DictRecord, Derived, Etymology,
    ExampleUsage, Inflection, Sense, SenseExample, SenseLabel, SenseUsageNote,
    SenseSequence, Usage, Word
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


def create_vocab_objects(title: str, authors: str, word_orig: str, stem: str,
                         usage: str):
    try:
        logger.info('create_vocab_objects is called with argumments:\n'
                    f'title: {title}\n'
                    f'authors: {authors}\n'
                    f'word: {word_orig}\n'
                    f'stem: {stem}\n'
                    f'usage: {usage}\n')
        word = fetch_or_create(Word, stem=stem)
        authors = fetch_or_create(Authors, name=authors)
        book = fetch_or_create(Book, title=title, authors=authors)
        fetch_or_create(Usage, context_word=word_orig, usage=usage,
                        word=word, book=book)
        dict_record, created = DictRecord.objects.get_or_create(
            word=word,
            dictionary_id=1
        )
        if created:
            data = scrape_webster(stem)
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
            return True
        else:
            pass
    except:
        logger.error(f'Error in {word}')
        logger.error(traceback.format_exc())
        return False


if __name__ == '__main__':
    pass

