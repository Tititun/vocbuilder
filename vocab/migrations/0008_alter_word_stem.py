# Generated by Django 5.0.4 on 2024-05-06 16:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vocab', '0007_alter_dictionary_options_remove_sense_example_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='word',
            name='stem',
            field=models.CharField(max_length=200, unique=True),
        ),
    ]
