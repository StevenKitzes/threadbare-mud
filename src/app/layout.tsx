'use client';

import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* This div does not render in the browser AT ALL */}
        <div>This is real content</div>
        {children}
      </body>
    </html>
  )
}
