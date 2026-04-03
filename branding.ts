export const BRANDING = {
  appName: import.meta.env.VITE_BRAND_NAME || 'Tu Marca Aquí',
  appSubtitle: import.meta.env.VITE_APP_SUBTITLE || 'Demo white label para clínicas y consultorios',
  professionalName: import.meta.env.VITE_PROFESSIONAL_NAME || 'Profesional Responsable',
  professionalTitle: import.meta.env.VITE_PROFESSIONAL_TITLE || 'Especialidad configurable',
  taglineLine1: import.meta.env.VITE_TAGLINE_LINE_1 || 'Tu eslogan o servicio principal',
  taglineLine2: import.meta.env.VITE_TAGLINE_LINE_2 || 'Segunda línea comercial configurable',
  phone: import.meta.env.VITE_BRAND_PHONE || 'Tel: 0000-0000',
  address: import.meta.env.VITE_BRAND_ADDRESS || 'Dirección comercial configurable',
  demoUser: import.meta.env.VITE_LOGIN_USER || 'demo',
  demoPassword: import.meta.env.VITE_LOGIN_PASSWORD || 'demo1234',
  storageKey: 'whitelabel_demo_user',
} as const;

export const BRAND_INITIAL = (BRANDING.appName.trim().charAt(0) || 'M').toUpperCase();
