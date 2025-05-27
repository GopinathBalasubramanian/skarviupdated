from django.db import models
from django.contrib.auth.models import User

class FwdPriceQuotesValues(models.Model):
    quote_name = models.CharField(max_length=255)
    period_from = models.DateField()
    period_to = models.DateField()
    value = models.DecimalField(max_digits=20, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('quote_name', 'period_from', 'period_to')

class HedgingSpr(models.Model):
    HEDGE_TYPES = (
        ('FlatPrice', 'Flat Price'),
        ('Spread', 'Spread'),
    )

    TRANSACTION_TYPES = (
        ('Bought', 'Bought'),
        ('Sold', 'Sold'),
    )

    group_name = models.CharField(max_length=255)
    leg1_fix = models.DecimalField(max_digits=20, decimal_places=2, null=True)
    leg2_fix = models.DecimalField(max_digits=20, decimal_places=2,null=True)
    leg1_float = models.DecimalField(max_digits=20, decimal_places=2,null=True)
    leg2_float = models.DecimalField(max_digits=20, decimal_places=2, null=True)
    hedging_type = models.CharField(max_length=20, choices=HEDGE_TYPES, null=True)
    pricing_basis_sp = models.CharField(max_length=255, blank=True, null=True)
    pricing_basis_leg1 = models.CharField(max_length=255, blank=True, null=True)
    pricing_basis_leg2 = models.CharField(max_length=255, blank=True, null=True)
    pricing_basis_leg3 = models.CharField(max_length=255, blank=True, null=True)
    pricing_basis_sp1 = models.CharField(max_length=255, blank=True, null=True)
    pricing_basis_lega = models.CharField(max_length=255, blank=True, null=True)
    pricing_basis_legb = models.CharField(max_length=255, blank=True, null=True)
    pricing_basis_legc = models.CharField(max_length=255, blank=True, null=True)
    sale_contract_id = models.CharField(max_length=255, blank=True, null=True)
    purchase_contract_id = models.CharField(max_length=255, blank=True, null=True)
    tran_ref_no = models.CharField(max_length=255, null=True)
    paper = models.CharField(max_length=255, null=True)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES, null=True)
    counterparty = models.CharField(max_length=255, null=True)
    pricing_basis1 = models.CharField(max_length=255, null=True)
    pricing_basis2 = models.CharField(max_length=255, null=True)
    quantity = models.IntegerField(null=True, blank=True)
    quantitybbl = models.IntegerField(null=True, blank=True)
    quantity_mt = models.IntegerField(null=True)
    fixed_price = models.DecimalField(max_digits=20, decimal_places=2, null=True)
    pricing_period_from = models.DateField(null=True)
    pricing_period_to = models.DateField(null=True)
    floating_price = models.DecimalField(max_digits=20, decimal_places=2, null=True)
    settlement_value = models.DecimalField(max_digits=20, decimal_places=2, null=True)
    settlement_due = models.DecimalField(max_digits=20, decimal_places=2, null=True)
    settlement_date = models.DateField(null=True)
    credit_terms1 = models.DecimalField(max_digits=20, decimal_places=2, null=True)
    credit_terms2 = models.CharField(max_length=255, null=True)
    broker_name = models.CharField(max_length=255, null=True)
    broker_charges = models.CharField(max_length=255, null=True)
    charges_unit = models.CharField(max_length=255, null=True)
    traded_by = models.CharField(max_length=255, null=True)
    traded_on = models.DateField(null=True)
    approved_by = models.CharField(max_length=255, null=True, blank=True)
    approved_on = models.DateField(null=True, blank=True)
    stop_loss_limit = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    delete_status = models.BooleanField(default=False)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    email_id = models.EmailField(max_length=254, blank=True, null=True)
    due_date = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return f"{self.tran_ref_no} - {self.transaction_type}"

class HistoryRecord(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    date = models.DateTimeField(auto_now_add=True)
    updated_column = models.CharField(max_length=255)
    old_value = models.CharField(max_length=255)
    new_value = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.updated_column} changed by {self.user}"
