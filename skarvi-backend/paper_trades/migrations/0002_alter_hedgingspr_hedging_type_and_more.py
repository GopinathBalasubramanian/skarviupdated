# Generated by Django 5.2 on 2025-04-30 16:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('paper_trades', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='hedgingspr',
            name='hedging_type',
            field=models.CharField(choices=[('FlatPrice', 'Flat Price'), ('Spread', 'Spread')], max_length=20, null=True),
        ),
        migrations.AlterField(
            model_name='hedgingspr',
            name='leg1_fix',
            field=models.DecimalField(decimal_places=2, max_digits=20, null=True),
        ),
        migrations.AlterField(
            model_name='hedgingspr',
            name='leg2_fix',
            field=models.DecimalField(decimal_places=2, max_digits=20, null=True),
        ),
        migrations.AlterField(
            model_name='hedgingspr',
            name='leg2_float',
            field=models.DecimalField(decimal_places=2, max_digits=20, null=True),
        ),
    ]
