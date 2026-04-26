const ACCESS = 'lumora_access_token';
const REFRESH = 'lumora_refresh_token';
const REMEMBER = 'lumora_remember_session';

export function setTokens(access: string, refresh: string, remember: boolean): void {
  clearTokens();
  localStorage.setItem(REMEMBER, remember ? '1' : '0');
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(ACCESS, access);
  storage.setItem(REFRESH, refresh);
}

export function getRememberPreference(): boolean {
  return localStorage.getItem(REMEMBER) !== '0';
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS) ?? sessionStorage.getItem(ACCESS);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH) ?? sessionStorage.getItem(REFRESH);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS);
  localStorage.removeItem(REFRESH);
  localStorage.removeItem(REMEMBER);
  sessionStorage.removeItem(ACCESS);
  sessionStorage.removeItem(REFRESH);
}
