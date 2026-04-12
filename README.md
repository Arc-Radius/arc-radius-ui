# ArcRadius — UI Client

ArcRadius helps people follow LGBTQ+ legislation across the U.S.: what’s moving in each state, what a bill actually does, and ways to respond when it matters. This repo is the ui client - Expo + React Native

If you just want to see it: **[arcradi.us](https://arcradi.us)**

## Local development

You’ll need a recent **Node.js** (current LTS is a safe bet) and npm. Install dependencies from the repo root:

```bash
npm install
```

Run the dev server once:

```bash
npx expo start
```

In the terminal UI, use **single-key shortcuts** to open a target (e.g. **w** web, **i** iOS simulator, **a** Android emulator—the exact keys are listed in the menu). Scan the QR code from the same screen for a physical device.

## Scripts

These npm scripts wrap the [Expo CLI](https://docs.expo.dev/more/expo-cli/) commands:

| Command | What it does |
|--------|----------------|
| `npm run web` | `npx expo start --web` |
| `npm start` | `npx expo start` |
| `npm run ios` / `npm run android` | `npx expo start --ios` / `--android` |
| `npm run lint` | ESLint + Prettier check |
| `npm run format` | ESLint fix + Prettier write |
| `npm run prebuild` | `npx expo prebuild` — native `ios/` / `android/` when you need a bare workflow |

## Environment variables

To point the app at a **local API** while you develop, set:

- `EXPO_PUBLIC_API_BASE_URL` — Base URL of your local backend (e.g. `http://localhost:…`).

Anything else about configuration, secrets, or how production is wired up: **ask a maintainer** rather than guessing from the repo.

## Deployment

The web app is deployed on **Netlify**. If something looks wrong in production or you need access details, reach out to a **maintainer**.

## Contributing

We’re glad you’re interested! **Reach out to a maintainer** before you put serious time in—so we can align on priorities, avoid duplicate work, and get you anything you need (access, context, or a quick orientation). Small fixes and typo PRs are welcome; larger features or refactors are easier after a short conversation.

## Further reading

Routing, platform-specific shell, data flow, and deeper architecture are documented in **[TECHNICAL.md](TECHNICAL.md)**.
