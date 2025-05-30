from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from .models import SellerTransactionSpr, HistoryRecord
from .serializers import SellerTransactionSprSerializer
from django.db import transaction
from django.utils import timezone

def num_with_comma(value):
    try:
        return round(float(str(value).replace(',', '')), 2)
    except Exception:
        return 0.0

class SellerTransactionSprView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # JWT will work if set in settings.py

    def get(self, request):
        tran_ref_no = request.query_params.get('Tran_Ref_No') or request.query_params.get('tran_ref_no')
        purchase_contract_id = request.query_params.get('Purchasecontractid') or request.query_params.get('purchase_contract_id')
        instance = get_object_or_404(
            SellerTransactionSpr,
            tran_ref_no=tran_ref_no,
            purchase_contract_id=purchase_contract_id
        )
        serializer = SellerTransactionSprSerializer(instance)
        return Response(serializer.data)

    @transaction.atomic
    def post(self, request):
        data = request.data.copy()
        # Normalize field names for compatibility
        tran_ref_no = data.get('Tran_Ref_No') or data.get('tran_ref_no')
        purchase_contract_id = data.get('Purchasecontractid') or data.get('purchase_contract_id')

        # Numeric conversions
        num1 = num_with_comma(data.get("seller_contract_quantiity_mton_air"))
        num2 = num_with_comma(data.get("seller_contract_quantiity_barrels"))
        num3 = num_with_comma(data.get("seller_bl_quantiity_mton_vac"))
        num4 = num_with_comma(data.get("seller_bl_quantiity_mton_air"))
        num5 = num_with_comma(data.get("seller_bl_quantiity_barrels"))
        num6 = num_with_comma(data.get("seller_bl_quantiity_cubic_meters"))
        num7 = num_with_comma(data.get("seller_outturn_quantity_mtons_vac"))
        num8 = num_with_comma(data.get("seller_outturn_quantity_mton_air"))
        num9 = num_with_comma(data.get("seller_outturn_quantity_barrels"))
        num10 = num_with_comma(data.get("seller_outturn_quantity_cubic_meters"))

        # Fetch or create the transaction
        instance = SellerTransactionSpr.objects.filter(
            tran_ref_no=tran_ref_no,
            purchase_contract_id=purchase_contract_id
        ).first()

        # Prepare update fields and history
        update_fields = {}
        history_changes = []

        # Example: Check and log changes for key fields
        if instance:
            for field, new_value in [
                ('seller_term_spot', data.get('seller_term_spot')),
                ('seller_deal_date', data.get('seller_deal_date')),
                ('seller_contract_quantiity_mton_air', num1),
                ('seller_contract_quantiity_barrels', num2),
                ('seller_bl_quantiity_mton_vac', num3),
                ('seller_bl_quantiity_mton_air', num4),
                ('seller_bl_quantiity_barrels', num5),
                ('seller_bl_quantiity_cubic_meters', num6),
                ('seller_outturn_quantity_mtons_vac', num7),
                ('seller_outturn_quantity_mton_air', num8),
                ('seller_outturn_quantity_barrels', num9),
                ('seller_outturn_quantity_cubic_meters', num10),
            ]:
                old_value = getattr(instance, field, None)
                if str(old_value) != str(new_value):
                    history_changes.append(HistoryRecord(
                        user=request.user.username,
                        date=timezone.now(),
                        updated_column=f"{tran_ref_no} PurchaseID: {purchase_contract_id} {field}",
                        old_value=old_value,
                        new_value=new_value
                    ))
                    update_fields[field] = new_value

        # Handle file upload if present
        file_obj = None
        if 'file' in request.FILES:
            file_obj = request.FILES['file']
            data['file'] = file_obj  # Adjust 'file' to your model field name

        # Update or create the transaction
        serializer = SellerTransactionSprSerializer(
            instance, data=data, partial=True
        ) if instance else SellerTransactionSprSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save(
            seller_contract_quantiity_mton_air=num1,
            seller_contract_quantiity_barrels=num2,
            seller_bl_quantiity_mton_vac=num3,
            seller_bl_quantiity_mton_air=num4,
            seller_bl_quantiity_barrels=num5,
            seller_bl_quantiity_cubic_meters=num6,
            seller_outturn_quantity_mtons_vac=num7,
            seller_outturn_quantity_mton_air=num8,
            seller_outturn_quantity_barrels=num9,
            seller_outturn_quantity_cubic_meters=num10,
            **({'file': file_obj} if file_obj else {})
        )

        # Save history
        if history_changes:
            HistoryRecord.objects.bulk_create(history_changes)

        return Response(SellerTransactionSprSerializer(obj).data, status=status.HTTP_200_OK if instance else status.HTTP_201_CREATED)