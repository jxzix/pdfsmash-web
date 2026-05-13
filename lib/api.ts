const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

export const FREE_LIMIT = 3
const STORAGE_KEY = 'pdfsmash_uses'
const PREMIUM_KEY = 'pdfsmash_premium'

// ─── Uso / Premium ────────────────────────────────────────────────────────────

export function getUses(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)
}

export function incrementUses(): number {
  const uses = getUses() + 1
  localStorage.setItem(STORAGE_KEY, String(uses))
  return uses
}

export function isPremium(): boolean {
  if (typeof window === 'undefined') return false
  if (window.location.hostname === 'localhost') return true
  return localStorage.getItem(PREMIUM_KEY) === 'true'
}

export function setPremium(): void {
  localStorage.setItem(PREMIUM_KEY, 'true')
}

// ─── Compresión ───────────────────────────────────────────────────────────────

export interface CompressResult {
  blob: Blob
  originalSize: number
  compressedSize: number
  savings: number
}

export async function compressPDF(
  file: File,
  quality: 'light' | 'medium' | 'max'
): Promise<CompressResult> {
  const form = new FormData()
  form.append('file', file)
  form.append('quality', quality)

  const headers: Record<string, string> = {}
  if (isPremium()) {
    // El token premium viene del .env — en prod lo lees del backend
    // Por ahora lo guardamos en localStorage después del pago
    const token = localStorage.getItem('pdfsmash_token') || ''
    if (token) headers['X-Premium-Token'] = token
  }

  const res = await fetch(`${BACKEND}/compress`, {
    method: 'POST',
    headers,
    body: form,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    if (err.error === 'limit_reached') {
      throw new Error('LIMIT_REACHED')
    }
    throw new Error(err.message || 'Compression failed')
  }

  const originalSize  = parseInt(res.headers.get('X-Original-Size')   || '0', 10)
  const compressedSize = parseInt(res.headers.get('X-Compressed-Size') || '0', 10)
  const savings        = parseInt(res.headers.get('X-Savings-Percent') || '0', 10)
  const blob           = await res.blob()

  return { blob, originalSize, compressedSize, savings }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
