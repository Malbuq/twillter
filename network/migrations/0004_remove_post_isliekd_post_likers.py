# Generated by Django 5.0 on 2024-01-08 22:30

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0003_remove_post_likers_post_isliekd'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='post',
            name='isLiekd',
        ),
        migrations.AddField(
            model_name='post',
            name='likers',
            field=models.ManyToManyField(blank=True, related_name='likes', to=settings.AUTH_USER_MODEL),
        ),
    ]