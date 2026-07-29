import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://adonalingerie.pt'),
  title: {
    default: 'A Dona Lingerie · Lingerie de autor com prova em casa',
    template: '%s · A Dona Lingerie',
  },
  description:
    'Lingerie em seda italiana, renda francesa e algodão Pima. Consultoria e prova ao domicílio, com 90 minutos dedicados só a si.',
  keywords: ['lingerie de luxo', 'seda', 'renda', 'prova em casa', 'lingerie sob medida', 'Portugal'],
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    siteName: 'A Dona Lingerie',
    title: 'A Dona Lingerie · A peça certa não se compra. Encontra-se.',
    description: 'Materiais nobres e uma consultora que vai a sua casa.',
    images: [{ url: '/produtos/hero-silk.jpg', width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#faf6f1',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT" className={`${display.variable} ${sans.variable}`}>
      <body className="antialiased">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-carvao focus:px-6 focus:py-3 focus:text-marfim"
        >
          Saltar para o conteúdo
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ClothingStore',
              name: 'A Dona Lingerie',
              description: 'Lingerie de autor com serviço de prova e consultoria ao domicílio.',
              address: { '@type': 'PostalAddress', addressCountry: 'PT', addressLocality: 'Lisboa' },
              priceRange: '€€€',
              areaServed: ['Lisboa', 'Barreiro', 'Almada', 'Setúbal', 'Cascais', 'Porto'],
            }),
          }}
        />
      </body>
    </html>
  );
}
