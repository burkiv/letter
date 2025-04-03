import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { AuthProvider } from './context/AuthContext' // 💡 Giriş sistemi için

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mektup Uygulaması',
  description: 'Kişiselleştirilebilir dijital mektup yazma uygulaması',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  authors: [{ name: 'Mektup Uygulaması' }],
  creator: 'Mektup Uygulaması',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"
          strategy="beforeInteractive"
        />
        {/* Yazı Fontları */}
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script&family=Pacifico&family=Playfair+Display&family=Poppins&family=Roboto+Slab&display=swap" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        {/* 🧠 Giriş sistemi burada devreye giriyor */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
