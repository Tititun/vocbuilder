import logging
from pprint import pprint
import re
from typing import Optional

from bs4 import BeautifulSoup
import requests


logger = logging.getLogger('WEBSTER_SCRAPER')
logging.basicConfig(encoding='utf-8', level=logging.INFO)


HEADERS = {
    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:125.0) Gecko/'
                  '20100101 Firefox/125.0',
}

my_dict = {}


def scrape_webster(word: str) -> Optional[dict]:
    """Scrape the given word on https://www.merriam-webster.com"""

    link = 'https://www.merriam-webster.com/dictionary/' + word
    logger.info(f'getting {link}')
    response = requests.get(link, headers=HEADERS)
    if not response.ok:
        logger.exception(f'Error in response for {word}')
        return
    data = {'derived': [], 'url': link}
    soup = BeautifulSoup(response.text, 'html.parser')

    word = soup.select_one('.hword').text
    data['word'] = word
    logger.info(f'word: {word}')

    pronunciations = soup.select_one('.prons-entries-list-inline')
    if pronunciations:
        pronunciations = [a.text.strip() for a in pronunciations.select('a')]
        data['pronunciations'] = pronunciations
    logger.info(f'pronunciations: {pronunciations}')

    dict_entries = soup.select('div[id^=dictionary-entry-]')
    logger.info(f'found {len(dict_entries)} dict entries')
    data['entries'] = []
    for idx, entry in enumerate(dict_entries):
        logger.info(f'parsing entry №{idx}')
        entry_record = {'sense_sequences': []}
        part_of_speech = entry.select_one('.parts-of-speech')
        if part_of_speech:
            part_of_speech = part_of_speech.text
            match = re.search(r'([^(]*)\(?', part_of_speech)
            if match:
                part_of_speech = match.groups()[0].strip()
            entry_record['part_of_speech'] = part_of_speech
        logger.info(f'part of speech: {part_of_speech}')
        inflections = entry.select('.if')
        if inflections:
            inflections = [infl.text.strip() for infl in inflections]
        entry_record['inflections'] = inflections
        logger.info(f'inflections: {inflections}')

        ssqs = entry.select('.vg')
        logger.info(f'found {len(dict_entries)} sense sequences')
        for idx_ssq, ssq in enumerate(ssqs):
            ssq_record = {'senses': []}
            logger.info(f'parsing sense sequence №{idx_ssq}')
            role = ssq.select_one('p.vd')
            if role:
                role = role.text
            ssq_record['role'] = role
            logger.info(f'role: {role}')

            senses = ssq.select('.vg-sseq-entry-item')
            logger.info(f'found {len(senses)} senses')

            for idx_sense, sense in enumerate(senses):
                logger.info(f'parsing sense №{idx_sense}')
                sense_definitions = sense.select('.sense')
                logger.info(f'found {len(sense_definitions)} sense definitions')
                for idx_sd, sd in enumerate(sense_definitions):
                    logger.info(f'parsing sense definition №{idx_sd}')
                    definition = sd.select_one('.dtText')
                    if definition:
                        definition = definition.text.lstrip(': ')
                    logger.info(f'definition: {definition}')
                    sd_examples = sd.select('.sub-content-thread')
                    if sd_examples:
                        sd_examples = [s.text.strip() for s in sd_examples]
                    logger.info(f'sense definition examples: {sd_examples}')
                    labels = sd.select('.sl')
                    if labels:
                        labels = [l.text.strip() for l in labels]
                        logger.info(f'labels: {labels}')
                    usage_notes = sd.select('.un')
                    if usage_notes:
                        usage_notes = [un.text.strip() for un in usage_notes]
                        logger.info(f'usage notes: {usage_notes}')
                    ssq_record['senses'].append({
                        'definition': definition,
                        'examples': sd_examples,
                        'labels': labels,
                        'usage_notes': usage_notes
                    })
            entry_record['sense_sequences'].append(ssq_record)

        derived = entry.select('.uro')
        if derived:
            logger.info(f'found {len(derived)} derived words')
            for idx_der, der in enumerate(derived):
                logger.info(f'parsing derived №{idx_der}')
                text = der.select_one('.ure')
                if text:
                    text = text.text
                logger.info(f'text: {text}')
                pron = der.select_one('.prons-entry-list-item')
                if pron:
                    pron = pron.text.strip()
                logger.info(f'pronunciation: {pron}')
                part_of_speech = der.select_one('.fl')
                if part_of_speech:
                    part_of_speech = part_of_speech.text
                    logger.info(f'part of speech: {part_of_speech}')
                data['derived'].append({
                    'pronunciation': pron,
                    'text': text,
                    'part_of_speech': part_of_speech
                })
        data['entries'].append(entry_record)

    examples = soup.select('#examples .in-sentences-container'
                           ' .sub-content-thread')
    if examples:
        examples = [ex.text.strip() for ex in examples]
        data['examples'] = examples
        logger.info(f'examples: {examples}')

    etymologies = soup.select('#word-history .et')
    data['etymologies'] = []
    for ety in etymologies:
        prev = ety.findPreviousSibling()
        part_of_speech = None
        if prev:
            if prev.name == 'p' and prev.get('class') == ['function-label']:
                part_of_speech = prev.text
                match = re.search(r'([^(]*)\(?', part_of_speech.lower())
                if match:
                    part_of_speech = match.groups()[0].strip()
        etymology = ety.text.strip()
        logger.info(f'etymology: {etymology}, part of speech: {part_of_speech}')
        data['etymologies'].append({
            'etymology': etymology,
            'part_of_speech': part_of_speech
        })

    did_you_now = soup.select_one('#did-you-know .content-section-body')
    did_you_now_header = text = None
    if did_you_now:
        text = ''
        header = did_you_now.select_one('.little-gems-sub-header')
        if header:
            did_you_now_header = header.text.strip()
        paragraphs = did_you_now.select('p')
        for p in paragraphs:
            if p == header:
                continue
            text += p.text
        text = text.strip()
    data['did_you_know'] = {
        'header': did_you_now_header,
        'text': text
    }
    return data


if __name__ == '__main__':
    scrape_webster('quixotical')
