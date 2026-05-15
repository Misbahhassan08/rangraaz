import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Products, CategorySubCategory, Category, SubCategory, ProductImage,SizeStock
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
from .models import CustomPage, PageBlock
from django.core.mail import send_mail
from django.conf import settings


load_dotenv()

SQUARE_ACCESS_TOKEN = os.getenv("SQUARE_ACCESS_TOKEN")
SQUARE_LOCATION_ID = os.getenv("SQUARE_LOCATION_ID")


def product_to_dict(product):
    first_image = product.images.first()
    return {
        'id': product.id,
        'product_name': product.product_name,
        'category': product.category.name if product.category else "N/A",
        'category_id': product.category_id,
        'sub_category': product.subcategory.name if product.subcategory else "N/A",
        'subcategory_id': product.subcategory_id,
        'original_price': product.original_price,
        'sell_price': product.sell_price,
        'discount_percentage': product.discount_percentage,
        'is_sale_on': product.is_sale_on,
        'quantity': product.quantity,
        'image_url': first_image.image.url if first_image else "",
        'images': [
            {'id': img.id, 'image_url': img.image.url, 'order': img.order}
            for img in product.images.all()
        ],
        'size_stocks': [
            {'size': ss.size, 'quantity': ss.quantity}
            for ss in product.size_stocks.all()
        ],
        'sku': product.sku,
        'vendor': product.vendor,
        'product_type': product.product_type,
    }


def serialize_page(page, include_blocks=True):
    data = {
        'id': page.id,
        'title': page.title,
        'slug': page.slug,
        'status': page.status,
        'meta_description': page.meta_description or '',
        'show_in_header': page.show_in_header,
        'nav_label': page.nav_label or page.title,
        'nav_parent': page.nav_parent_id,
        'nav_parent_slug': page.nav_parent.slug if page.nav_parent else '',
        'nav_image_url': page.nav_image.url if page.nav_image else '',
        'sort_order': page.sort_order,
        'created_at': page.created_at,
        'updated_at': page.updated_at,
    }

    if include_blocks:
        blocks = []
        for block in page.blocks.all():
            products = []
            if block.block_type == 'products' and block.product_ids:
                product_qs = Products.objects.filter(id__in=block.product_ids).select_related(
                    'category',
                    'subcategory',
                ).prefetch_related('images', 'size_stocks')
                product_map = {product.id: product_to_dict(product) for product in product_qs}
                products = [product_map[pid] for pid in block.product_ids if pid in product_map]

            blocks.append({
                'id': block.id,
                'block_type': block.block_type,
                'title': block.title or '',
                'subtitle': block.subtitle or '',
                'height': block.height,
                'image_url': block.image.url if block.image else '',
                'video_url': block.video.url if block.video else '',
                'link': block.link or '',
                'product_ids': block.product_ids or [],
                'products': products,
                'settings': block.settings or {},
                'sort_order': block.sort_order,
            })
        data['blocks'] = blocks
    return data


def save_page_from_request(request, page=None):
    title = request.POST.get('title', '').strip()
    slug = request.POST.get('slug', '').strip()
    if not title or not slug:
        raise ValueError('title and slug are required')

    page = page or CustomPage()
    page.title = title
    page.slug = slug
    page.status = request.POST.get('status', 'draft')
    page.meta_description = request.POST.get('meta_description', '')
    page.show_in_header = request.POST.get('show_in_header') == 'true'
    page.nav_label = request.POST.get('nav_label') or title
    page.sort_order = int(request.POST.get('sort_order') or 0)

    nav_parent = request.POST.get('nav_parent') or None
    page.nav_parent_id = nav_parent

    nav_image = request.FILES.get('nav_image')
    if nav_image:
        page.nav_image = nav_image

    page.save()

    existing_blocks = {block.id: block for block in page.blocks.all()}
    blocks = json.loads(request.POST.get('blocks', '[]'))
    page.blocks.all().delete()

    for index, block_data in enumerate(blocks):
        old_block = existing_blocks.get(block_data.get('id'))
        block_uid = block_data.get('uid') or str(index)
        block = PageBlock(
            page=page,
            block_type=block_data.get('block_type', 'products'),
            title=block_data.get('title', ''),
            subtitle=block_data.get('subtitle', ''),
            height=int(block_data.get('height') or 520),
            link=block_data.get('link', ''),
            product_ids=block_data.get('product_ids') or [],
            settings=block_data.get('settings') or {},
            sort_order=index,
        )

        image_file = request.FILES.get(f'block_{block_uid}_image')
        video_file = request.FILES.get(f'block_{block_uid}_video')
        if image_file:
            block.image = image_file
        elif old_block and old_block.image:
            block.image = old_block.image

        if video_file:
            block.video = video_file
        elif old_block and old_block.video:
            block.video = old_block.video

        block.save()

    return page



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
            quantity=0,  # ab SizeStock se calculate hoga
            sku=sku,
            vendor=request.POST.get('vendor'),
            is_sale_on=request.POST.get('is_sale_on') == "true",
            discount_percentage=int(request.POST.get('discount_percentage') or 0),
            product_type=request.POST.get('product_type')
        )

        # Images
        for index, img in enumerate(request.FILES.getlist('images')):
            ProductImage.objects.create(product=product, image=img, order=index)

        # Size stocks
        size_stocks = json.loads(request.POST.get('size_stocks', '[]'))
        total_qty = 0
        for item in size_stocks:
            if item.get('size') and item.get('quantity') is not None:
                qty = int(item['quantity'])
                SizeStock.objects.create(product=product, size=item['size'], quantity=qty)
                total_qty += qty

        # Total quantity update
        product.quantity = total_qty
        product.save()

        return JsonResponse({'message': 'Product created successfully'}, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)   
    
    
@csrf_exempt
@require_http_methods(["GET"])
def all_data(request):
    try:
        products = Products.objects.select_related('category', 'subcategory').prefetch_related('images', 'size_stocks').all()

        data = []
        for product in products:
            first_image = product.images.first()
            img_url = first_image.image.url if first_image else ""

            all_images = [
                {'id': img.id, 'image_url': img.image.url, 'order': img.order}
                for img in product.images.all()
            ]

            size_stocks = [
                {'size': ss.size, 'quantity': ss.quantity}
                for ss in product.size_stocks.all()
            ]

            product_info = {
                'id': product.id,
                'product_name': product.product_name,
                'category': product.category.name if product.category else "N/A",
                'category_id': product.category_id,
                'sub_category': product.subcategory.name if product.subcategory else "N/A",
                'subcategory_id': product.subcategory_id,
                'original_price': product.original_price,
                'sell_price': product.sell_price,
                'discount_percentage': product.discount_percentage,
                'is_sale_on': product.is_sale_on,
                'quantity': product.quantity,
                'image_url': img_url,
                'images': all_images,
                'size_stocks': size_stocks,  # ← naya
                'sku': product.sku,
                'vendor': product.vendor,
                'product_type': product.product_type,
            }
            data.append(product_info)

        return JsonResponse({'data': data}, safe=False)

    except Exception as e:
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
@require_http_methods(["POST", "PUT"])
def item_update(request, pk):
    try:
        item = Products.objects.get(pk=pk)
    except Products.DoesNotExist:
        return JsonResponse({'error': 'Product not found'}, status=404)

    if 'product_name' in request.POST: item.product_name = request.POST['product_name']
    if 'product_type' in request.POST: item.product_type = request.POST['product_type']
    if 'vendor' in request.POST: item.vendor = request.POST['vendor']
    if 'sku' in request.POST: item.sku = request.POST['sku']
    if 'original_price' in request.POST: item.original_price = float(request.POST['original_price'])
    if 'discount_percentage' in request.POST: item.discount_percentage = int(request.POST['discount_percentage'])
    if 'is_sale_on' in request.POST: item.is_sale_on = request.POST['is_sale_on'] == 'true'
    if 'category_id' in request.POST: item.category_id = request.POST['category_id']
    if 'subcategory_id' in request.POST: item.subcategory_id = request.POST['subcategory_id']

    # Size stocks update
    size_stocks_raw = request.POST.get('size_stocks', '')
    if size_stocks_raw:
        size_stocks = json.loads(size_stocks_raw)
        item.size_stocks.all().delete()
        total_qty = 0
        for s in size_stocks:
            if s.get('size') and s.get('quantity') is not None:
                qty = int(s['quantity'])
                SizeStock.objects.create(product=item, size=s['size'], quantity=qty)
                total_qty += qty
        item.quantity = total_qty

    item.save()

    # Nai images
    for index, img in enumerate(request.FILES.getlist('images')):
        ProductImage.objects.create(product=item, image=img, order=item.images.count() + index)

    return JsonResponse({'message': 'Product updated successfully', 'sell_price': str(item.sell_price)})



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
    products = Products.objects.filter(is_sale_on=True).select_related(
        'category',
        'subcategory',
    ).prefetch_related('images')

    data = []
    for product in products:
        first_image = product.images.first()
        product_info = {
            'id': product.id,
            'product_name': product.product_name,
            'category': product.category.name if product.category else "N/A",
            'category_id': product.category_id,
            'sub_category': product.subcategory.name if product.subcategory else "N/A",
            'subcategory_id': product.subcategory_id,
            'original_price': product.original_price, 
            'sell_price': product.sell_price,
            'discount_percentage': product.discount_percentage,
            'is_sale_on': product.is_sale_on, 
            'quantity': product.quantity,
            'image_url': first_image.image.url if first_image else "",
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
        product = Products.objects.prefetch_related('images').get(sku=sku)
        first_image = product.images.first()
        img_url = first_image.image.url if first_image else ""
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


@csrf_exempt
def page_list_create(request):
    if request.method == 'GET':
        pages = CustomPage.objects.prefetch_related('blocks').all()
        return JsonResponse({'data': [serialize_page(page, include_blocks=False) for page in pages]})

    if request.method == 'POST':
        try:
            page = save_page_from_request(request)
            return JsonResponse({'success': True, 'page': serialize_page(page)}, status=201)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

    return JsonResponse({'error': 'Invalid method'}, status=405)


@csrf_exempt
def page_detail_update_delete(request, pk):
    try:
        page = CustomPage.objects.prefetch_related('blocks').get(pk=pk)
    except CustomPage.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Page not found'}, status=404)

    if request.method == 'GET':
        return JsonResponse({'success': True, 'page': serialize_page(page)})

    if request.method in ['POST', 'PUT']:
        try:
            page = save_page_from_request(request, page)
            return JsonResponse({'success': True, 'page': serialize_page(page)})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

    if request.method == 'DELETE':
        page.delete()
        return JsonResponse({'success': True})

    return JsonResponse({'error': 'Invalid method'}, status=405)


@csrf_exempt
@require_http_methods(["GET"])
def page_by_slug(request, slug):
    try:
        page = CustomPage.objects.prefetch_related('blocks').get(slug=slug, status='published')
        return JsonResponse({'success': True, 'page': serialize_page(page)})
    except CustomPage.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Page not found'}, status=404)


@csrf_exempt
@require_http_methods(["GET"])
def header_pages(request):
    pages = CustomPage.objects.filter(
        status='published',
        show_in_header=True,
    ).select_related('nav_parent').order_by('sort_order', 'title')
    return JsonResponse({'data': [serialize_page(page, include_blocks=False) for page in pages]})
