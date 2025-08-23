// Simple toast utility for production
export const toast = {
  success: (message: string) => {
    // For production, use a proper toast library like react-hot-toast
    // For now, using a styled alert as fallback
    const event = new CustomEvent('show-toast', {
      detail: { message, type: 'success' }
    });
    window.dispatchEvent(event);
  },
  
  error: (message: string) => {
    const event = new CustomEvent('show-toast', {
      detail: { message, type: 'error' }
    });
    window.dispatchEvent(event);
  },
  
  info: (message: string) => {
    const event = new CustomEvent('show-toast', {
      detail: { message, type: 'info' }
    });
    window.dispatchEvent(event);
  }
};

// Fallback for environments without proper toast implementation
if (typeof window !== 'undefined') {
  window.addEventListener('show-toast', (event: any) => {
    const { message, type } = event.detail;
    // Simple fallback - in production you'd use a proper toast library
    // Log for development only
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${type.toUpperCase()}]`, message);
    }
  });
}