#!/bin/bash
pnpm install
pnpm lint --fix
pnpm build 
pm2 restart neon-chat