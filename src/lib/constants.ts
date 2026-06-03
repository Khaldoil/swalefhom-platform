// ثوابت المنصة — جميع القيم الثابتة في مكان واحد

export const CONTACT = {
  WHATSAPP: import.meta.env.VITE_WHATSAPP_NUMBER || '+966557106285',
  EMAIL: import.meta.env.VITE_CONTACT_EMAIL || 'info@swalefhom.com',
} as const;

export const SITE = {
  NAME: 'سواليفهم',
  URL: import.meta.env.VITE_SITE_URL || 'https://swalefhom.com',
  TAGLINE: 'إرث، وحفظها عهد',
} as const;

export const LIMITS = {
  MAX_FILE_UPLOAD: 5,
  MAX_FILE_SIZE_MB: 10,
  MIN_PASSWORD_LENGTH: 8,
  SESSION_TIMEOUT_MINUTES: 30,
} as const;

export const AMBASSADOR_ROLES = {
  AMBASSADOR: 'ambassador',
  ADMIN: 'admin',
} as const;
