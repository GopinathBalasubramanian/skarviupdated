# Generated by Django 5.2 on 2025-05-28 18:36

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('physical_trades', '0004_historyrecord_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='buyertransactionspr',
            name='date_created',
        ),
        migrations.RemoveField(
            model_name='buyertransactionspr',
            name='date_modified',
        ),
    ]
