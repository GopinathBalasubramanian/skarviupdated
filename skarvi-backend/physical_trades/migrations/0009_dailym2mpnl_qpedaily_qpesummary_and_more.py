# Generated by Django 5.2 on 2025-06-07 18:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('physical_trades', '0008_buyertransactionspr_note_sellertransactionspr_note'),
    ]

    operations = [
        migrations.CreateModel(
            name='DailyM2MPnL',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('category_description', models.CharField(max_length=255)),
                ('value_2025_05_01', models.BigIntegerField(blank=True, null=True)),
                ('value_2024_12_31', models.BigIntegerField(blank=True, null=True)),
                ('movement', models.BigIntegerField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='QPEDaily',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pricing_period', models.CharField(max_length=200)),
                ('qty_01_jan', models.FloatField(default=0.0)),
                ('qty_02_jan', models.FloatField(default=0.0)),
                ('qty_03_jan', models.FloatField(default=0.0)),
                ('qty_04_jan', models.FloatField(default=0.0)),
                ('qty_05_jan', models.FloatField(default=0.0)),
                ('qty_06_jan', models.FloatField(default=0.0)),
                ('qty_07_jan', models.FloatField(default=0.0)),
                ('qty_08_jan', models.FloatField(default=0.0)),
                ('qty_09_jan', models.FloatField(default=0.0)),
                ('qty_10_jan', models.FloatField(default=0.0)),
                ('qty_11_jan', models.FloatField(default=0.0)),
                ('qty_12_jan', models.FloatField(default=0.0)),
                ('qty_13_jan', models.FloatField(default=0.0)),
                ('qty_14_jan', models.FloatField(default=0.0)),
                ('qty_15_jan', models.FloatField(default=0.0)),
                ('qty_16_jan', models.FloatField(default=0.0)),
                ('qty_17_jan', models.FloatField(default=0.0)),
                ('qty_18_jan', models.FloatField(default=0.0)),
                ('qty_19_jan', models.FloatField(default=0.0)),
                ('qty_20_jan', models.FloatField(default=0.0)),
                ('qty_21_jan', models.FloatField(default=0.0)),
                ('qty_22_jan', models.FloatField(default=0.0)),
                ('qty_23_jan', models.FloatField(default=0.0)),
                ('qty_24_jan', models.FloatField(default=0.0)),
                ('qty_25_jan', models.FloatField(default=0.0)),
                ('qty_26_jan', models.FloatField(default=0.0)),
                ('qty_27_jan', models.FloatField(default=0.0)),
                ('qty_28_jan', models.FloatField(default=0.0)),
                ('qty_29_jan', models.FloatField(default=0.0)),
                ('qty_30_jan', models.FloatField(default=0.0)),
                ('qty_31_jan', models.FloatField(default=0.0)),
                ('qty_2024_12', models.FloatField(default=0.0)),
                ('qty_2025_01', models.FloatField(default=0.0)),
                ('qty_2025_02', models.FloatField(default=0.0)),
            ],
        ),
        migrations.CreateModel(
            name='QPESummary',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pricing_period', models.CharField(max_length=200)),
                ('qty_2024_12', models.FloatField(default=0.0)),
                ('qty_2025_01', models.FloatField(default=0.0)),
                ('qty_2025_02', models.FloatField(default=0.0)),
            ],
        ),
        migrations.CreateModel(
            name='QuantityPositionDaily',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('trade', models.CharField(max_length=100)),
                ('pricing_period', models.CharField(max_length=200)),
                ('qty_01_jan', models.FloatField(default=0.0)),
                ('qty_02_jan', models.FloatField(default=0.0)),
                ('qty_03_jan', models.FloatField(default=0.0)),
                ('qty_04_jan', models.FloatField(default=0.0)),
                ('qty_05_jan', models.FloatField(default=0.0)),
                ('qty_06_jan', models.FloatField(default=0.0)),
                ('qty_07_jan', models.FloatField(default=0.0)),
                ('qty_08_jan', models.FloatField(default=0.0)),
                ('qty_09_jan', models.FloatField(default=0.0)),
                ('qty_10_jan', models.FloatField(default=0.0)),
                ('qty_11_jan', models.FloatField(default=0.0)),
                ('qty_12_jan', models.FloatField(default=0.0)),
                ('qty_13_jan', models.FloatField(default=0.0)),
                ('qty_14_jan', models.FloatField(default=0.0)),
                ('qty_15_jan', models.FloatField(default=0.0)),
                ('qty_16_jan', models.FloatField(default=0.0)),
                ('qty_17_jan', models.FloatField(default=0.0)),
                ('qty_18_jan', models.FloatField(default=0.0)),
                ('qty_19_jan', models.FloatField(default=0.0)),
                ('qty_20_jan', models.FloatField(default=0.0)),
                ('qty_21_jan', models.FloatField(default=0.0)),
                ('qty_22_jan', models.FloatField(default=0.0)),
                ('qty_23_jan', models.FloatField(default=0.0)),
                ('qty_24_jan', models.FloatField(default=0.0)),
                ('qty_25_jan', models.FloatField(default=0.0)),
                ('qty_26_jan', models.FloatField(default=0.0)),
                ('qty_27_jan', models.FloatField(default=0.0)),
                ('qty_28_jan', models.FloatField(default=0.0)),
                ('qty_29_jan', models.FloatField(default=0.0)),
                ('qty_30_jan', models.FloatField(default=0.0)),
                ('qty_31_jan', models.FloatField(default=0.0)),
                ('qty_minus_0001_11', models.FloatField(default=0.0)),
                ('qty_2025_01', models.FloatField(default=0.0)),
                ('qty_2025_02', models.FloatField(default=0.0)),
            ],
        ),
        migrations.CreateModel(
            name='QuantityPositionSummary',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('trade', models.CharField(max_length=100)),
                ('pricing_period', models.CharField(max_length=200)),
                ('qty_minus_0001_11', models.FloatField(default=0.0)),
                ('qty_2025_01', models.FloatField(default=0.0)),
                ('qty_2025_02', models.FloatField(default=0.0)),
            ],
        ),
        migrations.CreateModel(
            name='VaRReport',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pricing_period', models.CharField(max_length=200)),
                ('qty_2024_12', models.FloatField(default=0.0)),
                ('qty_2025_01', models.FloatField(default=0.0)),
                ('qty_2025_02', models.FloatField(default=0.0)),
                ('qty_total', models.FloatField(default=0.0)),
                ('platts_price', models.FloatField(default=0.0)),
                ('max_date', models.DateField(blank=True, null=True)),
                ('min_date', models.DateField(blank=True, null=True)),
                ('platts_max', models.FloatField(default=0.0)),
                ('platts_min', models.FloatField(default=0.0)),
                ('var_max_price', models.FloatField(default=0.0)),
                ('var_max_value', models.FloatField(default=0.0)),
                ('var_min_price', models.FloatField(default=0.0)),
                ('var_min_value', models.FloatField(default=0.0)),
            ],
        ),
    ]
