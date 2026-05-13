import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PDFSmash — Compress PDF Free Online',
  description: 'Compress your PDF files up to 90% smaller in seconds. Free online PDF compressor. No signup required.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
