from decimal import Decimal, InvalidOperation
from apps.shipping.models import Shipping
from apps.cart.models import Cart, CartItem
from rest_framework import status
from apps.product.models import PromotionUsage,ProductUnidad
from datetime import datetime
from django.utils import timezone

now = timezone.now()


# def calculate_payment_total(cart, shipping_id=None, coupon_code=None):
#     try:
#         if not CartItem.objects.filter(cart=cart).exists():
#             return {'error': 'Need to have items in cart'}, status.HTTP_404_NOT_FOUND

#         now = timezone.now()
#         cart_items = CartItem.objects.filter(cart=cart)
#         original_price = Decimal(0.0)
#         shipping_cost = Decimal(0.0)
#         coupon_applied_to_any_product = False
#         applied_promotions = []
#         item_details = []  # 👈 añadimos esta lista para precios finales por ítem

#         for cart_item in cart_items:
#             product_data = cart_item.product
#             product_price = Decimal(product_data.price)
#             discounted_price = product_price

#             valid_promotion = None
#             promotions = product_data.promotions.filter(active=True)

#             for promo in promotions:
#                 if promo.start_date and promo.end_date:
#                     if not (promo.start_date <= now <= promo.end_date):
#                         continue

#                 if promo.usage_limit is not None and promo.usage_count >= promo.usage_limit:
#                     continue

#                 if PromotionUsage.objects.filter(user=cart.user, promotion=promo).exists():
#                     continue

#                 if promo.code.strip() == "":
#                     coupon_applied_to_any_product = True
#                     valid_promotion = promo
#                     break

#                 if coupon_code and promo.code.strip() == coupon_code.strip():
#                     coupon_applied_to_any_product = True
#                     valid_promotion = promo
#                     break

#             if valid_promotion:
#                 try:
#                     discount_value = Decimal(str(valid_promotion.discount_percentage))

#                     if valid_promotion.money:
#                         discounted_price = max(product_price - discount_value, Decimal(0))
#                     else:
#                         discount = discount_value / Decimal(100)
#                         discounted_price = product_price * (Decimal(1) - discount)

#                     applied_promotions.append(valid_promotion.id)

#                 except (InvalidOperation, TypeError, ValueError):
#                     discounted_price = product_price

#             original_price += discounted_price * Decimal(cart_item.count)

#             # 👇 Guardamos los datos del ítem con precio final
#             item_details.append({
#                 'product_id': cart_item.product.id,
#                 'discounted_price': f'{discounted_price:.2f}',
#                 'count': cart_item.count,
#                 'talla': cart_item.talla,
#                 'color': cart_item.color
#             })

#         if shipping_id:
#             try:
#                 shipping = Shipping.objects.get(id=shipping_id)
#                 shipping_cost = Decimal(shipping.price)
#             except Shipping.DoesNotExist:
#                 return {'error': 'Shipping method not found'}, status.HTTP_404_NOT_FOUND
#             except ValueError:
#                 return {'error': 'Invalid shipping ID provided'}, status.HTTP_400_BAD_REQUEST

#         total_price = original_price + shipping_cost

#         response = {
#             'original_price': f'{original_price:.2f}',
#             'shipping_cost': f'{shipping_cost:.2f}',
#             'total_price': f'{total_price:.2f}',
#             'coupon_applied': coupon_applied_to_any_product,
#             'coupon_code': coupon_code,
#             'applied_promotions': applied_promotions,
#             'items': item_details  # 👈 se añade esta lista al response
#         }

#         if coupon_code:
#             if coupon_applied_to_any_product:
#                 response['message'] = f"¡Cupón '{coupon_code}' aplicado con éxito!"
#             else:
#                 response['warning'] = f"El cupón '{coupon_code}' es inválido, expiró, ya fue usado o alcanzó su límite."

#         return response, status.HTTP_200_OK

#     except Exception as e:
#         return {'error': f'Something went wrong: {str(e)}'}, status.HTTP_500_INTERNAL_SERVER_ERROR

#para usuarios outentificados
# def calculate_payment_total(cart, shipping_id=None, coupon_code=None):
#     try:
#         if not CartItem.objects.filter(cart=cart).exists():
#             return {'error': 'Need to have items in cart'}, status.HTTP_404_NOT_FOUND

#         now = timezone.now()
#         cart_items = CartItem.objects.filter(cart=cart)
#         original_price = Decimal(0.0)
#         shipping_cost = Decimal(0.0)
#         coupon_applied_to_any_product = False
#         applied_promotions = []
#         item_details = []

#         used_coupon_product_id = None  # 👈 para que el cupón se aplique solo a un producto una vez

#         for cart_item in cart_items:
#             product_data = cart_item.product
#             product_price = Decimal(product_data.price)
#             discounted_price = product_price
#             valid_promotion = None
#             promotions = product_data.promotions.filter(active=True)

#             for promo in promotions:
#                 if promo.start_date and promo.end_date:
#                     if not (promo.start_date <= now <= promo.end_date):
#                         continue

#                 if promo.usage_limit is not None and promo.usage_count >= promo.usage_limit:
#                     continue

#                 if PromotionUsage.objects.filter(user=cart.user, promotion=promo).exists():
#                     continue

#                 if promo.code.strip() == "":
#                     # Promoción directa, se aplica a todas las unidades
#                     valid_promotion = promo
#                     break

#                 if coupon_code and promo.code.strip() == coupon_code.strip():
#                     # Cupón: solo aplicar a un producto una vez
#                     if used_coupon_product_id is None:
#                         valid_promotion = promo
#                         used_coupon_product_id = cart_item.product.id
#                         coupon_applied_to_any_product = True
#                         break

#             count_to_apply_discount = cart_item.count
#             if valid_promotion and valid_promotion.code.strip():
#                 # Si es cupón, solo una unidad tiene descuento
#                 count_to_apply_discount = 1

#             if valid_promotion:
#                 try:
#                     discount_value = Decimal(str(valid_promotion.discount_percentage))

#                     if valid_promotion.money:
#                         discounted_unit_price = max(product_price - discount_value, Decimal(0))
#                     else:
#                         discount = discount_value / Decimal(100)
#                         discounted_unit_price = product_price * (Decimal(1) - discount)

#                     applied_promotions.append(valid_promotion.id)
#                 except (InvalidOperation, TypeError, ValueError):
#                     discounted_unit_price = product_price
#             else:
#                 discounted_unit_price = product_price

#             # Cálculo total por ítem
#             item_total = (
#                 discounted_unit_price * Decimal(count_to_apply_discount) +
#                 product_price * Decimal(cart_item.count - count_to_apply_discount)
#             )

#             original_price += item_total

#             item_details.append({
#                 'product_id': cart_item.product.id,
#                 'discounted_price': f'{discounted_unit_price:.2f}' if valid_promotion else f'{product_price:.2f}',
#                 'count': cart_item.count,
#                 'discounted_count': count_to_apply_discount,
#                 'talla': cart_item.talla,
#                 'color': cart_item.color
#             })

#         if shipping_id:
#             try:
#                 shipping = Shipping.objects.get(id=shipping_id)
#                 shipping_cost = Decimal(shipping.price)
#             except Shipping.DoesNotExist:
#                 return {'error': 'Shipping method not found'}, status.HTTP_404_NOT_FOUND
#             except ValueError:
#                 return {'error': 'Invalid shipping ID provided'}, status.HTTP_400_BAD_REQUEST

#         total_price = original_price + shipping_cost

#         response = {
#             'original_price': f'{original_price:.2f}',
#             'shipping_cost': f'{shipping_cost:.2f}',
#             'total_price': f'{total_price:.2f}',
#             'coupon_applied': coupon_applied_to_any_product,
#             'coupon_code': coupon_code,
#             'applied_promotions': applied_promotions,
#             'items': item_details
#         }

#         if coupon_code:
#             if coupon_applied_to_any_product:
#                 response['message'] = f"¡Cupón '{coupon_code}' aplicado con éxito!"
#             else:
#                 response['warning'] = f"El cupón '{coupon_code}' es inválido, expiró, ya fue usado o alcanzó su límite."

#         return response, status.HTTP_200_OK

#     except Exception as e:
#         return {'error': f'Something went wrong: {str(e)}'}, status.HTTP_500_INTERNAL_SERVER_ERROR

#Esta función recibirá ítems ya normalizados
def _calculate_payment_total_from_items(items, shipping_id=None, coupon_code=None, user=None):
    try:
        if not items:
            return {'error': 'Need to have items in cart'}, status.HTTP_404_NOT_FOUND

        now = timezone.now()
        original_price = Decimal("0.00")
        shipping_cost = Decimal("0.00")
        coupon_applied_to_any_product = False
        applied_promotions = []
        item_details = []

        used_coupon_product_id = None  # el cupón solo se aplica una vez a un producto

        for item in items:
            product = item["product"]
            count = int(item["count"])
            talla = item.get("talla")
            color = item.get("color")

            if count <= 0:
                continue

            product_price = Decimal(str(product.price))
            valid_promotion = None
            promotions = product.promotions.filter(active=True)

            for promo in promotions:
                if promo.start_date and promo.end_date:
                    if not (promo.start_date <= now <= promo.end_date):
                        continue

                if promo.usage_limit is not None and promo.usage_count >= promo.usage_limit:
                    continue

                # Solo validar uso previo si hay usuario autenticado
                if user and user.is_authenticated:
                    if PromotionUsage.objects.filter(user=user, promotion=promo).exists():
                        continue

                if promo.code.strip() == "":
                    # promoción directa, aplica a todas las unidades
                    valid_promotion = promo
                    break

                if coupon_code and promo.code.strip() == coupon_code.strip():
                    # cupón: aplicar una sola vez a un solo producto
                    if used_coupon_product_id is None:
                        valid_promotion = promo
                        used_coupon_product_id = product.id
                        coupon_applied_to_any_product = True
                        break

            count_to_apply_discount = count
            if valid_promotion and valid_promotion.code.strip():
                # si es cupón, solo una unidad tiene descuento
                count_to_apply_discount = 1

            if valid_promotion:
                try:
                    discount_value = Decimal(str(valid_promotion.discount_percentage))

                    if valid_promotion.money:
                        discounted_unit_price = max(product_price - discount_value, Decimal("0.00"))
                    else:
                        discount = discount_value / Decimal("100")
                        discounted_unit_price = product_price * (Decimal("1.00") - discount)

                    applied_promotions.append(valid_promotion.id)

                except (InvalidOperation, TypeError, ValueError):
                    discounted_unit_price = product_price
            else:
                discounted_unit_price = product_price

            item_total = (
                discounted_unit_price * Decimal(count_to_apply_discount) +
                product_price * Decimal(count - count_to_apply_discount)
            )

            original_price += item_total

            item_details.append({
                'product_id': product.id,
                'discounted_price': f'{discounted_unit_price:.2f}' if valid_promotion else f'{product_price:.2f}',
                'count': count,
                'discounted_count': count_to_apply_discount,
                'talla': talla,
                'color': color
            })

        if shipping_id:
            try:
                shipping = Shipping.objects.get(id=shipping_id)
                shipping_cost = Decimal(str(shipping.price))
            except Shipping.DoesNotExist:
                return {'error': 'Shipping method not found'}, status.HTTP_404_NOT_FOUND
            except ValueError:
                return {'error': 'Invalid shipping ID provided'}, status.HTTP_400_BAD_REQUEST

        total_price = original_price + shipping_cost

        response = {
            'original_price': f'{original_price:.2f}',
            'shipping_cost': f'{shipping_cost:.2f}',
            'total_price': f'{total_price:.2f}',
            'coupon_applied': coupon_applied_to_any_product,
            'coupon_code': coupon_code,
            'applied_promotions': applied_promotions,
            'items': item_details
        }

        if coupon_code:
            if coupon_applied_to_any_product:
                response['message'] = f"¡Cupón '{coupon_code}' aplicado con éxito!"
            else:
                response['warning'] = f"El cupón '{coupon_code}' es inválido, expiró, ya fue usado o alcanzó su límite."

        return response, status.HTTP_200_OK

    except Exception as e:
        return {'error': f'Something went wrong: {str(e)}'}, status.HTTP_500_INTERNAL_SERVER_ERROR
    
#para usuarios outentificados--usando _calculate_payment_total_from_items
def calculate_payment_total(cart, shipping_id=None, coupon_code=None):
    try:
        cart_items = CartItem.objects.filter(cart=cart)

        if not cart_items.exists():
            return {'error': 'Need to have items in cart'}, status.HTTP_404_NOT_FOUND

        items = []
        for cart_item in cart_items:
            items.append({
                "product": cart_item.product,
                "count": cart_item.count,
                "talla": cart_item.talla,
                "color": cart_item.color,
            })

        return _calculate_payment_total_from_items(
            items=items,
            shipping_id=shipping_id,
            coupon_code=coupon_code,
            user=cart.user
        )

    except Exception as e:
        return {'error': f'Something went wrong: {str(e)}'}, status.HTTP_500_INTERNAL_SERVER_ERROR


def calculate_payment_total_guest(checkout_data, shipping_id=None, coupon_code=None):
    try:
        if not checkout_data:
            return {'error': 'Need to have items in checkout_data'}, status.HTTP_404_NOT_FOUND

        items = []

        for raw_item in checkout_data:
            product_id = raw_item.get("product_id")
            count = raw_item.get("count", 0)
            talla = raw_item.get("talla")
            color = raw_item.get("color")

            if not product_id:
                return {'error': 'A product_id is required in checkout_data'}, status.HTTP_400_BAD_REQUEST

            try:
                product = ProductUnidad.objects.get(id=product_id)
            except ProductUnidad.DoesNotExist:
                return {'error': f'Product with id {product_id} not found'}, status.HTTP_404_NOT_FOUND

            items.append({
                "product": product,
                "count": count,
                "talla": talla,
                "color": color,
            })

        return _calculate_payment_total_from_items(
            items=items,
            shipping_id=shipping_id,
            coupon_code=coupon_code,
            user=None
        )

    except Exception as e:
        return {'error': f'Something went wrong: {str(e)}'}, status.HTTP_500_INTERNAL_SERVER_ERROR
    



