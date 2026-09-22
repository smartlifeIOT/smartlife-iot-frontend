const STORAGE_PREFIX = '';

class LocalStorageService {
  private getKey(key: string): string {
    return `${STORAGE_PREFIX}${key}`;
  }

  set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(this.getKey(key), serialized);
    } catch (error) {
      console.error(`Error saving to localStorage:`, error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key));
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage:`, error);
      return null;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error(`Error removing from localStorage:`, error);
    }
  }

  clear(): void {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error(`Error clearing localStorage:`, error);
    }
  }

  // Auth-specific methods
  setToken(token: string): void {
    this.set('access_token', token);
  }

  getToken(): string | null {
    return this.get('access_token');
  }

  setRefreshToken(token: string): void {
    this.set('refresh_token', token);
  }

  getRefreshToken(): string | null {
    return this.get('refresh_token');
  }

  // Token expiration methods
  setExpiresIn(expiresIn: number | string): void {
    // expiresIn can be seconds (number) or ISO timestamp (string)
    let expirationTime: number;
    
    if (typeof expiresIn === 'string') {
      // If it's a timestamp string, parse it
      expirationTime = new Date(expiresIn).getTime();
    } else {
      // If it's a number (seconds), calculate expiration time
      expirationTime = Date.now() + (expiresIn * 1000);
    }
    
    this.set('token_expires_at', expirationTime);
  }

  getExpiresAt(): number | null {
    return this.get<number>('token_expires_at');
  }

  isTokenExpired(): boolean {
    const expiresAt = this.getExpiresAt();
    if (!expiresAt) {
      return false; // If no expiration set, assume not expired
    }
    // Add 5 minute buffer to refresh before actual expiration
    return Date.now() >= (expiresAt - 5 * 60 * 1000);
  }

  removeToken(): void {
    this.remove('access_token');
    this.remove('refresh_token');
    this.remove('token_expires_at');
  }

  // User-specific methods
  setUser(user: Record<string, unknown>): void {
    this.set('user', user);
  }

  getUser(): Record<string, unknown> | null {
    return this.get<Record<string, unknown>>('user');
  }

  removeUser(): void {
    this.remove('user');
  }

  // Theme methods
  setTheme(theme: 'light' | 'dark'): void {
    this.set('theme', theme);
  }

  getTheme(): 'light' | 'dark' | null {
    return this.get('theme');
  }
    
}

export const localStorageService = new LocalStorageService();
export default localStorageService;
