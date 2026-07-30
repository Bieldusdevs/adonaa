import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,

  transpilePackages: ['three'],

  /**
   * `reactCompiler` e `ppr` só existem nas builds canary do Next. Com a
   * versão estável o build falha logo no arranque, por isso ficam de fora.
   * Para os experimentar: instale `next@canary` e reponha as flags.
   */
  experimental: {
    optimizePackageImports: ['motion', '@react-three/drei', 'three'],
  },

  // Shaders importados como string (Turbopack e Webpack).
  turbopack: {
    rules: {
      '*.glsl': { loaders: ['raw-loader'], as: '*.js' },
      '*.wgsl': { loaders: ['raw-loader'], as: '*.js' },
    },
  },

  webpack(config) {
    config.module.rules.push({ test: /\.(glsl|vert|frag|wgsl)$/, type: 'asset/source' });
    return config;
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [400, 640, 828, 1080, 1200, 1920, 2560],
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.adonalingerie.com.br' }],
    minimumCacheTTL: 31536000,
  },

  /**
   * Rotas dinâmicas sem parênteses retos nos nomes das pastas.
   *
   * O Next faria isto com `app/colecao/[slug]/` e `app/api/[[...route]]/`,
   * mas o uploader web do GitHub recusa pastas com `[` e `]`. Aqui a
   * reescrita acontece em código: as pastas têm nomes simples e o endereço
   * público mantém-se exatamente o mesmo.
   */
  async rewrites() {
    return [
      { source: '/colecao/:slug', destination: '/peca?ref=:slug' },
      // ficha de pedido no painel — mesma razão: evitar pastas [id]
      { source: '/painel/pedidos/:id', destination: '/painel/pedidos/ficha?ref=:id' },
      // o cron tem a sua própria rota; tudo o resto vai para o Hono
      { source: '/api/health', destination: '/api/hono' },
      { source: '/api/produtos', destination: '/api/hono' },
      { source: '/api/produtos/:path*', destination: '/api/hono' },
      { source: '/api/agendamentos', destination: '/api/hono' },
      { source: '/api/agendamentos/:path*', destination: '/api/hono' },
      { source: '/api/consultas', destination: '/api/hono' },
      { source: '/api/consultas/:path*', destination: '/api/hono' },
    ];
  },

  async redirects() {
    return [
      { source: '/whatsapp', destination: '/agendar?canal=whatsapp', permanent: false },
      { source: '/marcar', destination: '/agendar', permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      {
        source: '/produtos/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default config;
