import { Inter } from 'next/font/google'
import { GlobalProvider } from './GlobalContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Admit',
  icons: {
    icon: [
      '/favicon.ico?v=4',
    ],
    apple: [
      '/apple-touch-icon.png?v=4'
    ],
    shortcut: [
      '/apple-touch-icon.png'
    ]
  },
  manifest: '/site.webmanifest'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GlobalProvider>
        <div>
          {children}
        </div>
        </GlobalProvider>
      </body>
    </html>
  )
}
