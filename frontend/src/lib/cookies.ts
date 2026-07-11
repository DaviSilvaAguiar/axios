export const TOKEN_COOKIE = 'axios_token';
export const TENANT_COOKIE = 'axios_tenant';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAgeDias?: number): void {
  const maxAge = maxAgeDias != null ? `; Max-Age=${maxAgeDias * 86400}` : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax${maxAge}`;
}

function removeCookie(name: string): void {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export const cookieClient = {
  getToken:    ():                      string | null => getCookie(TOKEN_COOKIE),
  setToken:    (value: string, maxAgeDias?: number): void => setCookie(TOKEN_COOKIE, value, maxAgeDias),
  removeToken: ():                      void         => removeCookie(TOKEN_COOKIE),

  getTenant:    (): string | null => getCookie(TENANT_COOKIE),
  setTenant:    (value: string):  void => setCookie(TENANT_COOKIE, value),
  removeTenant: ():               void => removeCookie(TENANT_COOKIE),

  clear: (): void => {
    removeCookie(TOKEN_COOKIE);
    removeCookie(TENANT_COOKIE);
  },
};
