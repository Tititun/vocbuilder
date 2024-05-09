import graphene
from graphene_django import DjangoObjectType

from vocab.models import Word, Usage, Book, Authors, Sense


class UsageType(DjangoObjectType):
    class Meta:
        model = Usage
        fields = ('id', 'context_word', 'usage', 'word', 'book')


class WordType(DjangoObjectType):
    usages = graphene.List(UsageType)
    senses = graphene.List(graphene.String)

    def resolve_usages(self, info):
        return Usage.objects.filter(word=self)

    def resolve_senses(self, info):
        return Sense.objects.filter(sense_sequence__definition__dict_record__word=self).values_list('definition', flat=True)

    class Meta:
        model = Word
        fields = ('id', 'stem')


class BookType(DjangoObjectType):
    class Meta:
        model = Book
        fields = ('id', 'title', 'authors')


class AuthorsType(DjangoObjectType):
    class Meta:
        model = Authors
        fields = ('id', 'name')


class Query(graphene.ObjectType):
    all_words = graphene.List(WordType)
    all_books = graphene.List(BookType)

    def resolve_all_words(self, info):
        return Word.objects.all()

    def resolve_all_books(self, info):
        return Book.objects.all()


schema = graphene.Schema(query=Query)
