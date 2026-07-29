/**
 * Utilitários de WhatsApp — partilha e marcação.
 *
 * Usamos exclusivamente `wa.me`, o deep link oficial: abre a app no telemóvel
 * e o WhatsApp Web no desktop, sem SDK, sem cookies de terceiros e sem
 * qualquer peso no bundle. A mensagem vai pré-escrita; a cliente carrega em
 * enviar. Nunca enviamos nada em nome dela.
 */

/** Número da casa, só dígitos, com indicativo. Ex.: 351912345678 */
export const NUMERO_WHATSAPP =
  process.env.NEXT_PUBLIC_WHATSAPP ?? '351912345678';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://adonalingerie.pt';

/** Normaliza qualquer formato de número para o que o wa.me aceita. */
export function normalizarNumero(n: string) {
  const limpo = n.replace(/\D/g, '');
  // um número português escrito sem indicativo (9 dígitos a começar por 9)
  if (limpo.length === 9 && limpo.startsWith('9')) return `351${limpo}`;
  return limpo;
}

function link(numero: string, texto: string) {
  return `https://wa.me/${normalizarNumero(numero)}?text=${encodeURIComponent(texto)}`;
}

/* ------------------------------------------------------------------ *
 *  Partilha
 * ------------------------------------------------------------------ */

type Partilha = {
  titulo: string;
  descricao?: string;
  url: string;
  preco?: string;
};

/**
 * Mensagem de partilha de uma peça.
 *
 * Escrita na primeira pessoa de quem partilha — é ela que vai enviar isto a
 * uma amiga. Um texto em tom de marca ("descubra a nossa coleção") soaria a
 * anúncio reenviado e ninguém partilha anúncios.
 */
export function linkPartilhaProduto({ titulo, descricao, url, preco }: Partilha) {
  const linhas = [
    `Encontrei esta peça e lembrei-me de ti: *${titulo}*`,
    descricao ? `\n${descricao}` : '',
    preco ? `\n${preco}` : '',
    `\n${url}`,
    `\n_A Dona Lingerie — seda, renda e prova em casa._`,
  ];
  return link(NUMERO_WHATSAPP, linhas.filter(Boolean).join(''));
}

/** Partilha genérica de uma página (usada no rodapé e no serviço). */
export function linkPartilhaPagina(titulo: string, url = SITE) {
  return link(
    NUMERO_WHATSAPP,
    `${titulo}\n\n${url}\n\n_A Dona Lingerie_`,
  );
}

/**
 * Link "enviar para uma amiga" sem destinatário fixo — o WhatsApp abre o
 * seletor de contactos. É o que faz sentido para partilha real.
 */
export function linkPartilhaLivre(texto: string) {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}

/* ------------------------------------------------------------------ *
 *  Marcação por WhatsApp
 * ------------------------------------------------------------------ */

export type PedidoWhatsApp = {
  nome?: string;
  tipo?: 'domicilio' | 'atelier' | 'video';
  data?: string;   // YYYY-MM-DD
  hora?: string;   // HH:mm
  cidade?: string;
  produto?: string;
  referencia?: string; // código curto da pré-reserva
};

const ROTULO_TIPO = {
  domicilio: 'prova em minha casa',
  atelier: 'visita ao ateliê',
  video: 'consulta por vídeo',
} as const;

function dataPorExtenso(iso?: string) {
  if (!iso) return null;
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' });
}

/**
 * Mensagem de marcação. Estruturada para a consultora conseguir responder
 * numa só mensagem, sem ter de fazer cinco perguntas de seguimento.
 */
export function linkMarcacao(p: PedidoWhatsApp = {}) {
  const partes: string[] = ['Olá! Gostaria de marcar uma consulta.'];

  if (p.nome) partes.push(`\n\nChamo-me *${p.nome}*.`);
  else partes.push('\n');

  if (p.tipo) partes.push(`\nPrefiro: ${ROTULO_TIPO[p.tipo]}.`);

  const dia = dataPorExtenso(p.data);
  if (dia && p.hora) partes.push(`\nDia pretendido: ${dia}, às ${p.hora}.`);
  else if (dia) partes.push(`\nDia pretendido: ${dia}.`);

  if (p.cidade) partes.push(`\nCidade: ${p.cidade}.`);
  if (p.produto) partes.push(`\nInteressa-me sobretudo: ${p.produto}.`);
  if (p.referencia) partes.push(`\n\nReferência da pré-reserva: *${p.referencia}*`);

  partes.push('\n\nObrigada!');
  return link(NUMERO_WHATSAPP, partes.join(''));
}

/** Dúvida rápida sobre uma peça específica, a partir da página de produto. */
export function linkDuvidaProduto(nomeProduto: string, url: string) {
  return link(
    NUMERO_WHATSAPP,
    `Olá! Tenho uma dúvida sobre a peça *${nomeProduto}*.\n${url}\n\n`,
  );
}

/** Dúvida de tamanho — o motivo de contacto mais comum. */
export function linkDuvidaTamanho(nomeProduto?: string) {
  const alvo = nomeProduto ? ` para a peça *${nomeProduto}*` : '';
  return link(
    NUMERO_WHATSAPP,
    `Olá! Não tenho a certeza do meu tamanho${alvo}. Podem ajudar-me?`,
  );
}

/**
 * Código curto e legível ao telefone (sem 0/O nem 1/I, que se confundem
 * quando alguém dita a referência em voz alta).
 */
export function gerarReferencia() {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) {
    s += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  }
  return `AD-${s}`;
}
