# Рудименты проекта для удаления

## Файлы
- src/features/chat/ui/cyber-personal-account.tsx (перенесен в pages)
- src/features/chat/model/types.ts (объединен с types/index.ts)
- src/types/external.d.ts (объединен с types/framer-motion.d.ts)
- src/types/components.d.ts (перенесен в features/chat/types)

## Неиспользуемые импорты
- debounce из lodash (используем throttle)
- useEffect в index.tsx
- useRef в index.tsx