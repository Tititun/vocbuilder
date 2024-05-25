# Generated by Django 5.0.4 on 2024-05-24 05:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vocab', '0014_rename_word_id_image_word'),
    ]

    operations = [
        migrations.CreateModel(
            name='Feedback',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('email', models.EmailField(blank=True, max_length=254, null=True)),
                ('feedback', models.TextField()),
                ('file', models.FileField(null=True, upload_to='')),
            ],
        ),
    ]