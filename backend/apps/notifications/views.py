# views.py - Updated with pagination and filtering
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework import filters
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import Notification
from .serializers import NotificationSerializer, MarkAsReadSerializer
from django_filters.rest_framework import DjangoFilterBackend

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_list(request):
    """
    Get all notifications for the current user
    """
    try:
        notifications = Notification.objects.filter(user=request.user)
        serializer = NotificationSerializer(notifications, many=True)
        
        # Calculate unread count
        unread_count = notifications.filter(is_read=False).count()
        
        return Response({
            'notifications': serializer.data,
            'unread_count': unread_count
        })
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch notifications'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """
    Mark a single notification as read
    """
    try:
        with transaction.atomic():
            notification = Notification.objects.get(
                id=notification_id, 
                user=request.user
            )
            
            if not notification.is_read:
                notification.is_read = True
                notification.save(update_fields=['is_read'])
            
            serializer = NotificationSerializer(notification)
            return Response(serializer.data)
            
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to mark notification as read'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """
    Mark all notifications as read for the current user
    """
    try:
        with transaction.atomic():
            # Get unread notifications for the user
            updated_count = Notification.objects.filter(
                user=request.user,
                is_read=False
            ).update(is_read=True)
            
            return Response({
                'message': f'Successfully marked {updated_count} notifications as read',
                'marked_count': updated_count
            })
            
    except Exception as e:
        return Response(
            {'error': 'Failed to mark all notifications as read'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_multiple_notifications_read(request):
    """
    Mark multiple specific notifications as read
    """
    try:
        serializer = MarkAsReadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        notification_ids = serializer.validated_data.get('notification_ids', [])
        mark_all = serializer.validated_data.get('mark_all', False)
        
        with transaction.atomic():
            if mark_all:
                # Mark all user notifications as read
                updated_count = Notification.objects.filter(
                    user=request.user,
                    is_read=False
                ).update(is_read=True)
            elif notification_ids:
                # Mark specific notifications as read
                updated_count = Notification.objects.filter(
                    id__in=notification_ids,
                    user=request.user,
                    is_read=False
                ).update(is_read=True)
            else:
                return Response(
                    {'error': 'No notification IDs provided'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            return Response({
                'message': f'Successfully marked {updated_count} notifications as read',
                'marked_count': updated_count
            })
            
    except Exception as e:
        return Response(
            {'error': 'Failed to mark notifications as read'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
class NotificationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_list(request):
    """
    Get paginated notifications for the current user with filtering
    """
    try:
        notifications = Notification.objects.filter(user=request.user)
        
        # Filter by read status
        is_read = request.GET.get('is_read')
        if is_read in ['true', 'false']:
            notifications = notifications.filter(is_read=is_read.lower() == 'true')
        
        # Paginate
        paginator = NotificationPagination()
        paginated_notifications = paginator.paginate_queryset(notifications, request)
        
        serializer = NotificationSerializer(paginated_notifications, many=True)
        
        return paginator.get_paginated_response(serializer.data)
        
    except Exception as e:
        return Response(
            {'error': 'Failed to fetch notifications'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, notification_id):
    """
    Delete a specific notification
    """
    try:
        notification = Notification.objects.get(
            id=notification_id, 
            user=request.user
        )
        notification.delete()
        
        return Response({'message': 'Notification deleted successfully'})
            
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': 'Failed to delete notification'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )