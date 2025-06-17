from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from .models import SellerTransactionSpr, HistoryRecord, BuyerTransactionSpr, InterimTransactionSPR
from .serializers import SellerTransactionSprSerializer, BuyerTransactionSprSerializer, InterimTransactionSprSerializer
from django.db import transaction
from django.utils import timezone
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import (
    QuantityPositionSummary,
    QuantityPositionDaily,
    QPESummary,
    QPEDaily,
    VaRReport,
    DailyM2MPnL
)
from .serializers import (
    QuantityPositionSummarySerializer,
    QuantityPositionDailySerializer,
    QPESummarySerializer,
    QPEDailySerializer,
    VaRReportSerializer,
    DailyM2MPnLSerializer
)
from .models import (
    QuantityPositionSummary, QuantityPositionDaily,
    QPESummary, QPEDaily, VaRReport
)
from .serializers import (
    QuantityPositionSummarySerializer, QuantityPositionDailySerializer,
    QPESummarySerializer, QPEDailySerializer, VaRReportSerializer
)   


from django.core.mail import send_mail
from django.conf import settings

def num_with_comma(value):
    try:
        return round(float(str(value).replace(',', '')), 2)
    except Exception:
        return 0.0

def save_note(request):
        tran_ref_no = request.data.get("tran_ref_no")
        note = request.data.get("note")

        try:
            trade = SellerTransactionSpr.objects.get(tran_ref_no=tran_ref_no)
            trade.note = note  # make sure 'note' field exists in model
            trade.save()
            return Response({"message": "Note saved successfully."}, status=200)
        except SellerTransactionSpr.DoesNotExist:
            return Response({"error": "Trade not found."}, status=404)    
        

class SellerTransactionSprView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, tran_ref_no=None, purchase_contract_id=None):
        tran_ref_no = tran_ref_no or request.query_params.get('tran_ref_no')
        purchase_contract_id = purchase_contract_id or request.query_params.get('purchase_contract_id')

        if tran_ref_no and purchase_contract_id:
            instance = get_object_or_404(
                SellerTransactionSpr,
                tran_ref_no=tran_ref_no,
                purchase_contract_id=purchase_contract_id
            )
            serializer = SellerTransactionSprSerializer(instance)
            return Response(serializer.data)

        queryset = SellerTransactionSpr.objects.all()
        serializer = SellerTransactionSprSerializer(queryset, many=True)
        return Response(serializer.data)


    def save_note(request):
        tran_ref_no = request.data.get("tran_ref_no")
        note = request.data.get("note")

        try:
            trade = SellerTransactionSpr.objects.get(tran_ref_no=tran_ref_no)
            trade.note = note  # make sure 'note' field exists in model
            trade.save()
            return Response({"message": "Note saved successfully."}, status=200)
        except SellerTransactionSpr.DoesNotExist:
            return Response({"error": "Trade not found."}, status=404)    
        
    @transaction.atomic
    def post(self, request):
        data = request.data.copy()
        tran_ref_no = data.get('Tran_Ref_No') or data.get('tran_ref_no')
        purchase_contract_id = data.get('Purchasecontractid') or data.get('purchase_contract_id')

        # Auto-generate Tran Ref No if not present
        if not tran_ref_no:
            today = datetime.today()
            prefix = "C1TN"
            month_code = today.strftime("%Y%m")  # e.g., "202506"
            base_ref = f"{prefix}{month_code}"

            max_ref = SellerTransactionSpr.objects.filter(
                tran_ref_no__startswith=base_ref
            ).aggregate(max_ref=Max("tran_ref_no"))["max_ref"]

            if max_ref:
                next_seq = str(int(max_ref[-5:]) + 1).zfill(5)
            else:
                next_seq = "00001"

            tran_ref_no = f"{base_ref}{next_seq}"
            data["tran_ref_no"] = tran_ref_no  # ensure it's used in serializer

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

        instance = SellerTransactionSpr.objects.filter(
            tran_ref_no=tran_ref_no,
            purchase_contract_id=purchase_contract_id
        ).first()

        update_fields = {}
        history_changes = []

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

        file_obj = None
        if 'file' in request.FILES:
            file_obj = request.FILES['file']
            data['file'] = file_obj

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

        if history_changes:
            HistoryRecord.objects.bulk_create(history_changes)

        return Response(SellerTransactionSprSerializer(obj).data, status=status.HTTP_200_OK if instance else status.HTTP_201_CREATED)

    @transaction.atomic
    def put(self, request):
        data = request.data.copy()
        tran_ref_no = data.get('Tran_Ref_No') or data.get('tran_ref_no')
        purchase_contract_id = data.get('Purchasecontractid') or data.get('purchase_contract_id')
        instance = get_object_or_404(
            SellerTransactionSpr,
            tran_ref_no=tran_ref_no,
            purchase_contract_id=purchase_contract_id
        )

        # Numeric conversions (same as post)
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

        history_changes = []
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

        serializer = SellerTransactionSprSerializer(instance, data=data, partial=True)
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
        )

        if history_changes:
            HistoryRecord.objects.bulk_create(history_changes)

        return Response(SellerTransactionSprSerializer(obj).data, status=status.HTTP_200_OK)

    @transaction.atomic
    def delete(self, request):
        tran_ref_no = request.data.get('Tran_Ref_No') or request.data.get('tran_ref_no')
        purchase_contract_id = request.data.get('Purchasecontractid') or request.data.get('purchase_contract_id')
        instance = get_object_or_404(
            SellerTransactionSpr,
            tran_ref_no=tran_ref_no,
            purchase_contract_id=purchase_contract_id
        )
        instance.delete()
        return Response({"detail": "Deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

class BuyerTransactionSprView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        tran_ref_no = request.query_params.get('tran_ref_no')
        sale_contract_id = request.query_params.get('sale_contract_id')

        if tran_ref_no and sale_contract_id:
            instance = get_object_or_404(
                BuyerTransactionSpr,
                tran_ref_no=tran_ref_no,
                sale_contract_id=sale_contract_id
            )
            serializer = BuyerTransactionSprSerializer(instance)
            return Response(serializer.data)
        else:
            queryset = BuyerTransactionSpr.objects.all()
            serializer = BuyerTransactionSprSerializer(queryset, many=True)
            return Response(serializer.data)
        
    def save_note(request):
        tran_ref_no = request.data.get("tran_ref_no")
        sale_contract_id = request.data.get("sale_contract_id")
        note = request.data.get("note")

        try:
            trade = BuyerTransactionSpr.objects.get(tran_ref_no=tran_ref_no, sale_contract_id=sale_contract_id)
            trade.note = note  # make sure 'note' field exists in model
            trade.save()
            return Response({"message": "Note saved successfully."}, status=200)
        except BuyerTransactionSpr.DoesNotExist:
            return Response({"error": "Trade not found."}, status=404)
        
    @transaction.atomic
    def post(self, request):
        data = request.data.copy()
        tran_ref_no = data.get('tran_ref_no')
        sale_contract_id = data.get('sale_contract_id')

        num_fields = [
            "contr_qty_mtons_air",
            "contr_qty_barrels",
            "cont_density",
            "loaded_density",
            "price_density",
            "ot_percent",
            "inv_qty_b",
            "pb",
            "premium_discount",
            "platts_assessment",
            "price_to_be_rounded_to",
            "credit_days",
            "laytime_hours",
            "demurrage",
        ]
        numeric_data = {}
        for field in num_fields:
            if field in data:
                numeric_data[field] = num_with_comma(data.get(field))

        instance = BuyerTransactionSpr.objects.filter(
            tran_ref_no=tran_ref_no,
            sale_contract_id=sale_contract_id
        ).first()

        history_changes = []
        if instance:
            for field in num_fields:
                new_value = numeric_data.get(field)
                old_value = getattr(instance, field, None)
                if new_value is not None and str(old_value) != str(new_value):
                    history_changes.append(HistoryRecord(
                        user=request.user.username,
                        date=timezone.now(),
                        updated_column=f"{tran_ref_no} SaleID: {sale_contract_id} {field}",
                        old_value=old_value,
                        new_value=new_value
                    ))
        serializer = BuyerTransactionSprSerializer(
            instance, data={**data, **numeric_data}, partial=True
        ) if instance else BuyerTransactionSprSerializer(data={**data, **numeric_data})
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()

        if history_changes:
            HistoryRecord.objects.bulk_create(history_changes)

        return Response(BuyerTransactionSprSerializer(obj).data, status=status.HTTP_200_OK if instance else status.HTTP_201_CREATED)

    @transaction.atomic
    def put(self, request):
        data = request.data.copy()
        tran_ref_no = data.get('tran_ref_no')
        sale_contract_id = data.get('sale_contract_id')
        instance = get_object_or_404(
            BuyerTransactionSpr,
            tran_ref_no=tran_ref_no,
            sale_contract_id=sale_contract_id
        )

        num_fields = [
            "contr_qty_mtons_air",
            "contr_qty_barrels",
            "cont_density",
            "loaded_density",
            "price_density",
            "ot_percent",
            "inv_qty_b",
            "pb",
            "premium_discount",
            "platts_assessment",
            "price_to_be_rounded_to",
            "credit_days",
            "laytime_hours",
            "demurrage",
        ]
        numeric_data = {}
        for field in num_fields:
            if field in data:
                numeric_data[field] = num_with_comma(data.get(field))

        history_changes = []
        for field in num_fields:
            new_value = numeric_data.get(field)
            old_value = getattr(instance, field, None)
            if new_value is not None and str(old_value) != str(new_value):
                history_changes.append(HistoryRecord(
                    user=request.user.username,
                    date=timezone.now(),
                    updated_column=f"{tran_ref_no} SaleID: {sale_contract_id} {field}",
                    old_value=old_value,
                    new_value=new_value
                ))

        serializer = BuyerTransactionSprSerializer(instance, data={**data, **numeric_data}, partial=True)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()

        if history_changes:
            HistoryRecord.objects.bulk_create(history_changes)

        return Response(BuyerTransactionSprSerializer(obj).data, status=status.HTTP_200_OK)

    @transaction.atomic
    def delete(self, request):
        tran_ref_no = request.data.get('tran_ref_no')
        sale_contract_id = request.data.get('sale_contract_id')
        instance = get_object_or_404(
            BuyerTransactionSpr,
            tran_ref_no=tran_ref_no,
            sale_contract_id=sale_contract_id
        )
        instance.delete()
        return Response({"detail": "Deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    


class SendInterimTransactionEmailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        tran_ref_no = request.data.get('tran_ref_no')
        recipient_email = request.data.get('email_id')

        if not tran_ref_no or not recipient_email:
            return Response(
                {"error": "tran_ref_no and email_id are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        transaction = get_object_or_404(SellerTransactionSpr, tran_ref_no=tran_ref_no)

        # Construct the email_id body
        email_body = (
            f"Interim Transaction Details\n\n"
            f"Transaction Reference Number: {transaction.tran_ref_no or '-'}\n"
            f"Nomination Reference: {transaction.nomination_ref or '-'}\n"
            # f"No of Sellers: {transaction.no_of_sellers or '-'}\n"
            # f"No of Load Ports: {transaction.no_of_load_ports or '-'}\n"
            # f"No of Buyers: {transaction.no_of_buyers or '-'}\n"
            # f"No of Discharge Ports: {transaction.no_of_discharge_ports or '-'}\n"
            # f"Cargo Name: {transaction.cargo_name or '-'}\n"
            # f"Vessel Name: {transaction.vessel_name or '-'}\n"
            # f"Strategy Name: {transaction.strategy_name or '-'}\n"
        )

        subject = f"Interim Transaction - {transaction.tran_ref_no}"
        from_email = settings.DEFAULT_FROM_EMAIL
        try:
            send_mail(subject, email_body, from_email, [recipient_email])
            return Response({"detail": "email_id sent successfully."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CloneTransactionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        # Retrieve the 'id' of the source transaction from the request body
        source_id = request.data.get('id')
        move_or_copy = request.data.get('mode')

        if not source_id or not move_or_copy:
            return Response({"error": "Missing 'id' or 'mode' in request data."}, status=status.HTTP_400_BAD_REQUEST)

        # Get original seller record using the provided ID
        seller = SellerTransactionSpr.objects.filter(id=source_id).first()

        if not seller:
            return Response({"error": f"Seller record with ID '{source_id}' not found."}, status=status.HTTP_404_NOT_FOUND)

        # --- IMPORTANT CHANGE: Use the original tran_ref_no ---
        new_tran_ref_no = seller.tran_ref_no
        print(f"DEBUG: Using original tran_ref_no: {new_tran_ref_no}")
        # --- END IMPORTANT CHANGE ---

        # Clone seller data
        seller_data = SellerTransactionSprSerializer(seller).data
        seller_data['tran_ref_no'] = new_tran_ref_no  # Assign the original tran_ref_no
        seller_data.pop('id', None)  # Ensure 'id' is removed for a new instance (so a new record is created)

        seller_serializer = SellerTransactionSprSerializer(data=seller_data)
        try:
            seller_serializer.is_valid(raise_exception=True)
            seller_obj = seller_serializer.save()
        except Exception as e:
            print(f"DEBUG: Seller serializer validation failed: {e}")
            print(f"DEBUG: Seller serializer errors: {seller_serializer.errors}")
            return Response(seller_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Get original buyer record (if it exists)
        # Assuming seller and buyer records are linked by their 'tran_ref_no'
        # We use the original seller's tran_ref_no to find the corresponding buyer record
        buyer = BuyerTransactionSpr.objects.filter(tran_ref_no=seller.tran_ref_no).first()

        buyer_obj = None
        if buyer:
            buyer_data = BuyerTransactionSprSerializer(buyer).data
            buyer_data['tran_ref_no'] = new_tran_ref_no  # Assign the same original tran_ref_no
            buyer_data.pop('id', None)  # Ensure 'id' is removed for a new instance

            buyer_serializer = BuyerTransactionSprSerializer(data=buyer_data)
            try:
                buyer_serializer.is_valid(raise_exception=True)
                buyer_obj = buyer_serializer.save()
            except Exception as e:
                print(f"DEBUG: Buyer serializer validation failed: {e}")
                print(f"DEBUG: Buyer serializer errors: {buyer_serializer.errors}")
                return Response(buyer_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # If "Move", delete original records (seller and buyer)
        if move_or_copy.lower() == "move":
            seller.delete()
            if buyer:  # Only delete buyer if it existed
                buyer.delete()
            message = "Transaction moved successfully."
        else: # Default to 'copy' if not 'move'
            message = "Transaction copied successfully."


        return Response({
            "message": message,
            "new_tran_ref_no": new_tran_ref_no, # This will now be the original tran_ref_no
            "seller": SellerTransactionSprSerializer(seller_obj).data,
            "buyer": BuyerTransactionSprSerializer(buyer_obj).data if buyer_obj else None
        }, status=status.HTTP_201_CREATED)




class InterimTransactionSPR(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        tran_ref_no = request.query_params.get('tran_ref_no')
        if tran_ref_no:
            queryset = InterimTransactionSPR.objects.filter(tran_ref_no=tran_ref_no)
            serializer = InterimTransactionSprSerializer(queryset, many=True)
            return Response(serializer.data)
        else:
            queryset = InterimTransactionSPR.objects.all()
            serializer = InterimTransactionSprSerializer(queryset, many=True)
            return Response(serializer.data)

    @transaction.atomic
    def post(self, request):
        data = request.data.copy()
        tran_ref_no = data.get('tran_ref_no')

        instance = InterimTransactionSPR.objects.filter(
            tran_ref_no=tran_ref_no
        ).first()

        if instance:
            serializer = InterimTransactionSprSerializer(instance, data=data, partial=True)
            serializer.is_valid(raise_exception=True)
            obj = serializer.save()
            return Response(InterimTransactionSprSerializer(obj).data, status=status.HTTP_200_OK)
        else:
            serializer = InterimTransactionSprSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            obj = serializer.save()
            return Response(InterimTransactionSprSerializer(obj).data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def put(self, request):
        data = request.data.copy()
        tran_ref_no = data.get('tran_ref_no')
        instance = get_object_or_404(
            InterimTransactionSPR,
            tran_ref_no=tran_ref_no
        )
        serializer = InterimTransactionSprSerializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()
        return Response(InterimTransactionSprSerializer(obj).data, status=status.HTTP_200_OK)

    @transaction.atomic
    def delete(self, request):
        tran_ref_no = request.data.get('tran_ref_no')
        instance = get_object_or_404(
            InterimTransactionSPR,
            tran_ref_no=tran_ref_no
        )
        instance.delete()
        return Response({"detail": "Deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

class QuantityPositionSummaryListView(APIView):
    def get(self, request):
        queryset = QuantityPositionSummary.objects.all()
        serializer = QuantityPositionSummarySerializer(queryset, many=True)
        print('response', serializer.data)
        return Response(serializer.data)

class QuantityPositionDailyListView(APIView):
    def get(self, request):
        queryset = QuantityPositionDaily.objects.all()
        serializer = QuantityPositionDailySerializer(queryset, many=True)
        return Response(serializer.data)

class QPESummaryListView(APIView):
    def get(self, request):
        queryset = QPESummary.objects.all()
        serializer = QPESummarySerializer(queryset, many=True)
        return Response(serializer.data)

class QPEDailyListView(APIView):
    def get(self, request):
        queryset = QPEDaily.objects.all()
        serializer = QPEDailySerializer(queryset, many=True)
        return Response(serializer.data)

class VaRReportListView(APIView):
    def get(self, request):
        queryset = VaRReport.objects.all()
        serializer = VaRReportSerializer(queryset, many=True)
        return Response(serializer.data)

class DailyM2MPnLListView(generics.ListAPIView):
    queryset = DailyM2MPnL.objects.all()
    serializer_class = DailyM2MPnLSerializer
