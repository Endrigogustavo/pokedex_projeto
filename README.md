# Pokédex

Aplicativo de Pokédex em **React Native + Expo Router** com autenticação, captura de
Pokémon, montagem de time, sistema de batalha e conquistas. Os dados de treinador
(stats, time e capturas) são persistidos numa API na AWS.

## Como rodar

```bash
npm install
npm start        # abre o Expo
# ou: npm run android | npm run ios | npm run web
```

## Stack

- Expo `~54` / React Native `0.81` / React `19`
- Expo Router (roteamento por arquivos em `src/app`)
- React Native Paper (UI) + tema customizado
- Axios (integração com a API)
- AsyncStorage (sessão)

## Estrutura de pastas

```
src/
├── @types/        # tipagens compartilhadas (ex.: Pokemon)
├── app/           # rotas (Expo Router) — telas e layouts
├── components/    # componentes de UI reutilizáveis
├── constants/     # dados estáticos, tema e helpers (starters, conquistas, etc.)
├── context/       # estado global (Auth, Team, Toast)
├── integration/   # clientes da API (axios) e conversões de dados
└── styles/        # folhas de estilo das telas (ver nota abaixo)
```

## Por que a estrutura diverge do padrão de referência

O padrão de referência
([FATEC-Multiplataforma2026/pokemon](https://github.com/FATEC-Multiplataforma2026/pokemon/tree/main/src))
define as pastas: `@types`, `app`, `components`, `constants`, `context` e `integration`.

Este projeto segue esse padrão, com **uma única adição intencional**: a pasta
`styles/`.

### `styles/` — folhas de estilo das telas

As telas mais densas (`app/index.tsx` e `app/dashboard.tsx`) tinham um volume grande
de `StyleSheet`. Em vez de manter esse CSS inline misturado à lógica do componente,
os estilos foram extraídos para `src/styles/` (`login.styles.ts` e
`dashboard.styles.ts`).

Motivos:

- **Legibilidade**: o arquivo da tela fica focado em lógica/JSX, não em dezenas de
  linhas de estilo.
- **Manutenção**: ajustes visuais ficam isolados num único lugar por tela.
- **Consistência com o padrão de componentes**: componentes menores mantêm o estilo
  co-localizado (ex.: `context/ToastContext.styles.ts`); a pasta `styles/` é usada
  só para as telas grandes, onde a separação compensa.

> Decisão de organização, não de funcionalidade: nada além de `styles/` foi
> acrescentado ao padrão de referência.
