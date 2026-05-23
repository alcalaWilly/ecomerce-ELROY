from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from .models import Cart, CartItem

from rest_framework import permissions, status
from apps.product.models import ProductUnidad
from apps.product.serializers import ProductUnidadSerializer

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
# Create your views here.
import traceback  # ✅ Importar para depuración
from apps.product.models import Talla
from django.shortcuts import get_object_or_404



class GetItemsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = request.user
        try:
            cart = Cart.objects.get(user=user)
            # Optimizar con select_related para evitar múltiples consultas
            cart_items = CartItem.objects.filter(cart=cart).select_related('product').order_by('product')

            # Usar comprensión de listas y manejar excepciones
            result = [
                {
                    'id': cart_item.id,
                    'count': cart_item.count,
                    'talla': cart_item.talla,
                    'color': cart_item.color,
                    'product': ProductUnidadSerializer(cart_item.product).data
                }
                for cart_item in cart_items
                if cart_item.product  # Solo si el producto existe
            ]

            return Response({'cart': result}, status=status.HTTP_200_OK)

        except Cart.DoesNotExist:
            return Response(
                {'error': 'El carrito no existe.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error al recuperar los elementos del carrito: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AddItemView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        user = request.user if request.user.is_authenticated else None
        data = request.data

        try:
            # Obtener los datos
            product_id = int(data.get('product_id'))
            count = int(data.get('count', 1))
            talla_id = data.get('talla_id', None)
            if talla_id is not None:
                talla_id = int(talla_id)

            color = data.get('color', None)
            # Asegurarse de que el color se maneje correctamente (sin espacios y en minúsculas)
            if color:
                color = color.strip().lower()  # Eliminar espacios y convertir a minúsculas

            # Validar existencia del producto
            if not ProductUnidad.objects.filter(id=product_id).exists():
                return Response({'error': 'Este producto no existe'}, status=status.HTTP_404_NOT_FOUND)

            product = ProductUnidad.objects.get(id=product_id)
            cart, created = Cart.objects.get_or_create(user=user)

            # Depuración: Verificar los datos recibidos
            print(f"Buscando carrito para el producto: {product_id}, talla: {talla_id}, color: {color}")

            # Buscar el ítem del carrito, considerando talla y color
            cart_item = CartItem.objects.filter(cart=cart, product=product, talla=talla_id, color=color).first()

            if cart_item:
                # Si el ítem con la misma talla y color ya existe, incrementar la cantidad
                cart_item.count += count
                cart_item.save()
                print(f"Producto encontrado, cantidad incrementada a {cart_item.count}")
            else:
                # Crear un nuevo ítem si la combinación de talla y color es diferente
                CartItem.objects.create(
                    cart=cart,
                    product=product,
                    count=count,
                    color=color,
                    talla=talla_id
                )
                cart.total_items += 1  # Incrementar total de ítems
                print(f"Nuevo producto agregado al carrito: {product_id}, talla: {talla_id}, color: {color}")

            cart.save()

            # Respuesta con ítems actualizados
            cart_items = CartItem.objects.filter(cart=cart).order_by('product')
            result = [
                {
                    'id': cart_item.id,
                    'count': cart_item.count,
                    'color': cart_item.color,
                    'talla': cart_item.talla,
                    'product': ProductUnidadSerializer(cart_item.product).data
                }
                for cart_item in cart_items
            ]

            return Response({'cart': result}, status=status.HTTP_201_CREATED)

        except ValueError:
            return Response(
                {'error': 'El valor de talla debe ser un número válido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Error al agregar el producto al carrito: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GetTotalView(APIView): 
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request, format=None):
        user = self.request.user

        try:
            cart = Cart.objects.get(user=user)
            cart_items = CartItem.objects.filter(cart=cart)

            total_cost = 0.0
            total_compare_cost = 0.0

            if cart_items.exists():
                for cart_item in cart_items:
                    product = cart_item.product
                    discounted_price = product.get_discounted_price()  # Aplica descuento si hay promociones activas

                    total_cost += float(discounted_price) * float(cart_item.count)
                    total_compare_cost += float(product.price) * float(cart_item.count)  # Precio original sin descuento

                total_cost = round(total_cost, 2)
                total_compare_cost = round(total_compare_cost, 2)

            return Response(
                {'total_cost': total_cost, 'total_compare_cost': total_compare_cost},
                status=status.HTTP_200_OK
            )
        except Cart.DoesNotExist:
            return Response(
                {'error': 'El carrito no existe.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error al calcular el total: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class GetItemTotalView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        user = self.request.user

        try:
            cart = Cart.objects.get(user=user)
            total_items = CartItem.objects.filter(cart=cart).count()  # Recalcular total
            cart.total_items = total_items
            cart.save()

            return Response(
                {'total_items': total_items},
                status=status.HTTP_200_OK
            )
        except Cart.DoesNotExist:
            return Response(
                {'total_items': 0},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': f'Error al obtener el total de elementos: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UpdateItemView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request, format=None):
        user = request.user
        data = request.data

        # Imprimir los datos recibidos para depuración
        print("Datos recibidos:", data)

        try:
            # Validaciones iniciales
            product_id = int(data.get('product_id'))
            count = int(data.get('count', 1))
            talla_id = data.get('talla_id', None)
            color_id = data.get('color', None)

            # Convertir 'null' como string a None
            if talla_id == 'null' or talla_id == '':
                talla_id = None
            if color_id == 'null' or color_id == '':
                color_id = None

            # Si talla_id es proporcionada, convertir a entero
            if talla_id is not None:
                talla_id = int(talla_id)

            # Imprimir los valores y sus tipos de datos para inspección
            print(f"📌 PRODUCTO: {product_id} Tipo de dato: {type(product_id)}")
            print(f"📌 TALLA: {talla_id} Tipo de dato: {type(talla_id)}")
            print(f"📌 COLOR: {color_id} Tipo de dato: {type(color_id)}")

        except ValueError:
            return Response(
                {'error': 'Product ID, count y talla deben ser valores enteros válidos'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Validar existencia del producto
            product = ProductUnidad.objects.filter(id=product_id).first()
            if not product:
                return Response({'error': 'Este producto no existe'}, status=status.HTTP_404_NOT_FOUND)

            # Obtener el carrito del usuario
            cart = Cart.objects.get(user=user)

            # Buscar el ítem del carrito con la talla específica si aplica
            cart_item = CartItem.objects.filter(
                cart=cart,
                product=product,
                talla=talla_id if talla_id is not None else None,
                color=color_id if color_id is not None else None
            ).first()

            if not cart_item:
                return Response({'error': 'Este producto no está en tu carrito'}, status=status.HTTP_404_NOT_FOUND)

            # Validar stock
            if count > product.stock:
                return Response(
                    {'error': 'No hay suficiente stock disponible'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Si el resultado es 0 o menos, eliminar el ítem
            nueva_cantidad = cart_item.count + count
            if nueva_cantidad <= 0:
                cart_item.delete()
                print("🗑️ Producto eliminado del carrito")
            else:
                # Actualizar cantidad
                cart_item.count = nueva_cantidad
                cart_item.save()
                print("✅ Cantidad después de actualizar:", cart_item.count)

            # Construir la respuesta con el carrito actualizado
            cart_items = CartItem.objects.filter(cart=cart).order_by('product')
            result = [
                {
                    'id': item.id,
                    'count': item.count,
                    'color': item.color,
                    'talla': item.talla,
                    'product': ProductUnidadSerializer(item.product).data
                }
                for item in cart_items
            ]

            return Response({'cart': result}, status=status.HTTP_200_OK)

        except Cart.DoesNotExist:
            return Response({'error': 'Carrito no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response(
                {'error': f'Ocurrió un error al actualizar el carrito: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class RemoveItemView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, format=None):
        user = request.user
        data = request.data

        # Imprimir los datos recibidos
        print("Datos recibidos:", data)

        try:
            # Obtener valores
            product_id = int(data.get('product_id'))
            talla_id = data.get('talla_id', None)
            color_id = data.get('color', None)

            # Imprimir los tipos de datos y valores para inspección
            print(f"📌 PRODUCTO: {product_id} Tipo de dato: {type(product_id)}")
            print(f"📌 TALLA: {talla_id} Tipo de dato: {type(talla_id)}")
            print(f"📌 COLOR: {color_id} Tipo de dato: {type(color_id)}")

            # Validación: Talla como número o null
            if talla_id not in [None, "null", ""]:
                try:
                    talla_id = int(talla_id)
                except ValueError:
                    return Response(
                        {'error': 'La talla debe ser un número válido o null'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                talla_id = None  # Convertir 'null' o cadena vacía a None

            # Validación: Color como string (o null)
            if color_id == 'null' or color_id == '':
                color_id = None  # Convertir 'null' o cadena vacía a None
            elif isinstance(color_id, str) and color_id.strip():
                color_id = color_id.strip().lower()
            else:
                color_id = None  # Ignorar si es nulo o cadena vacía

            # Validar que al menos uno esté presente
            if talla_id is None and color_id is None:
                return Response(
                    {'error': 'Debe enviarse al menos talla o color válido'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        except ValueError:
            return Response(
                {'error': 'Product ID debe ser un número válido'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Validar existencia del producto
            if not ProductUnidad.objects.filter(id=product_id).exists():
                return Response(
                    {'error': 'Este producto no existe'},
                    status=status.HTTP_404_NOT_FOUND
                )

            product = ProductUnidad.objects.get(id=product_id)
            cart = Cart.objects.get(user=user)

            # Si talla es número y color es null, eliminamos por talla
            if talla_id is not None and color_id is None:
                cart_item = CartItem.objects.filter(cart=cart, product=product, talla=talla_id, color__isnull=True).first()

            # Si talla es null y color es string, eliminamos por color
            elif talla_id is None and color_id is not None:
                cart_item = CartItem.objects.filter(cart=cart, product=product, talla__isnull=True, color=color_id).first()

            # Si no se encuentra el producto, retornamos error
            if not cart_item:
                return Response(
                    {'error': 'No se encontró el producto con la talla y/o color especificado'},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Eliminar el ítem
            cart_item.delete()
            print("🗑️ Producto eliminado del carrito")

            # Actualizar total de ítems
            total_items = max(cart.total_items - 1, 0)
            Cart.objects.filter(user=user).update(total_items=total_items)

            # Respuesta con el carrito actualizado
            cart_items = CartItem.objects.filter(cart=cart).order_by('product')
            result = [
                {
                    'id': item.id,
                    'count': item.count,
                    'talla': item.talla,
                    'color': item.color,
                    'product': ProductUnidadSerializer(item.product).data
                }
                for item in cart_items
            ]

            return Response({'cart': result}, status=status.HTTP_200_OK)

        except Cart.DoesNotExist:
            return Response(
                {'error': 'Carrito no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {'error': f'Ocurrió un error al eliminar el producto: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# BASIAR CARRITO:
class EmptyCartView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def delete(self, request, format=None):
        user = self.request.user

        try:
            cart = Cart.objects.get(user=user)

            if not CartItem.objects.filter(cart=cart).exists():
                return Response(
                    {'success': 'Cart is already empty'},
                    status=status.HTTP_200_OK)

            CartItem.objects.filter(cart=cart).delete()

            # Actualizamos carrito
            Cart.objects.filter(user=user).update(total_items=0)

            return Response(
                {'success': 'Cart emptied successfully'},
                status=status.HTTP_200_OK)
        except:
            return Response(
                {'error': 'Something went wrong emptying cart'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# SINCRONIZAR, CADA QUE SE AGREGA, BORRA, ETC:
class SynchCartView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def put(self, request, format=None):
        user = self.request.user
        data = self.request.data

        try:
            cart_items = data['cart_items']

            for cart_item in cart_items:
                cart = Cart.objects.get(user=user)

                try:
                    product_id = int(cart_item['product_id'])
                except:
                    return Response(
                        {'error': 'Product ID must be an integer'},
                        status=status.HTTP_404_NOT_FOUND)

                if not ProductUnidad.objects.filter(id=product_id).exists():
                    return Response(
                        {'error': 'Product with this ID does not exist'},
                        status=status.HTTP_404_NOT_FOUND)

                product = ProductUnidad.objects.get(id=product_id)
                stock = product.stock

                if CartItem.objects.filter(cart=cart, product=product).exists():
                    # Actualiizamos el item del carrito
                    item = CartItem.objects.get(cart=cart, product=product)
                    count = item.count

                    try:
                        cart_item_count = int(cart_item['count'])
                    except:
                        cart_item_count = 1

                    #Chqueo con base de datos
                    if (cart_item_count + int(count)) <= int(stock):
                        updated_count = cart_item_count + int(count)
                        CartItem.objects.filter(
                            cart=cart, product=product
                        ).update(count=updated_count)
                else:
                    #Agregar el item al carrito del usuario
                    try:
                        cart_item_count = int(cart_item['count'])
                    except:
                        cart_item_count = 1

                    if cart_item_count <= stock:
                        CartItem.objects.create(
                            product=product, cart=cart, count=cart_item_count
                        )

                        if CartItem.objects.filter(cart=cart, product=product).exists():
                            #Sumar item
                            total_items = int(cart.total_items) + 1
                            Cart.objects.filter(user=user).update(
                                total_items=total_items
                            )

                return Response(
                {'success': 'Cart Synchronized'},
                status=status.HTTP_201_CREATED)
        except:
            return Response(
                {'error': 'Something went wrong when synching cart'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR)











