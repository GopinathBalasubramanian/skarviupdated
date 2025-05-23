# Generated by Django 5.2 on 2025-05-23 18:23

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('paper_trades', '0010_alter_hedgingspr_traded_by'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name='hedgingspr',
            name='traded_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='hedging_trades', to=settings.AUTH_USER_MODEL),
        ),
    ]
