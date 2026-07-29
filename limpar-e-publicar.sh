#!/usr/bin/env bash
# ---------------------------------------------------------------
#  Substitui TODO o conteúdo do repositório por esta pasta.
#
#  Use isto quando o repositório ficou com ficheiros antigos
#  misturados (o upload web do GitHub acrescenta, nunca apaga).
#
#     ./limpar-e-publicar.sh https://github.com/SEU-USER/SEU-REPO.git
# ---------------------------------------------------------------
set -euo pipefail
V='\033[0;32m'; A='\033[0;33m'; R='\033[0;31m'; F='\033[0m'
ok(){ echo -e "${V}✓${F} $1"; }
er(){ echo -e "${R}✗${F} $1" >&2; exit 1; }

cd "$(dirname "$0")"
command -v git >/dev/null || er "Git não instalado: https://git-scm.com"

REMOTO="${1:-}"
[ -n "$REMOTO" ] || er "Falta o endereço:
  ./limpar-e-publicar.sh https://github.com/SEU-USER/SEU-REPO.git"

[ -f package.json ] || er "package.json não encontrado — está na pasta certa?"
grep -q '"next"' package.json || er "package.json sem Next.js — pasta errada."

echo -e "${A}!${F} Isto vai APAGAR tudo o que está no repositório remoto"
echo "  e substituir pelo conteúdo desta pasta."
echo

# histórico novo, do zero — garante que nada antigo sobrevive
rm -rf .git
git init -q
git symbolic-ref HEAD refs/heads/main
git config user.name  "A Dona Lingerie"
git config user.email "dev@adonalingerie.pt"
git remote add origin "$REMOTO"

git add -A
git commit -q -m "A Dona Lingerie — site completo (estrutura limpa)"

N=$(git ls-files | wc -l | tr -d ' ')
ok "$N ficheiros preparados"

# verificações antes de enviar
git ls-files | grep -q '\[' && er "Há nomes com [ ] — o GitHub recusaria."
ok "nenhum nome problemático"

for proibido in turbo.json apps packages pnpm-workspace.yaml; do
  git ls-files | grep -q "^$proibido" && er "$proibido ainda presente — limpe a pasta."
done
ok "sem restos de monorepo (turbo.json, apps/, packages/)"

git ls-files | grep -qx package.json || er "package.json não está na raiz"
ok "package.json na raiz — a Vercel vai detetar o Next"

echo
echo "A substituir o conteúdo remoto…"
echo "(se pedir palavra-passe, use um token de github.com/settings/tokens)"
echo

if git push -u origin main --force; then
  URL=$(git remote get-url origin | sed 's/\.git$//')
  echo; ok "Repositório limpo e publicado."
  echo
  echo "   $URL"
  echo
  echo -e "   ${A}AGORA, NA VERCEL:${F}"
  echo "   O vercel.json já força 'next build' e 'npm install',"
  echo "   por isso normalmente basta fazer Redeploy."
  echo
  echo "   Se o log ainda mostrar 'turbo run build --filter=@adona/web',"
  echo "   as definições antigas do painel estão a interferir. O mais"
  echo "   rápido é apagar o projeto na Vercel e reimportá-lo:"
  echo "     Settings → Advanced → Delete Project"
  echo "     (apaga só o projeto na Vercel, não o repositório)"
  echo "     Depois: vercel.com/new → importar → Deploy"
  echo
  echo "   Detalhes em RESOLVER-VERCEL.md"
  echo
else
  er "Envio falhou. Use um token em vez da palavra-passe:
  https://github.com/settings/tokens → Generate new token (classic) → marcar 'repo'"
fi
