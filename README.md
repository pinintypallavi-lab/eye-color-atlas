# Eye Color Atlas

This workspace is now set up to run locally in VS Code on Windows with `pnpm`.

## Requirements

- Node.js 24
- `pnpm` installed globally

## Run In VS Code

1. Open the folder in VS Code.
2. Run the `Install dependencies` task once.
3. Use one of these tasks:
   - `Run Eye Color Atlas` for the frontend only
   - `Run API Server` for the upload analysis backend
   - `Run Full Stack` to start both together
4. Open `http://localhost:5173`

You can also press `F5` and use `Open Eye Color Atlas`.

## Run In Terminal

```powershell
pnpm install
pnpm dev
```

Frontend only:

```powershell
pnpm dev:app
```

API only:

```powershell
pnpm dev:api
```

## Optional AI Setup

The atlas runs locally without extra environment variables.

If you want the upload analyzer to use OpenAI naming instead of the built-in local fallback, set these before starting the API:

```powershell
$env:AI_INTEGRATIONS_OPENAI_API_KEY="your-key"
$env:AI_INTEGRATIONS_OPENAI_BASE_URL="https://api.openai.com/v1"
```
