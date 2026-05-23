from django.shortcuts import render
from django.shortcuts import render
from django.conf import settings
from .utils import calculate_payment_total, calculate_payment_total_guest
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.cart.models import Cart, CartItem
#from apps.coupons.models import FixedPriceCoupon, PercentageCoupon
from apps.orders.models import Order, OrderItem
from apps.product.models import ProductUnidad, Promotion,ProductTallaStock ,ProductColorStock
from apps.shipping.models import Shipping
from django.core.mail import send_mail
import braintree
from rest_framework.permissions import IsAuthenticated
from decimal import Decimal
from apps.product.models import PromotionUsage
from rest_framework.permissions import AllowAny
# Create your views here.
gateway = braintree.BraintreeGateway(
    braintree.Configuration(
        environment=settings.BT_ENVIRONMENT,
        merchant_id=settings.BT_MERCHANT_ID,
        public_key=settings.BT_PUBLIC_KEY,
        private_key=settings.BT_PRIVATE_KEY
    )
)


class GenerateTokenView(APIView):
    permission_classes = [IsAuthenticated] 
    def get(self, request, format=None):
        try:
            token = gateway.client_token.generate()

            return Response(
                {'braintree_token': token},
                status=status.HTTP_200_OK
            )
        except:
            return Response(
                {'error': 'Something went wrong when retrieving braintree token'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

#solo para usuarios autentificados
# class GetPaymentTotalView(APIView):
#     #solo autentificados
#     permission_classes = [IsAuthenticated]
#     def get(self, request, format=None):
#         user = request.user
#         shipping_id = request.query_params.get('shipping_id')
#         coupon_code = request.query_params.get('coupon_code')

        
#         #para solo autentificados
#         try:
#             cart = Cart.objects.get(user=user)
#         except Cart.DoesNotExist:
#             return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)

#         result, status_code = calculate_payment_total(cart, shipping_id, coupon_code)
#         print("Resultado de calculate_payment_total:")
#         print(result)

#         return Response(result, status=status_code)
    
class GetPaymentTotalView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        user = request.user
        shipping_id = request.data.get('shipping_id')
        coupon_code = request.data.get('coupon_code')
        checkout_data = request.data.get('checkout_data', [])

        if user and user.is_authenticated:
            try:
                cart = Cart.objects.get(user=user)
            except Cart.DoesNotExist:
                return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)

            result, status_code = calculate_payment_total(cart, shipping_id, coupon_code)
            return Response(result, status=status_code)

        result, status_code = calculate_payment_total_guest(checkout_data, shipping_id, coupon_code)
        return Response(result, status=status_code)


class ProcessPaymentView(APIView):
    def post(self, request, format=None):
        user = request.user
        data = request.data

        try:
            nonce = data.get('nonce')
            shipping_id = data.get('shipping_id')
            coupon_code = data.get('coupon_name')

            full_name = data.get('full_name')
            address_line_1 = data.get('address_line_1')
            address_line_2 = data.get('address_line_2')
            city = data.get('city')
            state_province_region = data.get('state_province_region')
            postal_zip_code = data.get('postal_zip_code')
            country_region = data.get('country_region')
            telephone_number = data.get('telephone_number')

            if not nonce:
                return Response({'error': 'Missing payment nonce'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                shipping = Shipping.objects.get(id=shipping_id)
            except Shipping.DoesNotExist:
                return Response({'error': 'Invalid shipping option'}, status=status.HTTP_404_NOT_FOUND)

            try:
                cart = Cart.objects.get(user=user)
            except Cart.DoesNotExist:
                return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND)

            result, status_code = calculate_payment_total(cart, shipping_id, coupon_code)

            # Mostrar resultado en consola para depuración
            print("Resultado de calculate_payment_total:")
            print(result)

            if 'error' in result:
                return Response(result, status=status_code)

            total_amount = float(result['total_price'])

            newTransaction = gateway.transaction.sale({
                'amount': str(total_amount),
                'payment_method_nonce': str(nonce),
                'options': {'submit_for_settlement': True}
            })

            if newTransaction.is_success or newTransaction.transaction:
                cart_items = CartItem.objects.filter(cart=cart)

                # Registrar promociones usadas
                for promo_id in result.get('applied_promotions', []):
                    try:
                        promo = Promotion.objects.get(id=promo_id)
                        PromotionUsage.objects.get_or_create(user=user, promotion=promo)
                        promo.usage_count += 1
                        promo.save()
                    except Promotion.DoesNotExist:
                        continue

                # Crear diccionario de precios con descuento por producto/talla/color
                item_lookup = {
                    (str(item['product_id']), str(item.get('talla')), str(item.get('color'))): item
                    for item in result.get('items', [])
                }

                # Descontar stock
                for item in cart_items:
                    product = item.product
                    product.stock -= item.count

                    if item.talla:
                        talla_stock = ProductTallaStock.objects.filter(product=product, talla_id=item.talla).first()
                        if talla_stock:
                            talla_stock.stock -= item.count
                            talla_stock.save()
                    elif item.color:
                        color_stock = ProductColorStock.objects.filter(product=product, color=item.color).first()
                        if color_stock:
                            color_stock.stock -= item.count
                            color_stock.save()

                    product.save()

                # Crear orden principal
                order = Order.objects.create(
                    user=user,
                    transaction_id=newTransaction.transaction.id,
                    amount=total_amount,
                    full_name=full_name,
                    address_line_1=address_line_1,
                    address_line_2=address_line_2,
                    city=city,
                    state_province_region=state_province_region,
                    postal_zip_code=postal_zip_code,
                    country_region=country_region,
                    telephone_number=telephone_number,
                    shipping_name=shipping.name,
                    shipping_time=shipping.time_to_delivery,
                    shipping_price=float(shipping.price)
                )

                # Crear items de orden con descuento aplicado
                for item in cart_items:
                    key = (str(item.product.id), str(item.talla), str(item.color))
                    discounted_data = item_lookup.get(key)
                    final_price = Decimal(discounted_data['discounted_price']) if discounted_data else Decimal(item.product.price)

                    OrderItem.objects.create(
                        product=item.product,
                        order=order,
                        name=item.product.name,
                        price=final_price,
                        count=item.count,
                        talla=item.talla,
                        color=item.color
                    )

                # Enviar correo de confirmación
                send_mail(
                    'Your Order Details',
                    f'Hey {full_name},\n\nWe received your order!\n\nGive us some time to process your order and ship it out to you.\n\nYou can go on your user dashboard to check the status of your order.\n\nSincerely,\nShop Time',
                    'mail@ninerogues.com',
                    [user.email],
                    fail_silently=False
                )

                # Vaciar carrito
                cart_items.delete()
                cart.total_items = 0
                cart.save()

                return Response({'success': 'Transaction successful and order was created'}, status=status.HTTP_200_OK)

            return Response({'error': 'Transaction failed'}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)      











