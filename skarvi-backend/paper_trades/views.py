import pandas as pd
from django.db.models import Avg
from rest_framework.parsers import MultiPartParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db import transaction
from .models import HedgingSpr, FwdPriceQuotesValues
from datetime import datetime
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.generics import ListAPIView
from .serializers import HedgingSprSerializer
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import AuthenticationFailed
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date
from django.http import Http404




# Custom Refresh View (if needed)
class CustomTokenRefreshView(TokenRefreshView):
    """
    This class can be used to extend the functionality of the default refresh view.
    For example, you might add logging or other actions when the token is refreshed.
    """

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        # You can add additional logic here if needed
        # For example, logging every time the token is refreshed
        print("Token refresh successful for user", request.user)

        return response

# Optional: Custom Token Validation View (if you want additional validation)
@api_view(["POST"])
def validate_token(request):
    """
    Custom API to validate a token. You might use this to check if the token is still valid
    without refreshing it.
    """

    try:
        token = request.data.get("token")
        refresh = RefreshToken(token)
        # If token is valid, this will not raise an exception
        refresh.check_blacklist()  # Optional: Check if the token is blacklisted

        return Response({"message": "Token is valid"}, status=200)

    except Exception as e:
        raise AuthenticationFailed("Token is invalid or expired")


class HedgingAPIView(APIView):
    """
    API endpoint for creating, updating, partially updating, and deleting hedging trades.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, id=None):
        if id:
            try:
                trade = HedgingSpr.objects.get(id=id)
                serializer = HedgingSprSerializer(trade)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except HedgingSpr.DoesNotExist:
                return Response({"error": "Trade not found"}, status=status.HTTP_404_NOT_FOUND)

        # No ID provided — return all trades
        trades = HedgingSpr.objects.all()
        serializer = HedgingSprSerializer(trades, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @swagger_auto_schema(
        request_body=HedgingSprSerializer,
        responses={201: HedgingSprSerializer},
        operation_description="Create a new hedging trade."
    )
    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            print("Received data:", data)
            required_fields = [
                'fixed_price',
                'pricing_period_from']
            missing_fields = [field for field in required_fields if field not in data or not data[field]]
            if missing_fields:
                return Response(
                    {"error": f"Missing required fields: {', '.join(missing_fields)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            with transaction.atomic():
                quantity_mt = float(data.get('quantity_mt', 0))
                fixed_price = float(data.get('fixed_price', 0))

                leg1 = 0
                if data.get('pricing_quotation'):
                    avg_price = FwdPriceQuotesValues.objects.filter(
                        quote_name=data['pricing_quotation'],
                        period_from=data['pricing_period_from'],
                        period_to=data['pricing_period_to']
                    ).aggregate(Avg('value'))['value__avg'] or 0


                hedging = HedgingSpr.objects.create(
                    tran_ref_no=data.get('tran_ref_no'),
                    transaction_type=data.get('transaction_type'),
                    fixed_price=data.get('fixed_price'),
                    pricing_period_from=data.get('pricing_period_from'),
                    pricing_period_to=data.get('pricing_period_to'),
                    traded_on=data.get('traded_on'),
                    quantity_mt=data.get('quantity_mt'),
                    broker_name=data.get('broker_name', ''),
                    counterparty=data.get('counterparty', ''),
                    group_name=data.get('group_name', ''),
                    pricing_basis1=data.get('pricing_quotation', ''),
                    broker_charges=data.get('broker_charges', ''),
                    charges_unit=data.get('broker_charges_unit', ''),
                    email_id=data.get('email_id', ''),
                    due_date=data.get('due_date', ''),
                    leg1_fix=data.get('leg1_fix'),
                    leg2_fix=data.get('leg2_fix'),
                    leg1_float=data.get('leg1_float'),
                    leg2_float=data.get('leg2_float'),
                    hedging_type=data.get('hedging_type', ''),
                    paper=data.get('paper', ''),
                    traded_by=request.user
                )

                serializer = HedgingSprSerializer(hedging)

                return Response({
                    "status": "success",
                    "message": "Trade created successfully",
                    "data": serializer.data
                }, status=status.HTTP_201_CREATED)

        except ValueError as e:
            return Response({"error": f"Invalid numeric value: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        request_body=HedgingSprSerializer,
        responses={200: HedgingSprSerializer},
        operation_description="Update an existing hedging trade by ID.",
        manual_parameters=[openapi.Parameter('id', openapi.IN_PATH, description="ID of the trade", type=openapi.TYPE_INTEGER)
        ]
    )
    def put(self, request, id, *args, **kwargs):  
            try:
                data = request.data
                try:
                    trade = HedgingSpr.objects.get(id=id)
                    print("Trade found:", trade)
                except HedgingSpr.DoesNotExist:
                    return Response(
                        {"error": "Trade not found."},
                        status=status.HTTP_404_NOT_FOUND
                    )

                with transaction.atomic():                    # Update trade fields
                    trade.tran_ref_no = data.get('tran_ref_no', trade.tran_ref_no)
                    trade.transaction_type = data.get('transaction_type', trade.transaction_type)
                    trade.fixed_price = data.get('fixed_price', trade.fixed_price)
                    trade.pricing_period_from = data.get('pricing_period_from', trade.pricing_period_from)
                    trade.pricing_period_to = data.get('pricing_period_to', trade.pricing_period_to)
                    trade.traded_on = data.get('traded_on', trade.traded_on)
                    trade.quantity_mt = data.get('quantity_mt',trade.quantity_mt)
                    trade.broker_name = data.get('broker_name', trade.broker_name)
                    trade.counterparty = data.get('counterparty', trade.counterparty)
                    trade.group_name = data.get('group_name',trade.group_name)
                    trade.pricing_basis1 = data.get('pricing_basis1', trade.pricing_basis1)
                    trade.broker_charges = data.get('broker_charges', trade.broker_charges)
                    trade.charges_unit = data.get('broker_charges_unit', trade.charges_unit)
                    trade.email_id = data.get('email_id', trade.email_id)
                    trade.due_date = data.get('due_date', trade.due_date)
                    trade.leg1_fix = data.get('leg1_fix', trade.leg1_fix)
                    trade.traded_by = request.user

                    trade.save()

                    serializer = HedgingSprSerializer(trade)
                    return Response({
                        "status": "success",
                        "message": "Trade updated successfully",
                        "data": serializer.data
                    }, status=status.HTTP_200_OK)

            except ValueError as e:
                print(f"ValueError: {e}")
                return Response({"error": f"Invalid numeric value: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                print(f"Exception: {e}")
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def patch(self, request, id, *args, **kwargs):
        try:
            trade = self.get_trade(id=id)
            if not trade:
                return Response({"error": "Trade not found."}, status=status.HTTP_404_NOT_FOUND)

            serializer = HedgingSprSerializer(trade, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": "success",
                    "message": "Trade partially updated successfully",
                    "data": serializer.data
                }, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(
        responses={204: "Trade deleted successfully", 404: "Trade Not Found"},
        operation_description="Delete a hedging trade by ID.",
        manual_parameters=[
            openapi.Parameter('id', openapi.IN_PATH, description="ID of the trade", type=openapi.TYPE_INTEGER)
        ]
    )
    def get_trade(self, id):
        try:
            return HedgingSpr.objects.get(id=id)
        except HedgingSpr.DoesNotExist:
            raise Http404
        

    def delete(self, request, id, *args, **kwargs):
        try:
            trade = self.get_trade(id)
            trade.delete()
            return Response({
                "status": "success",
                "message": "Trade deleted successfully"
            }, status=status.HTTP_204_NO_CONTENT)

        except Http404:
            return Response({"error": "Trade not found."}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            import traceback
            traceback_str = traceback.format_exc()  # This captures full error trace
            print("Error while deleting trade:", traceback_str)  # Log it to console/server
            return Response({"error": str(e) or "Unknown error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            

class HedgingCreateView(APIView):
    """
    Create a new hedging trade.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        request_body=HedgingSprSerializer,
        responses={201: HedgingSprSerializer},
        operation_description="Create a new hedging trade."
    )
    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            required_fields = ['fixed_price', 'pricing_period_from']
            missing_fields = [field for field in required_fields if not data.get(field)]

            if missing_fields:
                return Response(
                    {"error": f"Missing required fields: {', '.join(missing_fields)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            with transaction.atomic():
                quantity_mt = float(data.get('quantity_mt', 0))
                fixed_price = float(data.get('fixed_price', 0))

                avg_price = 0
                if data.get('pricing_quotation'):
                    avg_price = FwdPriceQuotesValues.objects.filter(
                        quote_name=data['pricing_quotation'],
                        period_from=data['pricing_period_from'],
                        period_to=data['pricing_period_to']
                    ).aggregate(Avg('value'))['value__avg'] or 0

                hedging = HedgingSpr.objects.create(
                    tran_ref_no=data.get('tran_ref_no'),
                    transaction_type=data.get('transaction_type'),
                    fixed_price=fixed_price,
                    pricing_period_from=data.get('pricing_period_from'),
                    pricing_period_to=data.get('pricing_period_to'),
                    traded_on=data.get('traded_on'),
                    quantity_mt=quantity_mt,
                    broker_name=data.get('broker_name', ''),
                    counterparty=data.get('counterparty', ''),
                    group_name=data.get('group_name', ''),
                    pricing_basis1=data.get('pricing_quotation', ''),
                    broker_charges=data.get('broker_charges', ''),
                    charges_unit=data.get('broker_charges_unit', ''),
                    email_id=data.get('email_id', ''),
                    due_date=data.get('due_date', ''),
                    leg1_fix=data.get('leg1_fix'),
                    leg2_fix=data.get('leg2_fix'),
                    leg1_float=data.get('leg1_float'),
                    leg2_float=data.get('leg2_float'),
                    hedging_type=data.get('hedging_type', ''),
                    paper=data.get('paper', ''),
                    traded_by=request.user
                )

                serializer = HedgingSprSerializer(hedging)
                return Response({
                    "status": "success",
                    "message": "Trade created successfully",
                    "data": serializer.data
                }, status=status.HTTP_201_CREATED)

        except ValueError as e:
            return Response({"error": f"Invalid numeric value: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HedgingDuplicateView(APIView):
    """
    Duplicate a hedging trade by tran_ref_no format: GROUP#YYYY-MM-DD#YYYY-MM-DD
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        tran_ref = request.data.get("tran_ref_no")
        if not tran_ref:
            return Response({"error": "Missing tran_ref_no"}, status=status.HTTP_400_BAD_REQUEST)

        parts = tran_ref.split("#")
        if len(parts) != 3:
            return Response({"error": "Invalid tran_ref format. Expected: GROUP#YYYY-MM-DD#YYYY-MM-DD"}, status=status.HTTP_400_BAD_REQUEST)

        group_name, start_date_str, end_date_str = parts
        try:
            start_date = datetime.datetime.strptime(start_date_str, "%Y-%m-%d").date()
            end_date = datetime.datetime.strptime(end_date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Invalid date format in tran_ref_no."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            row = HedgingSpr.objects.filter(
                group_name=group_name,
                pricing_period_from=start_date,
                pricing_period_to=end_date
            ).first()

            if not row:
                return Response({"error": "No matching trade found."}, status=status.HTTP_404_NOT_FOUND)

            with transaction.atomic():
                new_row = HedgingSpr.objects.create(
                    **{field.name: getattr(row, field.name)
                       for field in HedgingSpr._meta.fields if field.name not in ['id', 'date_created', 'date_modified']},
                    date_created=datetime.datetime.now(),
                    date_modified=datetime.datetime.now()
                )

            return Response({"redirect_url": f"/ELIN/menu/edit_hedging?id={new_row.id}"})

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

import logging
logger = logging.getLogger(__name__)

def clean_headers(headers):
    # Clean headers to remove NaN values or replace them with meaningful defaults
    return [header if header is not None and pd.notna(header) else f"Unnamed_{idx}" for idx, header in enumerate(headers)]

class HedgingBulkUploadView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No Excel file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            df = pd.read_excel(file, header=None)
            print("Initial df.head(10):\n", df.head(10))

            cleared_deals_row = df[df.apply(lambda row: row.astype(str).str.contains("Cleared Deals", case=False).any(), axis=1)]
            if cleared_deals_row.empty:
                return Response({"error": "Could not find 'Cleared Deals' section in the Excel file."}, status=status.HTTP_400_BAD_REQUEST)
            cleared_deals_start_index = cleared_deals_row.index[0]
            print(f"Row index of 'Cleared Deals': {cleared_deals_start_index}")

            header_row_index = cleared_deals_start_index + 2
            if header_row_index >= len(df):
                return Response({"error": "Could not find headers after 'Cleared Deals' section."}, status=status.HTTP_400_BAD_REQUEST)

            headers = df.iloc[header_row_index].tolist()
            print(f"Headers for 'Cleared Deals' section (before cleaning): {headers}")  # <-- ADD THIS LINE

            # Clean headers to remove NaN values or replace with default names
            headers = clean_headers(headers)
            print(f"Cleaned headers: {headers}")

            data_start_index = cleared_deals_start_index + 2
            futures_deals_row = df[df.apply(lambda row: row.astype(str).str.contains("Futures Deals", case=False).any(), axis=1)]
            data_end_index = futures_deals_row.index[0] if not futures_deals_row.empty else None
            print(f"End row index for 'Cleared Deals' data: {data_end_index}")

            cleared_df = df.iloc[data_start_index:data_end_index].copy()
            cleared_df.columns = headers
            print("cleared_df.head():\n", cleared_df.head())

            cleared_df.dropna(how='all', inplace=True)

            # Remove rows with NaN in important columns (e.g., "Trade Date", "Deal ID")
            cleared_df = cleared_df.dropna(subset=["Trade Date", "Deal ID"], how="any")
            print("Filtered cleared_df.head():\n", cleared_df.head())

            created_count = 0

            with transaction.atomic():
                for index, row in cleared_df.iloc[1:].iterrows():  # Start from the second row
                    try:
                        lots_value = row.get("Lots")
                        quantity = int(lots_value) if pd.notna(lots_value) else 0

                        strike_value = row.get("Strike", "")
                        delete_status = False
                        if isinstance(strike_value, str):
                            delete_status = strike_value.lower() == "yes"

                        HedgingSpr.objects.create(
                            group_name=row.get("Contract", ""),
                            tran_ref_no=row.get("Deal ID", ""),
                            transaction_type=row.get("B/S", ""),
                            pricing_basis1=row.get("Product", ""),
                            pricing_basis2=row.get("Hub", ""),
                            pricing_period_from=parse_date(row.get("Begin Date", "")),
                            pricing_period_to=parse_date(row.get("End Date", "")),
                            counterparty=row.get("Cust Acct", ""),
                            broker_name=row.get("Broker Name") or row.get("Clearing Firm", ""),
                            fixed_price=row.get("Price") or 0,
                            charges_unit=row.get("Price Units", ""),
                            quantity=quantity,
                            quantity_mt=row.get("Total Quantity") or 0,
                            paper=row.get("Option", ""),
                            traded_by=request.user,
                            traded_on=parse_date(row.get("Trade Date", "")),
                            email_id=request.user.email,
                            due_date=None,
                            delete_status=delete_status,
                        )
                        created_count += 1
                    except Exception as row_error:
                        logger.error(f"Error creating row: {row.to_dict()} - Error: {row_error}")
                        continue

            return Response({
                "message": f"{created_count} Cleared trades uploaded successfully from Excel."
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"General error: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
# class HedgingListAPIView(ListAPIView):
#     """
#     API endpoint for listing all hedging trades
#     Requires authentication via JWT tokens
#     Supports filtering by query parameters
#     """
#     authentication_classes = [JWTAuthentication]
#     permission_classes = [permissions.IsAuthenticated]
#     serializer_class = HedgingSprSerializer

#     def get_queryset(self):
#         queryset = HedgingSpr.objects.all().order_by('-DateCreated')

#         # # Filter by type
#         # trade_type = self.request.query_params.get('transaction_type')
#         # if trade_type in ['Bought', 'Sold']:
#         #     queryset = queryset.filter(transaction_type=trade_type)

#         # Filter by trade date
#         date_from = self.request.query_params.get('date_from')
#         date_to = self.request.query_params.get('date_to')
#         if date_from:
#             queryset = queryset.filter(traded_on__gte=date_from)
#         if date_to:
#             queryset = queryset.filter(traded_on__lte=date_to)

#         # Filter by counterparty
#         counterparty = self.request.query_params.get('counterparty')
#         if counterparty:
#             queryset = queryset.filter(counterparty__icontains=counterparty)

#         return queryset
    
class HedgingListAPIView(ListAPIView):
    """
    API endpoint for listing all hedging trades
    Requires authentication via JWT tokens
    Supports filtering by query parameters
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = HedgingSprSerializer

    def get_queryset(self):
        queryset = HedgingSpr.objects.all().order_by('-DateCreated')

        # Filter by type
        trade_type = self.request.query_params.get('transaction_type')
        if trade_type in ['Bought', 'Sold']:
            queryset = queryset.filter(transaction_type=trade_type)

        # Filter by trade date
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            queryset = queryset.filter(traded_on__gte=date_from)
        if date_to:
            queryset = queryset.filter(traded_on__lte=date_to)

        # Filter by counterparty
        counterparty = self.request.query_params.get('counterparty')
        if counterparty:
            queryset = queryset.filter(counterparty__icontains=counterparty)

        return queryset