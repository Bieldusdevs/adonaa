import { hash } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { db, usuarios } from './index';

/**
 * Cria (ou atualiza) o usuário do painel.
 *
 *   npm run criar-admin -- ana@exemplo.pt "Ana Ribeiro" "senha-longa"
 *
 * A senha nunca fica guardada em lado nenhum além do hash Argon2id.
 * Se der o comando no terminal, apague-o depois do histórico:  history -d
 */
async function main() {
  const [email, nome, senha] = process.argv.slice(2);

  if (!email || !nome || !senha) {
    console.error(`
Uso:
  npm run criar-admin -- <email> "<nome completo>" "<senha>"

Exemplo:
  npm run criar-admin -- ana@adonalingerie.com.br "Ana Ribeiro" "seda-renda-2026-lisboa"
`);
    process.exit(1);
  }

  if (senha.length < 12) {
    console.error('✗ A senha precisa de pelo menos 12 caracteres.');
    process.exit(1);
  }

  const emailNorm = email.toLowerCase().trim();
  const senhaHash = await hash(senha, {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  const [existente] = await db
    .select({ id: usuarios.id })
    .from(usuarios)
    .where(eq(usuarios.email, emailNorm))
    .limit(1);

  if (existente) {
    await db
      .update(usuarios)
      .set({ senhaHash, nomeCompleto: nome, ativo: true })
      .where(eq(usuarios.id, existente.id));
    console.log(`✓ Senha atualizada para ${emailNorm}`);
  } else {
    await db.insert(usuarios).values({
      email: emailNorm,
      nomeCompleto: nome,
      senhaHash,
      papel: 'admin',
    });
    console.log(`✓ Usuário criado: ${emailNorm}`);
  }

  console.log(`\n  Entre em:  /${process.env.ADMIN_PATH ?? 'gestao-ad-2f9k'}/entrar\n`);
  process.exit(0);
}

main().catch((e) => {
  console.error('✗', e.message);
  process.exit(1);
});
