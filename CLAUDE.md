# Claude Code — OpenCode Go (modelos MiniMax)

Este projeto está configurado pra usar o Claude Code apontando pro endpoint
Anthropic-compatível do **OpenCode Go** (https://opencode.ai/zen/go/v1/messages),
que serve os modelos **MiniMax M2.5 / M2.7 / M3** via o plano Go da OpenCode.

## Setup

1. Assine o OpenCode Go e copie sua API key no console:
   https://opencode.ai/auth

2. Set a env var no seu shell antes de rodar o `claude`:

   **PowerShell (permanente, escopo usuário):**
   ```powershell
   [System.Environment]::SetEnvironmentVariable('OPENCODE_GO_API_KEY', 'sua-key', 'User')
   ```

   **bash / git-bash (permanente, adicione ao ~/.bashrc):**
   ```bash
   echo 'export OPENCODE_GO_API_KEY="sua-key"' >> ~/.bashrc
   source ~/.bashrc
   ```

   **Sessão atual (temporário):**
   ```bash
   OPENCODE_GO_API_KEY=sua-key claude
   ```

3. Abra o Claude Code na raiz do projeto:
   ```bash
   cd javascript-medir-altura
   claude
   ```

## Modelos disponíveis

| ID              | Onde usar                              | Observação              |
|-----------------|----------------------------------------|-------------------------|
| `minimax-m3`    | `model` no settings (padrão) ou `--model` | Recomendado, mais novo  |
| `minimax-m2.7`  | `--model minimax-m2.7` ou `availableModels` | Fallback                |
| `minimax-m2.5`  | `--model minimax-m2.5` ou `small/fast`    | Mais barato             |

Pra trocar o modelo por sessão:
```bash
claude --model minimax-m2.7
```

## Como funciona tecnicamente

- O Claude Code fala o protocolo **Anthropic Messages API**.
- O OpenCode Go expõe os modelos MiniMax nesse protocolo em
  `POST /v1/messages` (junto com `/v1/chat/completions` pra outros modelos
  não-Anthropic-compatíveis como GLM/DeepSeek/Kimi/MiMo — esses não funcionam
  no Claude Code, precisariam de LiteLLM como proxy).
- O config em `.claude/settings.local.json` define:
  - `ANTHROPIC_BASE_URL` → `https://opencode.ai/zen/go/v1`
  - `ANTHROPIC_AUTH_TOKEN` → expande `${OPENCODE_GO_API_KEY}` da env var
  - `model` → `minimax-m3` por padrão
  - `fallbackModel` → cadeia M3 → M2.7 → M2.5

## Troubleshooting

- **"Authentication failed"** → `OPENCODE_GO_API_KEY` não está setada ou expirou.
  Rode `echo $OPENCODE_GO_API_KEY` (bash) ou `$env:OPENCODE_GO_API_KEY`
  (PowerShell) pra confirmar.

- **"Model not found"** → você escolheu um modelo fora da lista
  (GLM, DeepSeek, Kimi, MiMo, Qwen). Pra usar os MiniMax, use `minimax-m*`.

- **Quer voltar pro Claude oficial** → apague o bloco `env` e o `model`
  de `.claude/settings.local.json`, ou renomeie o arquivo pra `.json.disabled`.

## Limites do plano Go

- Limite de 5h: ~3.200 req com M3, ~31.650 com DeepSeek V4 Flash
- Semanal: ~8.000 req com M3
- Mensal: ~16.000 req com M3
- Se bater o limite, ativa "Use balance" no console pra usar créditos Zen.
