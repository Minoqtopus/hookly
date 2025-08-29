/**
 * Navigation Service - Route Management
 * 
 * Staff Engineer Design: Clean service for navigation operations
 * Business Logic: Handles route changes and navigation
 */

export class NavigationService {
  navigateTo(path: string): void {
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  }

  navigateToLogin(): void {
    this.navigateTo('/login');
  }

  navigateToDashboard(): void {
    this.navigateTo('/dashboard');
  }

  navigateToVerification(): void {
    this.navigateTo('/verification');
  }

  reload(): void {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  goBack(): void {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }
}
