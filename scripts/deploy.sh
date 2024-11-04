#!/bin/bash

# Остановка существующего процесса на порту 3001
kill $(lsof -t -i:3001) 2>/dev/null || true

# Очистка кэша
rm -rf .next
rm -rf node_modules
rm -rf .eslintcache

# Установка зависимостей
pnpm install --no-frozen-lockfile

# Генерация типов Next.js
pnpm next-types

# Сборка проекта
NODE_ENV=production pnpm build

# Запуск на порту 3001
NODE_ENV=production pnpm start