# NITO frontend

Start with this folder as a complete project. You do not need to move files from your old project into it.

## Run on your Mac

Install Node.js 22.12+ (Node.js 24 recommended). Extract the ZIP in Downloads:

```bash
cd ~/Downloads/frontend
npm ci
npm run dev
```

Open the Local URL printed by Vite. Use your actual extraction path if different.

```bash
npm run check       # lint and production build
npm run preview     # view the production build after building
```

## Where things go

| Folder | What belongs here |
| --- | --- |
| `src/pages/` | One folder per page: its sections, components, hooks, services, mock data, and CSS |
| `src/components/` | Reusable controls, branding, shared header/footer, and newsletter |
| `src/app/` | App startup, providers, and route registration |
| `src/context/` | State shared across the application |
| `src/hooks/` | Hooks reused by multiple pages/features |
| `src/services/` | Shared API client and infrastructure helpers |
| `src/data/` | Shared navigation and footer content |
| `src/config/` | Public environment configuration |
| `src/styles/` | Shared base styles, tokens, reusable component styles, and layout styles |
| `public/assets/` | Logos, images, fonts, and icons |

**Adding a page:** follow [docs/ADDING-PAGES.md](docs/ADDING-PAGES.md).

## Common changes

| Change | File |
| --- | --- |
| Homepage sections | `src/pages/home/sections/` |
| Homepage content | `src/pages/home/mocks/homeData.js` |
| Homepage appearance and background | `src/pages/home/home.css` and `src/pages/home/sections/HeroSection.jsx` |
| Header/footer logo | `src/components/brand/Wordmark.jsx` |
| Header menu links | `src/data/navigation.js` |
| Footer links | `src/data/footer.js` |
| Add a route | `src/app/router.jsx` |
| Shared colors and font | `src/styles/tokens.css` |

Use `@/` for imports from shared folders, and short relative imports inside a page. Example: `@/components/ui/Button` and `./hooks/usePrompt`.

## Frontend only

**Chat integration:** see [docs/CHAT-INTEGRATION.md](docs/CHAT-INTEGRATION.md). Homepage prompts now open `/chat/:chatId`; **Try NITO** opens `/chat`. Chat history is stored locally in this browser. Keep `VITE_CHAT_ORIGIN` empty until the production server handoff is implemented.

React + Vite + Tailwind CSS + React Router, using JavaScript/JSX. No backend, database, or authentication server is included. Dependencies are unchanged.

Mocks are enabled by default. Prompt responses are demonstrations, attachments stay local, and newsletter submissions do not create subscriptions. Future pages display coming-soon content. File downloads, social profiles, and account services are not configured.

Copy `.env.example` to `.env` only to override defaults. Keep `VITE_USE_MOCKS=true` until a backend exists; never put secrets in Vite variables. Future service integration details and repair notes are in [docs/REORGANIZATION.md](docs/REORGANIZATION.md).
