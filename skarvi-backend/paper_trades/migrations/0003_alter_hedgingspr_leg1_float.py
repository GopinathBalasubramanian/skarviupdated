# Generated by Django 5.2 on 2025-04-30 16:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('paper_trades', '0002_alter_hedgingspr_hedging_type_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='hedgingspr',
            name='leg1_float',
            field=models.DecimalField(decimal_places=2, max_digits=20, null=True),
        ),
    ]
