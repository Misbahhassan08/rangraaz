from django.db import models

class Role(models.Model):
    ROLE_CHOICES = [
        ('superadmin', 'Super Admin'),
        ('admin', 'Admin'),
        ('customer', 'Customer'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')

    def __str__(self):
        return self.role


class Customer(models.Model):
    name = models.CharField(max_length=100) 
    password = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, null=True, blank=True) 
    address = models.CharField(max_length=255)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.role})"
