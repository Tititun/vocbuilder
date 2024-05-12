from django.urls import path
from . import views

app_name = "vocab"
urlpatterns = [
    path('word_def', views.word_definition, name='word_definition'),
    path("", views.index, name="index"),
]
