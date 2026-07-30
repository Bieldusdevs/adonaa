'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { IconeWhatsApp } from '@/components/ui/BotaoWhatsApp';

type Horario = { hora: string; disponivel: boolean };
type Tipo = 'domicilio' | 'atelier' | 'video';
type Canal = 'email' | 'whatsapp';

const TIPOS: { valor: Tipo; titulo: string; nota: string }[] = [
  { valor: 'domicilio', titulo: 'Em sua casa', nota: 'A consultora leva as provas. 90 minutos.' },
  { valor: 'atelier', titulo: 'No nosso ateliê', nota: 'Lisboa, Príncipe Real. Café incluído.' },
  { valor: 'video', titulo: 'Por vídeo', nota: 'Para uma primeira conversa, onde estiver.' },
];

const VERDE = '#25D366';

/**
 * Marcação em três passos, com dois canais de confirmação.
 *
 * O WhatsApp não é um atalho que salta o registo: a marcação entra sempre na
 * base de dados. O que muda é o fim — quem escolhe WhatsApp recebe uma
 * referência curta e a conversa já aberta, em vez de esperar por um e-mail.
 */
export function FormularioAgendamento() {
  const params = useSearchParams();
  const [passo, setPasso] = useState(1);
  const [tipo, setTipo] = useState<Tipo>('domicilio');
  const [canal, setCanal] = useState<Canal>(params.get('canal') === 'whatsapp' ? 'whatsapp' : 'email');
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ mensagem: string; whatsapp: string; referencia: string } | null>(null);
  const [enviando, iniciarEnvio] = useTransition();

  const minData = new Date(Date.now() + 864e5).toISOString().slice(0, 10);

  useEffect(() => {
    if (!data) return;
    setCarregando(true);
    setHora('');
    fetch(`/api/agendamentos/disponibilidade?data=${data}`)
      .then((r) => r.json())
      .then((d) => setHorarios(d.horarios ?? []))
      .catch(() => setErro('Não conseguimos carregar os horários. Tente novamente.'))
      .finally(() => setCarregando(false));
  }, [data]);

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    const fd = new FormData(e.currentTarget);

    iniciarEnvio(async () => {
      const res = await fetch('/api/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo, data, hora, canal,
          nome: fd.get('nome'),
          email: fd.get('email'),
          telefone: fd.get('telefone'),
          endereco: fd.get('endereco') || undefined,
          cidade: fd.get('cidade') || undefined,
          codigoPostal: fd.get('codigoPostal') || undefined,
          observacoes: fd.get('observacoes') || undefined,
          consentimentoLgpd: fd.get('consentimento') === 'on',
        }),
      });

      const corpo = await res.json();
      if (!res.ok) { setErro(corpo.erro ?? 'Não foi possível concluir a marcação.'); return; }

      setResultado(corpo);
      setPasso(4);

      // quem pediu WhatsApp vai direto para a conversa
      if (canal === 'whatsapp' && corpo.whatsapp) {
        window.open(corpo.whatsapp, '_blank', 'noopener,noreferrer');
      }
    });
  }

  const campo =
    'w-full border-0 border-b border-carvao/20 bg-transparent px-0 py-3 text-[15px] outline-none transition-colors placeholder:text-carvao/35 focus:border-bordeaux';

  /* ------------------------------ conclusão ------------------------------ */
  if (passo === 4 && resultado) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-dourado/30 bg-linho/50 p-12 text-center"
      >
        <p className="olho mb-4">Marcação recebida</p>
        <h3 className="display mb-4 text-3xl">Até breve.</h3>
        <p className="mx-auto max-w-md leading-relaxed text-carvao/70">{resultado.mensagem}</p>

        <p className="mt-6 text-xs tracking-[0.2em] text-carvao/50 uppercase">
          Referência {resultado.referencia}
        </p>

        <a
          href={resultado.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-3 px-8 py-4 text-sm tracking-[0.16em] text-white uppercase transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: VERDE }}
        >
          <IconeWhatsApp className="h-4 w-4" />
          {canal === 'whatsapp' ? 'Reabrir a conversa' : 'Falar já por WhatsApp'}
        </a>
      </motion.div>
    );
  }

  return (
    <form onSubmit={enviar} className="mx-auto max-w-2xl">
      <ol className="mb-12 flex gap-8 text-xs tracking-[0.18em] uppercase">
        {['Formato', 'Data', 'Contacto'].map((r, i) => (
          <li key={r} className={`flex items-center gap-2 ${passo > i ? 'text-bordeaux' : 'text-carvao/35'}`}>
            <span className={`h-px w-8 ${passo > i ? 'bg-bordeaux' : 'bg-carvao/20'}`} />
            {r}
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        {/* ------------------------------ passo 1 ------------------------------ */}
        {passo === 1 && (
          <motion.fieldset
            key="p1"
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <legend className="display mb-8 text-3xl">Como prefere ser atendida?</legend>
            <div className="space-y-3">
              {TIPOS.map((t) => (
                <label
                  key={t.valor}
                  className={`flex cursor-pointer items-start gap-4 border p-6 transition-all ${
                    tipo === t.valor ? 'border-bordeaux bg-linho/40' : 'border-carvao/12 hover:border-carvao/30'
                  }`}
                >
                  <input type="radio" name="tipo" checked={tipo === t.valor}
                    onChange={() => setTipo(t.valor)} className="mt-1.5 accent-[#5a1f2b]" />
                  <span>
                    <span className="block text-lg">{t.titulo}</span>
                    <span className="mt-1 block text-sm text-carvao/60">{t.nota}</span>
                  </span>
                </label>
              ))}
            </div>
            <button type="button" onClick={() => setPasso(2)}
              className="btn-acao mt-10">
              Continuar
            </button>
          </motion.fieldset>
        )}

        {/* ------------------------------ passo 2 ------------------------------ */}
        {passo === 2 && (
          <motion.fieldset
            key="p2"
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <legend className="display mb-8 text-3xl">Quando lhe fica bem?</legend>

            <label className="block">
              <span className="text-xs tracking-wider text-carvao/55 uppercase">Data</span>
              <input type="date" min={minData} value={data} onChange={(e) => setData(e.target.value)} required className={campo} />
            </label>

            {carregando && <p className="mt-8 text-sm text-carvao/50">A consultar a agenda…</p>}

            {!!horarios.length && !carregando && (
              <div className="mt-8">
                <span className="text-xs tracking-wider text-carvao/55 uppercase">Horário</span>
                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
                  {horarios.map((h) => (
                    <button key={h.hora} type="button" disabled={!h.disponivel} onClick={() => setHora(h.hora)}
                      className={`border py-3 text-sm transition-all ${
                        hora === h.hora ? 'border-bordeaux bg-bordeaux text-marfim'
                          : h.disponivel ? 'border-carvao/15 hover:border-carvao/45'
                          : 'cursor-not-allowed border-carvao/8 text-carvao/25 line-through'
                      }`}>
                      {h.hora}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10 flex gap-6">
              <button type="button" onClick={() => setPasso(1)} className="sublinhado text-sm tracking-[0.18em] uppercase">Voltar</button>
              <button type="button" disabled={!hora} onClick={() => setPasso(3)}
                className="btn-acao disabled:opacity-30">
                Continuar
              </button>
            </div>
          </motion.fieldset>
        )}

        {/* ------------------------------ passo 3 ------------------------------ */}
        {passo === 3 && (
          <motion.fieldset
            key="p3"
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <legend className="display mb-8 text-3xl">Como a encontramos?</legend>

            <input name="nome" required placeholder="Nome completo" className={campo} />
            <div className="grid gap-6 sm:grid-cols-2">
              <input name="email" type="email" required placeholder="E-mail" className={campo} />
              <input name="telefone" required placeholder="Telemóvel" className={campo} />
            </div>

            {tipo === 'domicilio' && (
              <>
                <input name="endereco" required placeholder="Morada" className={campo} />
                <div className="grid gap-6 sm:grid-cols-2">
                  <input name="cidade" required placeholder="Cidade" className={campo} />
                  <input name="codigoPostal" placeholder="Código postal" className={campo} />
                </div>
              </>
            )}

            <textarea name="observacoes" rows={3} placeholder="Há algo que gostaríamos de saber antes? (opcional)"
              className={`${campo} resize-none`} />

            {/* ---------------------- escolha do canal ---------------------- */}
            <div className="pt-4">
              <p className="mb-4 text-xs tracking-wider text-carvao/55 uppercase">Como prefere a confirmação?</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => setCanal('email')}
                  className={`flex items-center gap-3 border p-4 text-left text-sm transition-all ${
                    canal === 'email' ? 'border-bordeaux bg-linho/40' : 'border-carvao/12 hover:border-carvao/30'
                  }`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" className="h-4 w-4 shrink-0">
                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 6 10-6" />
                  </svg>
                  <span>Por e-mail<span className="block text-xs text-carvao/50">Resposta em até 4 horas</span></span>
                </button>

                <button type="button" onClick={() => setCanal('whatsapp')}
                  className={`flex items-center gap-3 border p-4 text-left text-sm transition-all ${
                    canal === 'whatsapp' ? 'border-[#25D366] bg-[#25D366]/8' : 'border-carvao/12 hover:border-carvao/30'
                  }`}>
                  <IconeWhatsApp className="h-4 w-4 shrink-0" />
                  <span>Por WhatsApp<span className="block text-xs text-carvao/50">Normalmente em minutos</span></span>
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 pt-2 text-xs leading-relaxed text-carvao/60">
              <input type="checkbox" name="consentimento" required className="mt-0.5 accent-[#5a1f2b]" />
              Autorizo o contacto {canal === 'whatsapp' ? 'por WhatsApp ' : ''}e o tratamento dos meus dados para esta
              marcação, nos termos da política de privacidade. As medidas ficam guardadas apenas com o meu consentimento.
            </label>

            {erro && <p className="border-l-2 border-bordeaux pl-4 text-sm text-bordeaux">{erro}</p>}

            <div className="flex flex-wrap gap-6 pt-4">
              <button type="button" onClick={() => setPasso(2)} className="sublinhado text-sm tracking-[0.18em] uppercase">Voltar</button>
              <button type="submit" disabled={enviando}
                className="inline-flex items-center gap-3 px-10 py-4 text-sm tracking-[0.18em] uppercase transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{
                  backgroundColor: canal === 'whatsapp' ? VERDE : '#5a1f2b',
                  color: canal === 'whatsapp' ? '#fff' : '#faf6f1',
                }}>
                {canal === 'whatsapp' && <IconeWhatsApp className="h-4 w-4" />}
                {enviando ? 'A confirmar…' : canal === 'whatsapp' ? 'Confirmar e abrir conversa' : 'Confirmar marcação'}
              </button>
            </div>
          </motion.fieldset>
        )}
      </AnimatePresence>
    </form>
  );
}
