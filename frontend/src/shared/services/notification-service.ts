/**
 * Notification Service - User Feedback
 * 
 * Staff Engineer Design: Clean service for notifications with react-hot-toast
 * Business Logic: Handles user feedback and alerts with real toast notifications
 */

import toast from 'react-hot-toast';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

export class NotificationService {
  showSuccess(message: string, duration: number = 5000): void {
    toast.success(message, {
      duration,
      position: 'top-right',
    });
  }

  showError(message: string, duration: number = 7000): void {
    toast.error(message, {
      duration,
      position: 'top-right',
    });
  }

  showInfo(message: string, duration: number = 5000): void {
    toast(message, {
      duration,
      position: 'top-right',
      icon: '💡',
    });
  }

  showWarning(message: string, duration: number = 5000): void {
    toast(message, {
      duration,
      position: 'top-right',
      icon: '⚠️',
    });
  }

  clearAll(): void {
    toast.dismiss();
  }
}
