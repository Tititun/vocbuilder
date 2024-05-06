from django.contrib import admin
from .models import (
    Authors, Book, Definition, Dictionary, DictRecord, Derived, Etymology,
    ExampleUsage, Inflection, Sense, SenseSequence, Usage, Word
)


@admin.register(Dictionary)
class DictionaryAdmin(admin.ModelAdmin):
    pass
