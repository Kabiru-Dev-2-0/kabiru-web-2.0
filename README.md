# Next.js & HeroUI Template

This is a template for creating applications using Next.js 14 (app directory) and HeroUI (v2)...

[Try it on CodeSandbox](https://githubbox.com/heroui-inc/heroui/next-app-template)

## Technologies Used

- [Next.js 14](https://nextjs.org/docs/getting-started)
- [HeroUI v2](https://heroui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tailwind Variants](https://tailwind-variants.org)
- [TypeScript](https://www.typescriptlang.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [next-themes](https://github.com/pacocoursey/next-themes)

## How to Use

### Use the template with create-next-app

To create a new project based on this template using `create-next-app`, run the following command:

```bash
npx create-next-app -e https://github.com/heroui-inc/next-app-template
```

### Install dependencies

You can use one of them `npm`, `yarn`, `pnpm`, `bun`, Example using `npm`:

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

### Supabase env (local + cloud)

Client, server, and middleware read the URL from `NEXT_PUBLIC_SUPABASE_URL` and the key from `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, with fallback to `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `utils/supabase/env.ts`).

If dev logs `Error: fetch failed` from `@supabase/auth-js` in the Edge middleware, check network or VPN, confirm the Supabase project is not paused, and that the key matches the project. Middleware continues the request without session refresh if the call fails so the app does not hard-fail.

### Setup pnpm (optional)

If you are using `pnpm`, you need to add the following code to your `.npmrc` file:

```bash
public-hoist-pattern[]=*@heroui/*
```

After modifying the `.npmrc` file, you need to run `pnpm install` again to ensure that the dependencies are installed correctly.

## Story workflow (Skripsi API)

The quiz chat calls `POST /api/ai/story/generate`, which proxies to Skripsi `POST /api/interactive/chat` (supervisor-first graph).

**Where the backend URL comes from**

1. If the incoming request host is not `localhost` / `127.0.0.1`, the route uses the built-in production default `https://agentic-ai-story-based-learning.vercel.app` (no dashboard env required).
2. Otherwise (local dev), if `STORY_AGENT_API_URL` is set in `.env.local`, that value is used.
3. If unset locally, the default is `http://127.0.0.1:8000`.

On production-like hosts, if `STORY_AGENT_API_KEY` is unset, the route may send a temporary dummy key for bootstrapping. Prefer setting `STORY_AGENT_API_KEY` to match Skripsi `API_KEY` when env access exists.

If the browser shows **401** with JSON like `{"detail":"Not authenticated"}`, check **Vercel Deployment Protection** on the project (that response often comes from protection, not from this app code).

The UI shows the **Supervisor** step first, then planning / research / writing / critique as SSE events arrive. The client keeps a stable **`thread_id`** per tab session (in-memory ref) for LangGraph checkpoint continuity on follow-up turns, and sends the last **eight** chat turns as **`history`** (`{ role, text }`) so the supervisor can use recent context without using the database.

Illustrations from the backend may send `generated_images[]` with **raw base64** plus optional `mime_type` (Gemini / normalized OpenRouter), or a **full data URL** in `base64_data` (older OpenRouter payloads). The quiz UI builds the image `src` with `imageSrcFromGeneratedImage` so OpenRouter is not double-prefixed with `data:image/png;base64,`.

Completed stories are kept in a **`storyArtifacts`** list (per browser tab) and linked to the matching AI chat turn via **`storyArtifactId`**. The workflow tracker + “buka cerita” UI is **inline under that message** (newest story: full tracker + CTA; older: compact row + **Buka**). **`prior_stories`** (title + excerpt, last five) is sent on each new story run for the Skripsi supervisor. For **QA** (`/api/ask-to-pdf`), the client sends **`story_context`** (full stored stories, capped) so questions like “jelaskan ceritanya” still work when RAG returns no PDF hits. QA workflow steps still merge into `agentOutputs`.

## License

Licensed under the [MIT license](https://github.com/heroui-inc/next-app-template/blob/main/LICENSE).
