# Generated by Django 5.0.4 on 2024-05-06 05:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vocab', '0003_dictrecord_word'),
    ]

    operations = [
        migrations.AddConstraint(
            model_name='dictrecord',
            constraint=models.UniqueConstraint(fields=('dictionary', 'word'), name='dict_word_unique'),
        ),
    ]