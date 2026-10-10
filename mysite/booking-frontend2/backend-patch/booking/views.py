from rest_framework import viewsets, generics, status
from .models import *
from .serializer import *
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class CustomLoginView(generics.GenericAPIView):
    serializer_class = CustomLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class LogoutView(generics.GenericAPIView):
    serializer_class = LogoutSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            refresh_token = serializer.validated_data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response({'detail': 'Невалидный токен'}, status=status.HTTP_400_BAD_REQUEST)


class UserViewset(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class HotelListViewset(generics.ListAPIView):
    queryset = Hotel.objects.all()
    serializer_class = HotelListSerializer

class HotelDetailViewset(generics.RetrieveAPIView):
    queryset = Hotel.objects.all()
    serializer_class = HotelDetailSerializer

class RoomListViewset(generics.RetrieveAPIView):
    queryset = Hotel.objects.all()
    serializer_class = HotelRoomsListSerializer

class RoomDetailViewset(generics.RetrieveAPIView):
    queryset = Hotel.objects.all()
    serializer_class = HotelRoomDetailSerializer

class MyBookingListViewset(generics.ListCreateAPIView):
    serializer_class = MyBookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # только брони текущего пользователя
        return (Booking.objects.filter(guest=self.request.user)
                .select_related('room__hotel').order_by('-created_date'))

    def perform_create(self, serializer):
        serializer.save(guest=self.request.user)