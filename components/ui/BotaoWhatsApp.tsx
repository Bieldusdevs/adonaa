'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  linkPartilhaProduto,
  linkPartilhaLivre,
  linkMarcacao,
  linkDuvidaProduto,
} from '@/lib/whatsapp';

/* ------------------------------------------------------------------ *
 *  Ícone — inline para não carregar uma biblioteca inteira por um SVG
 * ------------------------------------------------------------------ */
type PropsIcone = React.SVGProps<SVGSVGElement>;

export function IconeWhatsApp({ className = 'h-4 w-4', ...props }: PropsIcone) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.898 9.83 9.83 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.82 11.82 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.82 11.82 0 0 0 20.464 3.488" />
    </svg>
  );
}

const VERDE = '#25D366';

/* ------------------------------------------------------------------ *
 *  Botão de agendamento por WhatsApp
 * ------------------------------------------------------------------ */
type PropsMarcacao = {
  nome?: string;
  tipo?: 'domicilio' | 'atelier' | 'video';
  data?: string;
  hora?: string;
  cidade?: string;
  produto?: string;
  referencia?: string;
  variante?: 'solido' | 'linha' | 'discreto';
  rotulo?: string;
  className?: string;
};

export function BotaoMarcarWhatsApp({
  variante = 'linha',
  rotulo = 'Marcar por WhatsApp',
  className = '',
  ...pedido
}: PropsMarcacao) {
  const estilos = {
    solido: `bg-[${VERDE}] text-white hover:brightness-95`,
    linha: 'border border-carvao/20 text-carvao hover:border-[#25D366] hover:text-[#128C7E]',
    discreto: 'text-carvao/70 hover:text-[#128C7E]',
  }[variante];

  return (
    <a
      href={linkMarcacao(pedido)}
      target="_blank"
      rel="noopener noreferrer"
      data-evento="marcar_whatsapp"
      className={`inline-flex items-center justify-center gap-3 px-8 py-4 text-sm tracking-[0.16em] uppercase transition-all ${estilos} ${className}`}
      style={variante === 'solido' ? { backgroundColor: VERDE, color: '#fff' } : undefined}
    >
      <IconeWhatsApp className="h-4 w-4 shrink-0" />
      {rotulo}
    </a>
  );
}

/* ------------------------------------------------------------------ *
 *  Partilha — usa a folha nativa do sistema quando existe
 * ------------------------------------------------------------------ */
type PropsPartilha = {
  titulo: string;
  descricao?: string;
  url: string;
  preco?: string;
  compacto?: boolean;
};

export function BotaoPartilhar({ titulo, descricao, url, preco, compacto = false }: PropsPartilha) {
  const [temNativo, setTemNativo] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    // no celular a folha nativa é sempre melhor do que um menu nosso
    setTemNativo(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  const texto = `Encontrei esta peça e lembrei-me de ti: ${titulo}${preco ? ` — ${preco}` : ''}`;

  async function partilharNativo() {
    try {
      await navigator.share({ title: titulo, text: texto, url });
    } catch {
      /* a cliente cancelou — não é erro */
    }
  }

  async function copiar() {
    await navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2200);
  }

  if (compacto) {
    return (
      <a
        href={linkPartilhaProduto({ titulo, descricao, url, preco })}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Partilhar ${titulo} no WhatsApp`}
        data-evento="partilhar_whatsapp"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-marfim/92 text-carvao/70 backdrop-blur-sm transition-all hover:bg-[#25D366] hover:text-white"
      >
        <IconeWhatsApp className="h-4 w-4" />
      </a>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => (temNativo ? partilharNativo() : setAberto((a) => !a))}
        className="sublinhado inline-flex items-center gap-2.5 py-2 text-xs tracking-[0.18em] uppercase text-carvao/70"
        aria-expanded={aberto}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-4 w-4" aria-hidden>
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
        </svg>
        Partilhar
      </button>

      <AnimatePresence>
        {aberto && !temNativo && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-0 z-20 mt-3 w-60 border border-carvao/10 bg-marfim shadow-[0_20px_50px_-20px_rgba(90,45,30,.3)]"
          >
            <a
              href={linkPartilhaLivre(`${texto}\n\n${url}\n\n_A Dona Lingerie_`)}
              target="_blank"
              rel="noopener noreferrer"
              data-evento="partilhar_whatsapp"
              className="flex items-center gap-3 border-b border-carvao/8 px-5 py-4 text-sm transition-colors hover:bg-linho/60"
            >
              <IconeWhatsApp className="h-4 w-4" style={{ color: VERDE }} />
              Enviar por WhatsApp
            </a>
            <button
              type="button"
              onClick={copiar}
              className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm transition-colors hover:bg-linho/60"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-4 w-4" aria-hidden>
                <rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" />
              </svg>
              {copiado ? 'Link copiada' : 'Copiar link'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 *  Botão flutuante — presente em todo o site
 * ------------------------------------------------------------------ */
export function WhatsAppFlutuante({ produto }: { produto?: string }) {
  const [visivel, setVisivel] = useState(false);
  const [dica, setDica] = useState(false);

  useEffect(() => {
    const aoRolar = () => setVisivel(window.scrollY > 600);
    aoRolar();
    window.addEventListener('scroll', aoRolar, { passive: true });

    // a dica aparece uma única vez por sessão, passados 6 s
    const jaViu = sessionStorage.getItem('wa-dica');
    const t = setTimeout(() => {
      if (!jaViu) { setDica(true); sessionStorage.setItem('wa-dica', '1'); }
    }, 6000);
    const t2 = setTimeout(() => setDica(false), 13000);

    return () => {
      window.removeEventListener('scroll', aoRolar);
      clearTimeout(t); clearTimeout(t2);
    };
  }, []);

  const href = produto
    ? linkDuvidaProduto(produto, typeof window !== 'undefined' ? window.location.href : '')
    : linkMarcacao();

  return (
    <AnimatePresence>
      {visivel && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-5 bottom-5 z-50 flex items-center gap-3 sm:right-8 sm:bottom-8"
        >
          <AnimatePresence>
            {dica && (
              <motion.p
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="hidden max-w-[15rem] bg-marfim px-5 py-3 text-xs leading-relaxed text-carvao/75 shadow-[0_18px_40px_-18px_rgba(90,45,30,.35)] sm:block"
              >
                Prefere marcar por WhatsApp? Respondemos em minutos.
              </motion.p>
            )}
          </AnimatePresence>

          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Falar connosco no WhatsApp"
            data-evento="whatsapp_flutuante"
            onMouseEnter={() => setDica(true)}
            className="group relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_12px_34px_-8px_rgba(37,211,102,.6)] transition-transform hover:scale-105"
            style={{ backgroundColor: VERDE }}
          >
            <span
              className="absolute inset-0 animate-ping rounded-full opacity-20"
              style={{ backgroundColor: VERDE, animationDuration: '2.6s' }}
            />
            <IconeWhatsApp className="relative h-6 w-6" />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
