import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Products, CategorySubCategory ,Category,SubCategory
import os
import uuid
import requests
from dotenv import load_dotenv
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.views.decorators.csrf import csrf_exempt
from .models import Slider
from .models import SiteSettings
from django.core.mail import send_mail
from django.conf import settings


load_dotenv()

SQUARE_ACCESS_TOKEN = os.getenv("SQUARE_ACCESS_TOKEN")
SQUARE_LOCATION_ID = os.getenv("SQUARE_LOCATION_ID")





@csrf_exempt
def create_payment(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid method, only POST allowed"}, status=405)

    try:
        data = json.loads(request.body)
        source_id = data.get("sourceId")
        amount = data.get("amount")  
        user_email = data.get("email") 
        user_name = data.get("name", "Valued Customer")

        # Basic Validation
        if not source_id or not amount or not user_email:
            return JsonResponse({"error": "Missing sourceId, amount, or email"}, status=400)

        # Square API Setup
        url = "https://connect.squareupsandbox.com/v2/payments"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.SQUARE_ACCESS_TOKEN}",
            "Accept": "application/json"
        }

        payload = {
            "idempotency_key": str(uuid.uuid4()),
            "source_id": source_id,
            "amount_money": {
                "amount": int(amount), 
                "currency": "USD"
            },
            "location_id": settings.SQUARE_LOCATION_ID
        }

        # Request to Square
        response = requests.post(url, json=payload, headers=headers)
        res_json = response.json()

        if res_json.get("payment") and res_json["payment"].get("status") in ["COMPLETED", "APPROVED"]:
            
            # --- EMAIL LOGIC ---
            actual_amount = int(amount) / 100 
            subject = f"Payment Confirmed - Rang Raaz (Ref: {res_json['payment']['id'][:8]})"
            
            message = (
                f"Hi {user_name},\n\n"
                f"Thank you! Your payment of {actual_amount} USD has been successfully processed via Card.\n"
                f"Payment ID: {res_json['payment']['id']}\n\n"
                "Your order is now being processed. We will notify you once it's shipped.\n\n"
                "Best regards,\n"
                "Team Rang Raaz"
            )

            try:
                send_mail(
                    subject,
                    message,
                    settings.EMAIL_HOST_USER, 
                    [user_email],            
                    fail_silently=False,
                )
                print(f"✅ Card Payment Email sent successfully to {user_email}")
            except Exception as mail_err:
                print(f"❌ Failed to send email: {str(mail_err)}")

            return JsonResponse({"success": True, "payment": res_json["payment"]})
        
        else:
            return JsonResponse({
                "success": False, 
                "error": res_json.get("errors", "Payment failed at Square")
            }, status=400)

    except Exception as e:
        print("Exception in create_payment:", str(e))
        return JsonResponse({"success": False, "error": str(e)}, status=500)









@csrf_exempt
@require_http_methods(["POST"])
def create_product(request):
    try:
        sku = request.POST.get('sku', '').strip()

        if len(sku) < 5:
            return JsonResponse({'error': 'SKU must be at least 5 characters long.'}, status=400)

        product = Products.objects.create(
            product_name=request.POST.get('product_name'),
            original_price=float(request.POST.get('original_price')),
            category_id=request.POST.get('category_id'),
            subcategory_id=request.POST.get('subcategory_id'),
            quantity=int(request.POST.get('quantity')),
            sku=sku,
            size=request.POST.get('size'),
            vendor=request.POST.get('vendor'),
            image=request.FILES.get('image'),
            is_sale_on=request.POST.get('is_sale_on') == "true",
            discount_percentage=int(request.POST.get('discount_percentage') or 0),
            product_type=request.POST.get('product_type')
        )

        return JsonResponse({'message': 'Product created successfully'}, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
    
@csrf_exempt
@require_http_methods(["GET"])
def all_data(request):
    try:
        products = Products.objects.select_related('category', 'subcategory').all()

        data = []
        for product in products:
            try:
                img_url = product.image.url if product.image else ""
            except Exception:
                img_url = ""

            product_info = {
                'id': product.id,
                'product_name': product.product_name,
                'category': product.category.name if product.category else "N/A",
                'sub_category': product.subcategory.name if product.subcategory else "N/A",
                'original_price': product.original_price, 
                'sell_price': product.sell_price,
                'discount_percentage': product.discount_percentage,
                'is_sale_on': product.is_sale_on, 
                'quantity': product.quantity,
                'image_url': img_url, 
                'sku': product.sku,
                'size': product.size, 
                'vendor': product.vendor,
                'product_type': product.product_type,
            }
            data.append(product_info)
        
        return JsonResponse({'data': data}, safe=False)

    except Exception as e:
        print(f"Error in all_data: {str(e)}")
        return JsonResponse({'data': [], 'error': str(e)}, status=500)
    
    
    
# DELETE PRODUCT
@csrf_exempt
@require_http_methods(["DELETE"])
def item_delete(request, pk):
    try:
        item = Products.objects.get(pk=pk)
        item.delete()
        return JsonResponse({'message': 'Product deleted successfully'}, status=200)
    except Products.DoesNotExist:
        return JsonResponse({'error': 'Product not found'}, status=404)



# UPDATE PRODUCT
@csrf_exempt
@require_http_methods(["PUT"])
def item_update(request, pk):
    try:
        item = Products.objects.get(pk=pk)
    except Products.DoesNotExist:
        return JsonResponse({'error': 'Product not found'}, status=404)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    # Basic Fields
    if 'product_name' in data: item.product_name = data['product_name']
    if 'brand' in data: item.brand = data['brand']  
    if 'product_type' in data: item.product_type = data['product_type']
    if 'quantity' in data: item.quantity = int(data['quantity'])
    if 'vendor' in data: item.vendor = data['vendor']
    if 'image_url' in data: item.image_url = data['image_url']
    if 'sku' in data: item.sku = data['sku']
    if 'size' in data: item.size = data['size']

    if 'original_price' in data:
        item.original_price = float(data['original_price'])
    if 'discount_percentage' in data:
        item.discount_percentage = int(data['discount_percentage'])
    if 'is_sale_on' in data:
        item.is_sale_on = data['is_sale_on']
    # --------------------------------------------------

    if 'category_subcategory' in data:
        try:
            category = CategorySubCategory.objects.get(pk=data['category_subcategory'])
            item.category_subcategory = category
        except CategorySubCategory.DoesNotExist:
            return JsonResponse({'error': 'Invalid category_subcategory ID'}, status=400)

    item.save()
    return JsonResponse({'message': 'Product updated successfully', 'sell_price': item.sell_price})


# apis for categories

@csrf_exempt
@require_http_methods(["POST"])
def create_category(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    name = data.get('name')
    description = data.get('description', '')

    # Check if the category already exists
    if Category.objects.filter(name=name).exists():
        return JsonResponse({'error': 'Category with this name already exists'}, status=400)

    category = Category.objects.create(name=name, description=description)

    return JsonResponse({
        'id': category.id,
        'name': category.name,
        'description': category.description
    }, status=201)





@csrf_exempt
@require_http_methods(["POST"])
def create_subcategory(request):
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    name = data.get('name')
    description = data.get('description', '')

    if not name:
        return JsonResponse({'error': 'SubCategory name is required'}, status=400)

    if SubCategory.objects.filter(name=name).exists():
        return JsonResponse({'error': 'SubCategory with this name already exists'}, status=400)

    subcategory = SubCategory.objects.create(
        name=name,
        description=description
    )

    return JsonResponse({
        'id': subcategory.id,
        'name': subcategory.name,
        'description': subcategory.description,
        'message': 'SubCategory created successfully without link'
    }, status=201)


@csrf_exempt
@require_http_methods(["POST"])
def link_category_subcategory(request):
    try:
        data = json.loads(request.body)
        category_id = data.get('category_id')
        subcategory_id = data.get('subcategory_id')

        if not category_id or not subcategory_id:
            return JsonResponse({'error': 'both category_id aur subcategory_id are neccesary'}, status=400)

        try:
            category = Category.objects.get(id=category_id)
            subcategory = SubCategory.objects.get(id=subcategory_id)
        except (Category.DoesNotExist, SubCategory.DoesNotExist):
            return JsonResponse({'error': 'Category or subcategory not found'}, status=404)

        relation, created = CategorySubCategory.objects.get_or_create(
            category=category, 
            subcategory=subcategory
        )

        if created:
            return JsonResponse({'message': f'Category {category.name} andnSubCategory {subcategory.name} are linked!'}, status=201)
        else:
            return JsonResponse({'message': 'link already found'}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

#show all user
@csrf_exempt
def all_categories(request):
    category = Category.objects.all().values()
    return JsonResponse({'data': list(category)})





@csrf_exempt
def subcategories_by_category(request, category_id):
    # Get all CategorySubCategory objects filtered by category_id
    category_subcategories = CategorySubCategory.objects.filter(category_id=category_id)

    # Extract subcategory objects
    subcategories = [cs.subcategory for cs in category_subcategories]

    # Prepare list of dictionaries with subcategory data
    subcategories_data = [{'id': sub.id, 'name': sub.name} for sub in subcategories]

    return JsonResponse({'data': subcategories_data})



@csrf_exempt
def update_slider(request):
    if request.method == 'POST':
        try:
            image_file = request.FILES.get('sliderImage')
            index = request.POST.get('slideIndex')
            custom_link = request.POST.get('link')

            slider = Slider.objects.filter(slide_index=index).first()
            
            if image_file:
                final_image = image_file
            elif slider:
                final_image = slider.image
            else:
                return JsonResponse({'status': 'error', 'message': 'No image provided'}, status=400)

            slider, created = Slider.objects.update_or_create(
                slide_index=index,
                defaults={
                    'image': final_image, 
                    'link': custom_link
                }
            )
            return JsonResponse({'status': 'success', 'message': f'Slide {index} updated!'})
        except Exception as e:
            print(f"ERROR: {str(e)}") 
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)    
        
        
        
@csrf_exempt   
def get_slider(request):
    try:
        sliders = Slider.objects.all().order_by('slide_index')
        data = {}
        for s in sliders:
            data[str(s.slide_index)] = {
                "image": s.image.url if s.image else "",
                "link": s.link if s.link else ""
            }
        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)








@csrf_exempt
def manage_announcement(request):
    settings, created = SiteSettings.objects.get_or_create(id=1)

    if request.method == "POST":
        try:
            data = json.loads(request.body)
            settings.announcement_text = data.get('announcement_text', settings.announcement_text)
            settings.is_scrolling = data.get('is_scrolling', settings.is_scrolling)
            settings.save()
            return JsonResponse({
                "message": "Updated successfully",
                "text": settings.announcement_text,
                "is_scrolling": settings.is_scrolling
            })
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({
        "text": settings.announcement_text,
        "is_scrolling": settings.is_scrolling
    })









# GET ONLY SALE PRODUCTS
@csrf_exempt
@require_http_methods(["GET"])
def sale_products(request):
    # Filter products where is_sale_on is True
    products = Products.objects.filter(is_sale_on=True).select_related(
        'category_subcategory__category', 
        'category_subcategory__subcategory'
    )

    data = []
    for product in products:
        product_info = {
            'id': product.id,
            'product_name': product.product_name,
            'category': product.category_subcategory.category.name,
            'original_price': product.original_price, 
            'sell_price': product.sell_price,
            'discount_percentage': product.discount_percentage,
            'is_sale_on': product.is_sale_on, 
            'quantity': product.quantity,
            'image_url': product.image_url,
            'sku': product.sku,
            'size': product.size,
            'product_type': product.product_type,
        }
        data.append(product_info)
    
    return JsonResponse({'data': data}, safe=False)



# TOTAL PRODUCTS COUNT API
@csrf_exempt
@require_http_methods(["GET"])
def total_products_count(request):
    """
    Returns the total number of products available in the table.
    """
    try:
        count = Products.objects.count()
        
        return JsonResponse({
            'success': True, 
            'total_products': count
        }, status=200)
    except Exception as e:
        return JsonResponse({
            'success': False, 
            'error': str(e)
        }, status=500)
        
@csrf_exempt
@require_http_methods(["GET"])
def get_product_by_sku(request, sku):
    try:
        product = Products.objects.get(sku=sku)
        img_url = product.image.url if product.image else ""
        
        data = {
            'id': product.id,
            'product_name': product.product_name,
            'sku': product.sku,
            'quantity': product.quantity,
            'sell_price': product.sell_price,
            'image_url': img_url,
         
        }
        return JsonResponse({'success': True, 'product': data}, status=200)
    except Products.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'Product not found'}, status=404)

@csrf_exempt
@require_http_methods(["PUT"])
def update_stock(request, pk):
    try:
        product = Products.objects.get(pk=pk)
    except Products.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Product not found'}, status=404)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)

    new_quantity = data.get('quantity')

    if new_quantity is None:
        return JsonResponse({'success': False, 'error': 'quantity field required'}, status=400)

    if int(new_quantity) < 0:
        return JsonResponse({'success': False, 'error': 'quantity cannot be negative'}, status=400)

    product.quantity = int(new_quantity)
    product.save()

    return JsonResponse({
        'success': True,
        'message': 'Stock updated successfully',
        'id': product.id,
        'new_quantity': product.quantity
    }, status=200)