import './globals.css'
import { Inter, Inria_Serif } from 'next/font/google'
import { AuthProvider } from '../components/AuthProvider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const inria = Inria_Serif({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-inria',
  display: 'swap',
})

export const metadata = {
  title: 'Sticky Notes Prototype',
  description: 'Post-it style notes app with Django REST backend',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${inria.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
