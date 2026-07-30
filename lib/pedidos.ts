import type { EstadoPedido } from '@/lib/db';
import { NUMERO_WHATSAPP, normalizarNumero } from '@/lib/whatsapp';

/* ------------------------------------------------------------------ *
 *  Estados
 * ------------------------------------------------------------------ */

export const ESTADOS: Record<
  EstadoPedido,
  { rotulo: string; cor: string; descricao: string }
> = {
  novo: {
    rotulo: 'Novo',
    cor: 'border-dourado/50 text-dourado bg-dourado/5',
    descricao: 'Recebido, ainda por confirmar',
  },
  confirmado: {
    rotulo: 'Confirmado',
    cor: 'border-terracota/50 text-terracota bg-terracota/5',
    descricao: 'Pagamento acertado, a preparar',
  },
  preparado: {
    rotulo: 'Preparado',
    cor: 'border-terracota/50 text-terracota bg-terracota/8',
    descricao: 'Embalado, pronto para enviar',
  },
  enviado: {
    rotulo: 'Enviado',
    cor: 'border-bordeaux/40 text-bordeaux bg-bordeaux/5',
    descricao: 'A caminho da cliente',
  },
  entregue: {
    rotulo: 'Entregue',
    cor: 'border-carvao/25 text-carvao/60 bg-carvao/5',
    descricao: 'Concluído',
  },
  devolvido: {
    rotulo: 'Devolvido',
    cor: 'border-bordeaux/50 text-bordeaux bg-bordeaux/8',
    descricao: 'Devolvido pela cliente',
  },
  cancelado: {
    rotulo: 'Cancelado',
    cor: 'border-carvao/20 text-carvao/40 bg-carvao/3',
    descricao: 'Cancelado',
  },
};

/**
 * Transições permitidas.
 *
 * Uma pedido não salta de "nova" para "entregue": cada passo tem de
 * acontecer. Isto evita cliques errados e mantém a linha do tempo coerente
 * — que é o que se consulta quando há uma reclamação.
 *
 * `entregue` e `devolvida` são terminais, exceto o caminho entregue →
 * devolvida, que acontece dentro do prazo de trocas.
 */
export const TRANSICOES: Record<EstadoPedido, EstadoPedido[]> = {
  novo: ['confirmado', 'cancelado'],
  confirmado: ['preparado', 'cancelado'],
  preparado: ['enviado', 'cancelado'],
  enviado: ['entregue', 'devolvido'],
  entregue: ['devolvido'],
  devolvido: [],
  cancelado: [],
};

export const podeTransitar = (de: EstadoPedido, para: EstadoPedido) =>
  TRANSICOES[de].includes(para);

/** Estados que contam como receita realizada. */
export const ESTADOS_RECEITA: EstadoPedido[] = [
  'confirmado',
  'preparado',
  'enviado',
  'entregue',
];

/* ------------------------------------------------------------------ *
 *  Referência
 * ------------------------------------------------------------------ */

/**
 * Código curto e legível ao telefone: sem 0/O nem 1/I, que se confundem
 * quando alguém dita a referência em voz alta.
 */
export function gerarReferenciaPedido() {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  return `AD-${s}`;
}

/* ------------------------------------------------------------------ *
 *  Formatação
 * ------------------------------------------------------------------ */

export const euros = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

/* ------------------------------------------------------------------ *
 *  Mensagens de WhatsApp por estado
 * ------------------------------------------------------------------ */

type DadosMensagem = {
  nome: string;
  referencia: string;
  telefone?: string | null;
  codigoSeguimento?: string | null;
  total?: number;
};

/**
 * Cada estado tem a sua mensagem, escrita na voz da casa.
 *
 * O painel PREPARA a mensagem e abre o WhatsApp; quem clica em enviar é
 * sempre a vendedora. Numa marca que vive de proximidade, uma mensagem
 * automática detectável custa mais do que poupa — reduz-se o trabalho, não
 * se remove a pessoa.
 */
export function mensagemPorEstado(estado: EstadoPedido, d: DadosMensagem): string | null {
  const primeiroNome = d.nome.split(' ')[0];

  switch (estado) {
    case 'confirmado':
      return `Olá, ${primeiroNome}! Confirmei seu pedido *${d.referencia}*${
        d.total ? ` no valor de ${euros(d.total)}` : ''
      }.\n\nVou preparar tudo com cuidado e te aviso assim que seguir. Obrigada pela confiança.`;

    case 'preparado':
      return `Olá, ${primeiroNome}! A sua pedido *${d.referencia}* está embalada e pronta a seguir.\n\nSegue amanhã de manhã — te mando o código de seguimento assim que tiver.`;

    case 'enviado':
      return `Olá, ${primeiroNome}! A sua pedido *${d.referencia}* já seguiu.${
        d.codigoSeguimento ? `\n\nCódigo de seguimento: *${d.codigoSeguimento}*` : ''
      }\n\nA caixa é neutra, sem qualquer identificação no exterior. Qualquer coisa, me chama.`;

    case 'entregue':
      return `Olá, ${primeiroNome}! Vi que a pedido *${d.referencia}* já chegou.\n\nEspero que você goste. Se o tamanho não estiver perfeito, me diga — trocamos sem complicação nenhuma nos próximos 30 dias.`;

    case 'devolvido':
      return `Olá, ${primeiroNome}! Recebi a devolução da pedido *${d.referencia}*, está tudo tratado.\n\nSe quiser, te ajudo a encontrar o tamanho certo — sem compromisso.`;

    case 'cancelado':
      return `Olá, ${primeiroNome}. A pedido *${d.referencia}* foi cancelada, como combinámos.\n\nQualquer coisa que precise, estou por aqui.`;

    default:
      return null;
  }
}

export function linkWhatsAppPedido(
  estado: EstadoPedido,
  d: DadosMensagem,
): string | null {
  const texto = mensagemPorEstado(estado, d);
  if (!texto) return null;
  const numero = d.telefone ? normalizarNumero(d.telefone) : NUMERO_WHATSAPP;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

/* ------------------------------------------------------------------ *
 *  Exportação CSV
 * ------------------------------------------------------------------ */

/**
 * Escapa um campo para CSV.
 *
 * O apóstrofo à frente de valores que começam por = + - @ evita a injeção
 * de fórmulas: sem isso, um nome como `=HYPERLINK(...)` executaria no Excel
 * de quem abrisse o arquivo.
 */
function campoCsv(v: unknown): string {
  const s = v == null ? '' : String(v);
  const seguro = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",;\n\r]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro;
}

export function paraCsv(linhas: Record<string, unknown>[], colunas: string[]): string {
  const cabecalho = colunas.map(campoCsv).join(';');
  const corpo = linhas.map((l) => colunas.map((c) => campoCsv(l[c])).join(';'));
  // BOM para o Excel reconhecer UTF-8; ";" porque é o separador do Excel em PT
  return '\uFEFF' + [cabecalho, ...corpo].join('\r\n');
}
