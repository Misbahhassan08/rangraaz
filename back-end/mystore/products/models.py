from django.db import models
from cloudinary.models import CloudinaryField
class Products(models.Model):
    product_name = models.CharField(max_length=255)
    product_type = models.CharField(max_length=100)
    image = CloudinaryField('image', null=True, blank=True)
    
    # --- Sale Fields ---
    original_price = models.FloatField(help_text="The actual price before discount.")
    discount_percentage = models.PositiveIntegerField(default=0)
    is_sale_on = models.BooleanField(default=False)
    sell_price = models.FloatField(editable=False)  
    
    quantity = models.PositiveIntegerField()
    
    category = models.ForeignKey(
        'Category', 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='products'
    )
    subcategory = models.ForeignKey(
        'SubCategory', 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='products'
    )
    
    size = models.CharField(max_length=50, blank=True, null=True)
    vendor = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, unique=True)

    def save(self, *args, **kwargs):
        orig_price = float(self.original_price or 0)
        discount = int(self.discount_percentage or 0)

        if self.is_sale_on and discount > 0:
            discount_amount = (orig_price * discount) / 100
            self.sell_price = round(orig_price - discount_amount, 2)
        else:
            self.sell_price = orig_price
        
        super(Products, self).save(*args, **kwargs)     
        
        
        
        
           
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class SubCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name
    


class CategorySubCategory(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='category_subcategories')
    subcategory = models.ForeignKey(SubCategory, on_delete=models.CASCADE, related_name='subcategory_categories')

    class Meta:
        unique_together = ('category', 'subcategory')  

    def __str__(self):
        return f"{self.category.name} - {self.subcategory.name}"
    
    
    
    
    
    
    
    
    
    
    
    
 # ..................slider.........

class Slider(models.Model):
    slide_index = models.IntegerField(unique=True) 
    image = CloudinaryField('image') 
    link = models.CharField(max_length=500, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Slide {self.slide_index}"

class SiteSettings(models.Model):
    announcement_text = models.CharField(max_length=255)
    is_scrolling = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.announcement_text
    
    
    
    