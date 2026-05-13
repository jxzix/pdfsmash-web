'use client'

import { useState, useRef, useCallback } from 'react'
import {
  compressPDF, formatBytes, downloadBlob,
  getUses, incrementUses, isPremium, FREE_LIMIT,
} from '../lib/api'

type Quality   = 'light' | 'medium' | 'max'
type AppState  = 'idle' | 'compressing' | 'done' | 'optimized' | 'paywall'

interface Result {
  blob: Blob
  originalSize: number
  compressedSize: number
  savings: number
  filename: string
}

const STRIPE_LINK = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || '#'

export default function Compressor() {
  const [file, setFile]         = useState<File | null>(null)
  const [quality, setQuality]   = useState<Quality>('medium')
  const [state, setState]       = useState<AppState>('idle')
  const [result, setResult]     = useState<Result | null>(null)
  const [error, setError]       = useState('')
  const [dragging, setDragging] = useState(false)
  const inputRef                = useRef<HTMLInputElement>(null)
  const uses                    = getUses()
  const premium                 = isPremium()
  const remaining               = Math.max(0, FREE_LIMIT - uses)

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.pdf')) return setError('Solo se aceptan archivos PDF.')
    if (f.size > 50 * 1024 * 1024) return setError('Máximo 50 MB por archivo.')
    setFile(f)
    setError('')
    setState('idle')
    setResult(null)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const handleCompress = async () => {
    if (!file) return
    if (!premium && uses >= FREE_LIMIT) {
      setState('paywall')
      return
    }
    setState('compressing')
    setError('')
    try {
      const res = await compressPDF(file, quality)
      incrementUses()
      setResult({ ...res, filename: `compressed-${file.name}` })
      setState(res.savings === 0 ? 'optimized' : 'done')
    } catch (err: any) {
      if (err.message === 'LIMIT_REACHED') {
        setState('paywall')
      } else {
        setError(err.message || 'Algo salió mal. Intenta de nuevo.')
        setState('idle')
      }
    }
  }

  const reset = () => {
    setFile(null)
    setResult(null)
    setState('idle')
    setError('')
  }

  const goToStripe = () => {
    const successUrl = encodeURIComponent(`${window.location.origin}/success`)
    window.location.href = `${STRIPE_LINK}?success_url=${successUrl}`
  }

  return (
    <div className="w-full max-w-xl mx-auto">

      {/* Upload zone */}
      {state === 'idle' && (
        <>
          <div
            onClick={() => inputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            className={`
              relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer mb-6 transition-all duration-300
              ${dragging
                ? 'border-brand bg-brand/5 shadow-[0_0_30px_rgba(226,75,74,0.3)]'
                : 'border-white/10 hover:border-brand/50 hover:shadow-[0_0_20px_rgba(226,75,74,0.15)]'}
            `}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <div className="text-4xl mb-3">📄</div>
            {file ? (
              <>
                <p className="text-white font-semibold truncate max-w-xs mx-auto">{file.name}</p>
                <p className="text-white/40 text-sm mt-1">{formatBytes(file.size)} · Click to change</p>
              </>
            ) : (
              <>
                <p className="text-white font-semibold text-lg">Drop your PDF here</p>
                <p className="text-white/40 text-sm mt-1">or click to select · Max 50 MB</p>
              </>
            )}
          </div>

          <div className="mb-6">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Compression level</p>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'medium', 'max'] as Quality[]).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`
                    py-3 rounded-xl border text-sm font-semibold transition-all duration-200
                    ${quality === q
                      ? 'border-brand text-brand bg-brand/10 shadow-[0_0_15px_rgba(226,75,74,0.25)]'
                      : 'border-white/10 text-white/40 hover:border-white/20'}
                  `}
                >
                  {q === 'light' ? 'Light' : q === 'medium' ? 'Medium' : 'Max'}
                  <div className={`text-xs mt-0.5 ${quality === q ? 'text-brand/70' : 'text-white/20'}`}>
                    {q === 'light' ? '~30%' : q === 'medium' ? '~60%' : '~80%'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

          <button
            onClick={handleCompress}
            disabled={!file}
            className="w-full py-4 rounded-xl bg-brand hover:bg-brand-dark disabled:bg-white/5 disabled:text-white/20 text-white font-bold text-lg transition-all active:scale-[0.99] hover:shadow-[0_0_25px_rgba(226,75,74,0.4)]"
          >
            ⚡ Compress PDF
          </button>

          {!premium && (
            <p className="text-center text-white/30 text-sm mt-4">
              {remaining > 0
                ? <><span className="text-brand">{remaining}</span> of {FREE_LIMIT} free compressions left</>
                : <>Free limit reached · <button onClick={() => setState('paywall')} className="text-brand underline">Unlock unlimited →</button></>
              }
            </p>
          )}
        </>
      )}

      {/* Compressing */}
      {state === 'compressing' && (
        <div className="text-center py-12">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-brand/20" />
            <div className="absolute inset-0 rounded-full border-2 border-brand border-t-transparent animate-spin" />
            <div className="absolute inset-0 rounded-full shadow-[0_0_30px_rgba(226,75,74,0.4)] animate-pulse" />
          </div>
          <p className="text-white font-semibold text-lg">Compressing your PDF…</p>
          <p className="text-white/40 text-sm mt-2">Ghostscript is working its magic</p>
        </div>
      )}

      {/* Already optimized */}
      {state === 'optimized' && result && (
        <div className="text-center py-8">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-green-500/10 shadow-[0_0_40px_rgba(99,153,34,0.4)] animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center text-4xl">✅</div>
          </div>
          <h3 className="text-white font-bold text-2xl mb-2">Already perfect!</h3>
          <p className="text-white/40 mb-2">
            This PDF is already fully optimized.<br />
            No compression possible without losing quality.
          </p>
          <p className="text-white/20 text-sm mb-8">{formatBytes(result.originalSize)} · optimized</p>

          <div className="bg-green-950/40 border border-green-800/30 rounded-xl p-4 mb-6 shadow-[0_0_20px_rgba(99,153,34,0.15)]">
            <p className="text-green-400 text-sm">
              💡 Try <span className="font-semibold">Max</span> compression level for deeper processing, or use a PDF with images for better results.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:border-white/20 hover:text-white/70 font-semibold transition-all"
            >
              Try another PDF
            </button>
            <button
              onClick={() => result && downloadBlob(result.blob, result.filename)}
              className="flex-[2] py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 font-semibold transition-all"
            >
              ⬇ Download anyway
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {state === 'done' && result && (
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Before</p>
              <p className="text-white font-bold text-2xl">{formatBytes(result.originalSize)}</p>
            </div>
            <div className="bg-brand/10 rounded-xl p-4 text-center border border-brand/30 shadow-[0_0_20px_rgba(226,75,74,0.2)]">
              <p className="text-brand/70 text-xs uppercase tracking-widest mb-1">After</p>
              <p className="text-brand font-bold text-2xl">{formatBytes(result.compressedSize)}</p>
            </div>
          </div>

          <div className="bg-green-950/50 border border-green-800/30 rounded-xl p-4 flex items-center justify-between mb-6 shadow-[0_0_25px_rgba(99,153,34,0.2)]">
            <div>
              <p className="text-green-400 font-semibold">Space saved</p>
              <p className="text-green-600 text-sm">{formatBytes(result.originalSize - result.compressedSize)} freed</p>
            </div>
            <p className="text-green-400 font-black text-3xl drop-shadow-[0_0_10px_rgba(99,153,34,0.8)]">{result.savings}%</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:border-white/20 hover:text-white/70 font-semibold transition-all"
            >
              New PDF
            </button>
            <button
              onClick={() => downloadBlob(result.blob, result.filename)}
              className="flex-[2] py-3 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold transition-all active:scale-[0.99] shadow-[0_0_20px_rgba(226,75,74,0.3)] hover:shadow-[0_0_30px_rgba(226,75,74,0.5)]"
            >
              ⬇ Download
            </button>
          </div>

          {!premium && remaining <= 0 && (
            <p className="text-center text-white/30 text-sm mt-4">
              Last free compression used · <button onClick={() => setState('paywall')} className="text-brand underline">Unlock unlimited →</button>
            </p>
          )}
        </div>
      )}

      {/* Paywall */}
      {state === 'paywall' && (
        <div className="bg-white/3 border border-white/10 rounded-2xl p-8 text-center shadow-[0_0_40px_rgba(226,75,74,0.1)]">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-2xl bg-brand/20 shadow-[0_0_30px_rgba(226,75,74,0.5)] animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center text-3xl">⚡</div>
          </div>
          <h2 className="text-white font-bold text-2xl mb-2">Unlock PDFSmash</h2>
          <p className="text-white/40 mb-8">
            You've used your {FREE_LIMIT} free compressions.<br />
            One small payment, unlimited forever.
          </p>

          <div className="text-left space-y-3 mb-8">
            {[
              'Unlimited compressions',
              'All quality levels',
              'Files up to 50 MB',
              'No watermarks, ever',
            ].map((perk) => (
              <div key={perk} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand shadow-[0_0_6px_rgba(226,75,74,0.8)] flex-shrink-0" />
                <p className="text-white/70">{perk}</p>
              </div>
            ))}
          </div>

          <div className="flex items-baseline justify-center gap-2 mb-6">
            <span className="text-white font-black text-4xl drop-shadow-[0_0_15px_rgba(226,75,74,0.6)]">$1.99</span>
            <span className="text-white/40">one-time</span>
          </div>

          <button
            onClick={goToStripe}
            className="w-full py-4 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold text-lg transition-all active:scale-[0.99] mb-3 shadow-[0_0_25px_rgba(226,75,74,0.4)] hover:shadow-[0_0_40px_rgba(226,75,74,0.6)]"
          >
            Unlock Now — $1.99
          </button>

          <button onClick={() => setState('idle')} className="text-white/30 text-sm hover:text-white/50 transition-colors">
            Maybe later
          </button>

          <p className="text-white/20 text-xs mt-4">Pay once. No subscriptions. No nonsense.</p>
        </div>
      )}
    </div>
  )
}