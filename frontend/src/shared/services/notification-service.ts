/**
 * Notification Service - User Feedback
 * 
 * Staff Engineer Design: Clean service for notifications
 * Business Logic: Handles user feedback and alerts
 */

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

export class NotificationService {
  showSuccess(message: string, duration: number = 5000): void {
    this.showNotification({ type: 'success', message, duration });
  }

  showError(message: string, duration: number = 7000): void {
    this.showNotification({ type: 'error', message, duration });
  }

  showInfo(message: string, duration: number = 5000): void {
    this.showNotification({ type: 'info', message, duration });
  }

  showWarning(message: string, duration: number = 5000): void {
    this.showNotification({ type: 'warning', message, duration });
  }

  private showNotification(notification: Omit<Notification, 'id'>): void {
    // For now, just log to console
    // In a real app, this would integrate with a toast library
    console.log(`[${notification.type.toUpperCase()}] ${notification.message}`);
    
    // TODO: Integrate with toast library (e.g., react-hot-toast, react-toastify)
    // This is a placeholder implementation
  }

  clearAll(): void {
    // TODO: Clear all notifications
    console.log('Clearing all notifications');
  }
}
