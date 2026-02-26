from django.urls import path
from .views import signin,signup,getallusers,update_role,get_roles

urlpatterns = [
    path('signup/',signup, name='signup'),
    path('signin/', signin, name='signin'),
    path('getallusers/', getallusers,name='all_data'),
    path("update-role/<int:pk>/", update_role, name="update_role"),
   path("roles/", get_roles, name="get_roles"),  # get all roles


]
