import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const FALLBACK_SUPABASE_URL = 'https://whvhxgfdumxzunzsjkll.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY =
  'sb_publishable_uY5fTNffiCtUgKnrTLu6rA_KOoaS18j';
const FALLBACK_STORAGE_BUCKET = 'aani-media';

/**
 * تنظيف المتغيرات من أي علامات اقتباس أو مسافات خفية في البداية والنهاية
 */
function sanitizeEnv(val: unknown): string {
  if (typeof val !== 'string') return '';
  return val.trim().replace(/^['"]|['"]$/g, '');
}

function readEnv(): Record<string, string | undefined> {
  try {
    const env = (import.meta as { env?: Record<string, string | undefined> }).env;
    if (env && typeof env === 'object') return env;
  } catch {
    /* ignore fallback */
  }
  return {};
}

const env = readEnv();

const rawUrl = sanitizeEnv(env.VITE_SUPABASE_URL) || FALLBACK_SUPABASE_URL;
const rawAnonKey =
  sanitizeEnv(env.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  sanitizeEnv(env.VITE_SUPABASE_ANON_KEY) ||
  FALLBACK_SUPABASE_ANON_KEY;

export const targetSupabaseUrl = rawUrl.replace(/\/+$/, '');
export const supabasePublicKey = rawAnonKey;

export const supabaseConfigured = Boolean(targetSupabaseUrl && supabasePublicKey);

if (!supabaseConfigured) {
  console.error(
    '[supabase] خطأ حرج: متغيرات الاتصال بـ Supabase مفقودة! تأكد من إعداد VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY.'
  );
}

export const storageBucket =
  sanitizeEnv(env.VITE_SUPABASE_STORAGE_BUCKET) || FALLBACK_STORAGE_BUCKET;

/**
 * حل مشكلة Load failed على متصفح Safari وأجهزة الآيفون داخل شاشة المعاينة (iframe):
 * يتم توجيه الطلبات عبر البروكسي المحلي Same-Origin (/supabase-proxy) مما يتجاوز قيود ITP
 * وحظر الطلبات العابرة للمواقع (Cross-Origin Restrictions) في متصفح سفاري داخل iframe.
 */
export const getActiveSupabaseUrl = (): string => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/supabase-proxy`;
  }
  return targetSupabaseUrl;
};

export const supabaseUrl = getActiveSupabaseUrl();

/**
 * محول تخزين آمن لمتصفحات Safari وبيئات الـ iframe في شاشة المعاينة
 * يمنع أخطاء SecurityError و Load failed إذا كان الوصول إلى localStorage محظوراً
 */
const safeStorageAdapter = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn('[supabase] تعذر القراءة من localStorage:', e);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('[supabase] تعذر الحفظ في localStorage:', e);
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('[supabase] تعذر الحذف من localStorage:', e);
    }
  },
};

/**
 * دالة جلب ذكية تعيد المحاولة تلقائياً عبر الرابط المباشر إذا لم يتوفر البروكسي
 */
const smartFetch: typeof fetch = async (input, init) => {
  try {
    return await fetch(input, init);
  } catch (err: any) {
    const urlStr = typeof input === 'string' ? input : (input as Request)?.url || '';
    if (urlStr.includes('/supabase-proxy')) {
      const directUrl = urlStr.replace(/^https?:\/\/[^/]+\/supabase-proxy/, targetSupabaseUrl);
      console.warn('[supabase] إعادة المحاولة عبر الرابط المباشر:', directUrl);
      return await fetch(directUrl, init);
    } else if (
      typeof window !== 'undefined' &&
      window.location?.origin &&
      urlStr.includes(targetSupabaseUrl)
    ) {
      const proxyUrl = urlStr.replace(targetSupabaseUrl, `${window.location.origin}/supabase-proxy`);
      console.warn('[supabase] إعادة المحاولة عبر البروكسي المحلي:', proxyUrl);
      return await fetch(proxyUrl, init);
    }
    throw err;
  }
};

export const supabase: SupabaseClient = createClient(supabaseUrl, supabasePublicKey, {
  auth: {
    storage: safeStorageAdapter,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: smartFetch,
  },
});
