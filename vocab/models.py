from django.db import models
from django.db.models import UniqueConstraint


class Authors(models.Model):
    name = models.CharField(max_length=200, null=False, blank=False)


class Book(models.Model):
    title = models.CharField(max_length=200, null=False, blank=False)
    authors = models.ForeignKey(Authors, on_delete=models.CASCADE)


class Dictionary(models.Model):
    name = models.CharField(max_length=200, null=False, blank=False)
    language_from = models.CharField(max_length=2, null=False, blank=False)
    language_to = models.CharField(max_length=2, null=False, blank=False)

    class Meta:
        verbose_name_plural = "dictionaries"

    def __str__(self):
        return self.name


class Word(models.Model):
    stem = models.CharField(max_length=200, null=False, blank=False)


class Usage(models.Model):
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    context_word = models.CharField(max_length=200, null=False, blank=False)
    usage = models.TextField(blank=False, null=False)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)


class DictRecord(models.Model):
    dictionary = models.ForeignKey(Dictionary, on_delete=models.CASCADE)
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    pronunciation = models.CharField(max_length=200, null=True)
    did_you_know_header = models.CharField(max_length=100, null=True)
    did_you_know = models.TextField(null=True)
    url = models.CharField(max_length=200, null=False, blank=False)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            UniqueConstraint(fields=['dictionary', 'word'],
                             name='dict_word_unique')
        ]


class Definition(models.Model):
    dict_record = models.ForeignKey(DictRecord, on_delete=models.CASCADE)
    part_of_speech = models.CharField(max_length=100)


class Inflection(models.Model):
    definition = models.ForeignKey(Definition, on_delete=models.CASCADE)
    inflection = models.CharField(max_length=200, null=False, blank=False)


class SenseSequence(models.Model):
    definition = models.ForeignKey(Definition, on_delete=models.CASCADE)
    role = models.CharField(max_length=200, null=True)


class Sense(models.Model):
    sense_sequence = models.ForeignKey(SenseSequence, on_delete=models.CASCADE)
    definition = models.TextField(null=False, blank=False)


class SenseExample(models.Model):
    text = models.TextField(null=False, blank=False)
    sense = models.ForeignKey(Sense, on_delete=models.CASCADE)


class SenseLabel(models.Model):
    label = models.CharField(max_length=200, null=False, blank=False)
    sense = models.ForeignKey(Sense, on_delete=models.CASCADE)


class SenseUsageNote(models.Model):
    usage_note = models.CharField(max_length=200, null=False, blank=False)
    sense = models.ForeignKey(Sense, on_delete=models.CASCADE)


class Etymology(models.Model):
    dict_record = models.ForeignKey(DictRecord, on_delete=models.CASCADE)
    part_of_speech = models.CharField(max_length=100)
    etymology = models.TextField(null=False, blank=False)


class ExampleUsage(models.Model):
    dict_record = models.ForeignKey(DictRecord, on_delete=models.CASCADE)
    text = models.TextField(null=False, blank=False)


class Derived(models.Model):
    dict_record = models.ForeignKey(DictRecord, on_delete=models.CASCADE)
    text = models.CharField(max_length=200, null=False, blank=False)
    pronunciation = models.CharField(max_length=200, null=True)
    part_of_speech = models.CharField(max_length=100, null=True)
