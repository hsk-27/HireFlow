import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../../services/apiServices';
import { Notification } from '../../types';
import Button from '../../components/common/Button';
import { Bell, CheckCheck, Clock, CheckCircle2, AlertCircle, Info, Award, Calendar } from 'lucide-react';

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data: notifsData, isLoading, error } = useQuery({
    queryKey: ['notifications', unreadOnly],
    queryFn: async () => {
      const res = await notificationApi.getNotifications(unreadOnly);
      return res.data.data;
    },
  });

  const notifications: Notification[] = Array.isArray(notifsData)
    ? notifsData
    : (notifsData as any)?.content || [];

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'OFFER_ISSUED':
      case 'OFFER_ACCEPTED':
        return <Award className="h-5 w-5 text-emerald-600" />;
      case 'INTERVIEW_SCHEDULED':
      case 'INTERVIEW_CANCELLED':
        return <Calendar className="h-5 w-5 text-purple-600" />;
      case 'APPLICATION_STATUS_UPDATED':
        return <CheckCircle2 className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-primary-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            Notifications & System Alerts
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Real-time updates regarding application progression, interview calls, and hiring decisions.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              unreadOnly
                ? 'bg-primary-100 text-primary-700'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {unreadOnly ? 'Showing Unread' : 'Show Unread Only'}
          </button>
          <Button
            variant="outline"
            onClick={() => markAllReadMutation.mutate()}
            loading={markAllReadMutation.isPending}
          >
            <CheckCheck className="mr-1.5 h-4 w-4" /> Mark All as Read
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          Failed to load notifications.
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center bg-white">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">All caught up!</h3>
          <p className="mt-1 text-sm text-gray-500">You have no new alerts or notifications.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border p-4 transition flex items-start justify-between ${
                n.read
                  ? 'border-gray-200 bg-white'
                  : 'border-primary-200 bg-primary-50/30 shadow-sm'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="rounded-lg bg-gray-100 p-2 shrink-0">
                  {getNotificationIcon(n.type || n.notificationType || '')}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-gray-900">{n.title}</h4>
                    {!n.read && (
                      <span className="inline-block h-2 w-2 rounded-full bg-primary-600" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-600">{n.message}</p>
                  <div className="mt-2 flex items-center space-x-1 text-[11px] text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => markReadMutation.mutate(n.id)}
                  className="rounded px-2 py-1 text-xs font-semibold text-primary-600 hover:bg-primary-100 shrink-0"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
