from django.db import models


class Authors(models.Model):
    name = models.CharField(max_length=200, null=False, blank=False)


class Books(models.Model):
    title = models.CharField(max_length=200, null=False, blank=False)
    authors = models.ForeignKey(Authors, on_delete=models.CASCADE)


class Dictionary(models.Model):
    name = models.CharField(max_length=200, null=False, blank=False)
    language_from = models.CharField(max_length=2, null=False, blank=False)
    language_to = models.CharField(max_length=2, null=False, blank=False)


class Word(models.Model):
    stem = models.CharField(max_length=200, null=False, blank=False)


class Usage(models.Model):
    word = models.ForeignKey(Word, on_delete=models.CASCADE)
    context_word = models.CharField(max_length=200, null=False, blank=False)
    usage = models.TextField(blank=False, null=False)


class DictRecord(models.Model):
    dictionary = models.ForeignKey(Dictionary, on_delete=models.CASCADE)
    pronunciation = models.CharField(max_length=200, null=True)
    did_you_know_header = models.CharField(max_length=100, null=True)
    did_you_know = models.TextField(null=True)
    created = models.DateTimeField(auto_now_add=True)


class Definition(models.Model):
    dict_record = models.ForeignKey(DictRecord, on_delete=models.CASCADE)
    part_of_speech = models.CharField(max_length=100)


class Inflection(models.Model):
    definition = dict_record = models.ForeignKey(Definition,
                                                 on_delete=models.CASCADE)
    inflection = models.CharField(max_length=200, null=False, blank=False)


class SenseSequence(models.Model):
    definition = models.ForeignKey(Definition, on_delete=models.CASCADE)
    role = models.CharField(max_length=200, null=True)


class Sense(models.Model):
    sense_sequence = models.ForeignKey(SenseSequence, on_delete=models.CASCADE)
    definition = models.TextField(null=False, blank=False)
    example = models.CharField(max_length=200, null=True)
    labels = models.CharField(max_length=200, null=True)
    usage_notes = models.CharField(max_length=200, null=True)


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
