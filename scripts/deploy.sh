#!/usr/bin/env bash
# 构建并把 dist/ 发布到 gh-pages 分支（GitHub Pages）
set -euo pipefail
cd "$(dirname "$0")/.."

worktree=/tmp/flypy-practice-ghpages

pnpm build
git worktree add -B gh-pages "$worktree"
rm -rf "$worktree"/*
cp -r dist/* "$worktree"/
cd "$worktree"
git add -A
git -c user.name="${GIT_AUTHOR_NAME:-$(git config user.name)}" \
    -c user.email="${GIT_AUTHOR_EMAIL:-$(git config user.email)}" \
    commit -m "deploy: build $(date +%Y-%m-%d\ %H:%M)"
git push origin gh-pages
cd - >/dev/null
git worktree remove "$worktree" --force
echo "✓ 已发布到 gh-pages，稍候可在 https://kaiwenyao.github.io/flypy-practice/ 查看"
