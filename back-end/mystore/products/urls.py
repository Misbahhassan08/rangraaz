from django.urls import path
from .views import create_product, all_data, item_delete, item_update,create_category,create_subcategory,all_categories,subcategories_by_category,create_payment,link_category_subcategory
from .views import update_slider,get_slider,manage_announcement,sale_products,total_products_count

urlpatterns = [
    path('products/create/', create_product, name='create_product'),
    path('products/', all_data, name='all_products'),
    path('products/<int:pk>/delete/', item_delete, name='delete_product'),
    path('products/<int:pk>/update/', item_update, name='update_product'),
    
    path('categories/create/', create_category, name='create_category'),
    path('subcategories/create/', create_subcategory, name='create_subcategory'),
    
    path('categories/all/', all_categories, name='all_categories'),
    path('subcategories/<int:category_id>/', subcategories_by_category),
       
    path("create-payment/", create_payment, name="create-payment"),
    path('update-slider/', update_slider, name='update-slider'),
    path('get-slider/',get_slider,name='get_slider'),
    path('manage_announcement/', manage_announcement, name='manage_announcement'),
    path('sale-items/', sale_products, name='sale_products'),
    path('link-category-subcategory/', link_category_subcategory, name='link_category_subcategory'),
    path('total-products/', total_products_count, name='total_products_count'),
]
