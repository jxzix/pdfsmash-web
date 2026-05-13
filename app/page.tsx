import Compressor from '../components/Compressor'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#030712]">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-brand text-xl">⚡</span>
          <span className="text-white font-bold text-lg tracking-tight">PDFSmash</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#how" className="text-white/40 hover:text-white text-sm transition-colors hidden sm:block">How it works</a>
          <a
            href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || '#'}
            className="text-sm font-semibold text-white bg-brand hover:bg-brand-dark px-4 py-2 rounded-lg transition-colors"
          >
            Unlock $1.99
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-12 pb-20 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 rounded-full px-4 py-1.5 mb-6">
          <span className="text-brand text-xs font-semibold uppercase tracking-wider">Free · No signup</span>
        </div>

        <h1 className="text-white font-black text-4xl sm:text-6xl leading-tight mb-4 tracking-tight">
          Compress PDF.<br />
          <span className="text-brand">Up to 90% smaller.</span>
        </h1>

        <p className="text-white/40 text-lg sm:text-xl max-w-xl mx-auto mb-12">
          Drag, drop, done. Your PDF gets smaller in seconds — no ads, no watermarks, no signup required.
        </p>

        {/* Compressor widget */}
        <Compressor />
      </section>

      {/* Stats */}
      <section className="border-t border-white/5 py-16 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { num: '90%', label: 'Average reduction' },
            { num: '50MB', label: 'Max file size' },
            { num: '100%', label: 'Private & secure' },
          ].map(({ num, label }) => (
            <div key={label}>
              <p className="text-brand font-black text-3xl sm:text-4xl">{num}</p>
              <p className="text-white/30 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-6 max-w-4xl mx-auto">
        <h2 className="text-white font-bold text-3xl text-center mb-12">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Upload', desc: 'Drag & drop your PDF or click to select. Up to 50 MB.' },
            { step: '02', title: 'Compress', desc: 'We use Ghostscript to shrink images, fonts, and metadata.' },
            { step: '03', title: 'Download', desc: 'Get your smaller PDF instantly. No email, no account.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="bg-white/3 border border-white/5 rounded-2xl p-6">
              <p className="text-brand font-black text-4xl mb-3">{step}</p>
              <p className="text-white font-semibold text-lg mb-2">{title}</p>
              <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mobile app CTA */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-white font-bold text-3xl mb-4">Prefer the mobile app?</h2>
          <p className="text-white/40 mb-8">Compress PDFs directly from your phone. Available soon on iOS and Android.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-5 py-3">
              <span className="text-2xl"></span>
              <div className="text-left">
                <p className="text-white/30 text-xs">Coming soon</p>
                <p className="text-white font-semibold text-sm">App Store</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-5 py-3">
              <span className="text-2xl">🤖</span>
              <div className="text-left">
                <p className="text-white/30 text-xs">Coming soon</p>
                <p className="text-white font-semibold text-sm">Google Play</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <p className="text-white/20 text-sm">
          © {new Date().getFullYear()} PDFSmash · Made with ⚡
        </p>
      </footer>

    </main>
  )
}
