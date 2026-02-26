import './globals.css'
import type { Metadata } from 'next'
import { Inter, Cinzel, Merriweather } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  weight: ['400', '500', '600', '700', '800', '900'],
})
const merriweather = Merriweather({
  subsets: ['latin'],
  variable: '--font-merriweather',
  weight: ['300', '400', '700', '900'],
})

export const metadata: Metadata = {
  title: 'AI RPG - Your Personal Dungeon Master',
  description: 'An immersive single-player RPG powered by AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cinzel.variable} ${merriweather.variable} ${inter.className}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
