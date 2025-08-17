export interface LocalSavedAd {
  id: string;
  title: string;
  hook: string;
  script: string;
  visuals: string[];
  niche: string;
  targetAudience: string;
  performance: {
    estimatedViews: number;
    estimatedCTR: number;
    viralScore: number;
  };
  createdAt: string;
  isFavorite: boolean;
}

const STORAGE_KEY = 'local_saved_ads';
const MAX_LOCAL_SAVES = 3;

export class LocalSaveService {
  static getSavedAds(): LocalSavedAd[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading local saves:', error);
      return [];
    }
  }

  static saveAd(ad: Omit<LocalSavedAd, 'id' | 'createdAt'>): { success: boolean; limitReached?: boolean } {
    if (typeof window === 'undefined') return { success: false };

    try {
      const saved = this.getSavedAds();
      
      // Check if limit reached for free tier (3 saves)
      if (saved.length >= MAX_LOCAL_SAVES) {
        return { success: false, limitReached: true };
      }

      const newAd: LocalSavedAd = {
        ...ad,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      const updated = [newAd, ...saved];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      return { success: true };
    } catch (error) {
      console.error('Error saving ad locally:', error);
      return { success: false };
    }
  }

  static removeAd(id: string): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const saved = this.getSavedAds();
      const filtered = saved.filter(ad => ad.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error removing saved ad:', error);
      return false;
    }
  }

  static toggleFavorite(id: string): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const saved = this.getSavedAds();
      const updated = saved.map(ad => 
        ad.id === id ? { ...ad, isFavorite: !ad.isFavorite } : ad
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  }

  static clearAll(): boolean {
    if (typeof window === 'undefined') return false;

    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing local saves:', error);
      return false;
    }
  }

  static getStorageStats(): { used: number; limit: number; available: number } {
    const saved = this.getSavedAds();
    return {
      used: saved.length,
      limit: MAX_LOCAL_SAVES,
      available: MAX_LOCAL_SAVES - saved.length
    };
  }

  static migrateToAccount(accessToken: string): Promise<boolean> {
    // This would be called when user signs up to migrate local saves to their account
    // For now, just return success
    return Promise.resolve(true);
  }
}