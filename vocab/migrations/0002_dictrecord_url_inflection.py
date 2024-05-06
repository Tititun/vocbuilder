# Generated by Django 5.0.4 on 2024-05-06 05:18

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vocab', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='dictrecord',
            name='url',
            field=models.CharField(default='', max_length=200),
            preserve_default=False,
        ),
        migrations.CreateModel(
            name='Inflection',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('inflection', models.CharField(max_length=200)),
                ('definition', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='vocab.definition')),
            ],
        ),
    ]