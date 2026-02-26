# views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Customer,Role
import json

@csrf_exempt
def signup(request):
    if request.method == 'POST':
        print("api called")
        try:
            data = json.loads(request.body)

            name = data.get('name')
            phone = data.get('phone')
            password = data.get('password')
            address = data.get('address')

            # Check if user already exists
            if Customer.objects.filter(phone=phone).exists():
                return JsonResponse({'status': 'error', 'message': 'User already exists'}, status=400)

            # Create new user
            user = Customer.objects.create(
                name=name,
                phone=phone,
                password=password,
                address=address
            )

            return JsonResponse({
                'status': 'success',
                'message': 'User created successfully',
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'phone': user.phone,
                    'address': user.address
                }
            })

        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Only POST method allowed'}, status=405)





@csrf_exempt
def signin(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            phone = data.get('phone')
            password = data.get('password')
         

            # Now use role_obj in filter
            user = Customer.objects.filter(phone=phone, password=password).first()

            if user:
                return JsonResponse({
                    'status': 'success',
                    'message': 'Login successful',
                    'user': {
                        'id': user.id,
                        'name': user.name,
                        'phone': user.phone,
                        'address': user.address,
                        'role': user.role.role  # Get string value
                    }
                })
            else:
                return JsonResponse({'status': 'error', 'message': 'Invalid phone, password, or role'}, status=401)

        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Only POST method allowed'}, status=405)


@csrf_exempt
def getallusers(request):
    members = Customer.objects.select_related("role").all()
    data = [
        {
            "id": m.id,
            "name": m.name,
              "address": m.address,
              "role_id": m.role.id if m.role else None,   
            "role_name": m.role.role if m.role else None         }
        for m in members
    ]
    return JsonResponse({"data": data})






@csrf_exempt
def update_role(request, pk):
    if request.method == "POST":
        try:
            body = json.loads(request.body)
            new_role_id = body.get("role_id")

            # Check role exists
            try:
                role = Role.objects.get(id=new_role_id)
            except Role.DoesNotExist:
                return JsonResponse({"success": False, "message": "Role not found"})

            # Update customer role
            customer = Customer.objects.get(id=pk)
            customer.role = role
            customer.save()

            return JsonResponse({
                "success": True,
                "message": "Role updated successfully",
                "user": {
                    "id": customer.id,
                    "name": customer.name,
                    "address": customer.address,
                    "role_name": customer.role.role,
                }
            })

        except Customer.DoesNotExist:
            return JsonResponse({"success": False, "message": "Customer not found"})

    return JsonResponse({"success": False, "message": "Invalid request method"})



@csrf_exempt
def get_roles(request):
    if request.method == "GET":
        roles = list(Role.objects.all().values("id", "role"))
        return JsonResponse(roles, safe=False)
