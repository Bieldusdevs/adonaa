'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { IconeWhatsApp } from '@/components/ui/BotaoWhatsApp';

const CIDADES = ['Belo Horizonte', 'Nova Lima', 'Contagem', 'Betim', 'Sabará', 'Santa Luzia'];
const VERDE = '#25D366';

/**
 * O caminho curto: nome, cidade, e a conversa abre.
 *
 * Muita gente não quer preencher endereço e CEP antes de falar com
 * alguém. Este bloco regista a intenção (para a equipa saber de onde veio o
 * contato e para medirmos a conversão) e entrega a conversa já escrita.
 * Os detalhes ficam para a consultora recolher no WhatsApp.
 */
export function MarcacaoRapidaWhatsApp() {
  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('');
  const [tipo, setTipo] = useState<'domicilio' | 'atelier' | 'video'>('domicilio');
  const [aCarregar, setACarregar] = useState(false);

  async function abrirConversa() {
    setACarregar(true);
    try {
      const res = await fetch('/api/agendamentos/pre-reserva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: nome || undefined, cidade: cidade || undefined, tipo, origem: 'bloco_rapido' }),
      });
      const { whatsapp } = await res.json();
      window.open(whatsapp, '_blank', 'noopener,noreferrer');
    } catch {
      // se a pré-reserva falhar, a conversa abre na mesma — nunca bloqueamos o contato
      const texto = encodeURIComponent(
        `Olá! Gostaria de marcar uma consulta.${nome ? `\n\nChamo-me *${nome}*.` : ''}${cidade ? `\nCidade: ${cidade}.` : ''}`,
      );
      window.open(`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP}?text=${texto}`, '_blank');
    } finally {
      setACarregar(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="border border-carvao/12 bg-linho/40 p-8 sm:p-10"
    >
      <div className="mb-7 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ backgroundColor: VERDE }}>
          <IconeWhatsApp className="h-5 w-5" />
        </span>
        <div>
          <p className="olho">Caminho mais curto</p>
          <h3 className="display text-2xl">Marcar por WhatsApp</h3>
        </div>
      </div>

      <p className="mb-8 text-sm leading-relaxed text-carvao/70">
        Me diga só o nome e a cidade. Levamos a conversa daí — sem
        formulários, sem esperar por e-mails.
      </p>

      <div className="space-y-5">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="O seu nome (opcional)"
          className="w-full border-0 border-b border-carvao/20 bg-transparent py-3 text-[15px] outline-none transition-colors placeholder:text-carvao/35 focus:border-[#25D366]"
        />

        <div>
          <p className="mb-3 text-xs tracking-wider text-carvao/50 uppercase">Cidade</p>
          <div className="flex flex-wrap gap-2">
            {CIDADES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCidade(cidade === c ? '' : c)}
                className={`border px-4 py-2 text-xs transition-all ${
                  cidade === c ? 'border-[#25D366] bg-[#25D366]/10 text-[#128C7E]' : 'border-carvao/15 text-carvao/70 hover:border-carvao/40'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs tracking-wider text-carvao/50 uppercase">Formato</p>
          <div className="flex flex-wrap gap-2">
            {([['domicilio', 'Em casa'], ['atelier', 'No ateliê'], ['video', 'Por vídeo']] as const).map(([v, r]) => (
              <button
                key={v}
                type="button"
                onClick={() => setTipo(v)}
                className={`border px-4 py-2 text-xs transition-all ${
                  tipo === v ? 'border-[#25D366] bg-[#25D366]/10 text-[#128C7E]' : 'border-carvao/15 text-carvao/70 hover:border-carvao/40'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={abrirConversa}
        disabled={aCarregar}
        className="mt-9 inline-flex w-full items-center justify-center gap-3 px-8 py-4 text-sm tracking-[0.16em] text-white uppercase transition-transform hover:scale-[1.01] disabled:opacity-50 sm:w-auto"
        style={{ backgroundColor: VERDE }}
      >
        <IconeWhatsApp className="h-4 w-4" />
        {aCarregar ? 'A abrir…' : 'Abrir conversa'}
      </button>

      <p className="mt-4 text-xs text-carvao/45">
        Resposta habitual em poucos minutos, das 10h às 19h.
      </p>
    </motion.div>
  );
}
