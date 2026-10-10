from rest_framework import routers
from rest_framework_simplejwt.views import TokenRefreshView

from .views import *
from django.urls import path, include

router = routers.DefaultRouter()

urlpatterns = [
    path('',include(router.urls)),
    path('register/',RegisterView.as_view(),name='register'),
    path('login/',CustomLoginView.as_view(),name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),  # НОВОЕ
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/',UserViewset.as_view(), name='check profile'),
    path('booking/',MyBookingListViewset.as_view(), name='mybooking'),
    path('hotel/',HotelListViewset.as_view(), name='hotel'),
    path('hotel/<int:pk>/',HotelDetailViewset.as_view(), name='hotel detail'),
    path('hotel/<int:pk>/rooms/',RoomListViewset.as_view(), name='rooms'),
    path('hotel/room/<int:pk>/',RoomDetailViewset.as_view(), name='hotel detail'),
]