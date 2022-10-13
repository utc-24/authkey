from django.contrib.auth import get_user_model

from rest_framework import status, viewsets
from rest_framework.permissions import (
    IsAuthenticated,
)
from rest_framework.response import Response

from api.permissions import generator, CanManageBadge

from organization.models import Organization

from .models import Badge
from .serializers import BadgeSerializer

User = get_user_model()


class BadgeViewSet(viewsets.ModelViewSet):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer

    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        permission_classes = []
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes += [CanManageBadge]

        return generator(self.permission_classes + permission_classes)

    def _handle_users(self, users_data):
        users = []
        for user_data in users_data:
            if not User.objects.filter(ethereum_address=user_data['ethereum_address']).exists():
                user = User.objects.create_user(
                    ethereum_address=user_data['ethereum_address'])
            else:
                user = User.objects.get(
                    ethereum_address=user_data['ethereum_address'])
            users.append(user)
        return users

    def _handle_user_creation(self, users, queryset):
        if users:
            # Clear the active set of users, whatever they may be.
            queryset.clear()

            # Build the new data for the users
            users = self._handle_users(users)
            for user in users:
                queryset.add(user)

    # on create handle the badge creation and add it to .badges of the organization it is being added to
    def create(self, request, *args, **kwargs):
        # get the organization
        organization = Organization.objects.get(
            pk=request.data['organization'])

        # confirm the requesting user is the owner or delegate of the organization
        if not (request.user.is_staff or request.user == organization.owner or request.user in organization.delegates.all()):
            return Response(status=status.HTTP_403_FORBIDDEN)

        # remove the users from the request data
        users = request.data.pop('users', None)
        delegates = request.data.pop('delegates', None)

        # create the badge
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        self.perform_create(serializer)

        # add the badge to the organization
        organization.badges.add(serializer.instance)

        # save the organization
        organization.save()

        self._handle_user_creation(users, serializer.instance.users)
        self._handle_user_creation(delegates, serializer.instance.delegates)

        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        # remove the users from the request data
        users = request.data.pop('users', None)
        delegates = request.data.pop('delegates', None)

        # update the badge
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # do the normal update
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        self.perform_update(serializer)

        self._handle_user_creation(users, serializer.instance.users)
        self._handle_user_creation(delegates, serializer.instance.delegates)

        return Response(serializer.data)
