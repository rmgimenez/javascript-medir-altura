# Medir Altura

Meça a altura de objetos usando a câmera do celular e o sensor de orientação (gyroscope). Aponte, ajuste a distância, e o app calcula a altura com trigonometria.

## Key Features

- **3 modos de operação**: Gyroscope (automático), Manual (fallback para desktop), Dois Toques (maior precisão)
- **Visor com crosshair** para mirar com precisão
- **Linha de altura animada** sobreposta à imagem da câmera
- **Funciona offline** — 100% no navegador, sem servidor
- **Zero dependências** — HTML, CSS e JavaScript puros

## Tech Stack

- **Linguagem**: JavaScript (ES6)
- **APIs do navegador**: DeviceOrientation API, MediaDevices API (getUserMedia), Canvas API
- **Matemática**: Trigonometria (tangente)
- **Estilo**: CSS3 puro
- **Deploy**: GitHub Pages ou qualquer servidor estático

## Prerequisites

- Navegador moderno com suporte a:
  - `deviceorientation` (gyroscope)
  - `getUserMedia` (câmera)
- Nada mais precisa ser instalado.

## Getting Started

### 1. Clone ou baixe

```bash
git clone https://github.com/seu-usuario/javascript-medir-altura.git
cd javascript-medir-altura
```

### 2. Abra no navegador

Basta abrir o arquivo `index.html` no navegador:

```bash
start index.html
```

Ou sirva com um servidor estático (recomendado para acesso à câmera):

```bash
npx serve .
```

### 3. Permissões

O navegador solicitará acesso à **câmera**. Permita para ver o vídeo ao fundo.

No modo **Gyroscope**, o navegador pode pedir permissão para o sensor de movimento.

### 4. Como usar

1. Selecione o **modo** no topo da tela
2. Ajuste a **distância** até o objeto (slider)
3. Aponte a câmera para o **topo** do objeto
4. Leia a **altura** calculada na tela

## Architecture

### Directory Structure

```
├── index.html         # Estrutura da página e elementos da UI
├── style.css          # Estilos visuais, layout responsivo
├── manifest.json      # Manifesto PWA (ícones, display, theme)
├── sw.js              # Service Worker (offline + cache versionado)
├── icon-192.png       # Ícone PWA 192×192
├── icon-512.png       # Ícone PWA 512×512
├── icon-source.svg    # Fonte vetorial dos ícones (regera via build_icons.py)
├── build_icons.py     # Script utilitário para regerar os PNGs a partir do SVG
├── js/
│   ├── app.js         # Bootstrap, listeners, registro do SW
│   ├── state.js       # Estado global + cache de elementos DOM
│   ├── camera.js      # getUserMedia + fallback amigável
│   ├── overlay.js     # Canvas: crosshair (mira) sobre vídeo
│   ├── measurement.js # Cálculo trigonométrico + 3 modos
│   ├── calibration.js # Calibração contra objeto conhecido (localStorage)
│   ├── storage.js     # IndexedDB: persistência das fotos
│   └── gallery.js     # Captura (foto + overlay) + galeria
└── README.md          # Esta documentação
```

### How the Math Works

O app usa trigonometria básica:

```
altura = tan(ângulo) × distância
```

O **ângulo** é obtido do gyroscope do dispositivo (ângulo de inclinação ao apontar para o topo do objeto). A **distância** é informada pelo usuário via slider.

### Request Lifecycle

1. **`main()`** é chamado no `onload` da página
2. Inicializa listeners: gyroscope, câmera, inputs
3. A cada **evento de orientação** (`deviceorientation`):
   - Ângulo = `beta - 90` (clamped a 0° mínimo)
   - Altura = `tan(ângulo) × distância`
   - UI é atualizada (label, linha vermelha, crosshair)
4. A cada **input do slider**: recalcula e atualiza

### Key Components

**State centralizado** (`js/state.js:1`):

```js
const state = {
  mode: 'gyroscope',  // 'gyroscope' | 'manual' | 'two-tap'
  distance: 20,       // distância em metros
  angle: 0,           // ângulo atual usado no cálculo
  rawAngle: 0,        // ângulo bruto do gyroscope (sempre atualizado)
  height: 0,          // altura calculada em metros
  twoTapBase: null,   // ângulo da base (modo dois toques)
  twoTapTop: null,    // ângulo do topo (modo dois toques)
};
```

**3 modos de operação**:

| Modo | Descrição | Dispositivo |
|---|---|---|
| Gyroscope | Ângulo lido automaticamente do sensor | Smartphones com gyroscope |
| Manual | Slider de ângulo (0-90°) | Desktop, qualquer dispositivo |
| Dois Toques | Trava base (0°), depois trava topo, cálculo automático | Smartphones (mais preciso) |

**Canvas overlay**: Desenha um crosshair (linhas vertical e horizontal) sobre o vídeo da câmera para ajudar a mirar.

**Height line**: Linha vermelha horizontal posicionada proporcionalmente à altura calculada, animada suavemente com CSS `transition`.

### Data Flow

```
DeviceOrientation Event → state.rawAngle
                               ↓
                    ┌──────────┴──────────┐
                    │                     │
              Modo Gyroscope         Modo Dois Toques
                    │                     │
          state.angle = rawAngle    realAngle = top - base
                    │                     │
                    └──────────┬──────────┘
                               ↓
                    altura = tan(angle) × distance
                               ↓
                    updateUI() → heightInfo, heightLine
                    drawOverlay() → crosshair
```

## Environment Variables

Este projeto **não utiliza** variáveis de ambiente. Toda a configuração é feita diretamente na interface.

## Available Scripts

| Comando | Descrição |
|---|---|
| `start index.html` | Abre no navegador padrão (Windows) |
| `npx serve .` | Servidor estático local (recomendado) |
| `python -m http.server` | Alternativa com Python |
| `php -S localhost:8000` | Alternativa com PHP |

## Testing

### Teste manual

Por ser uma aplicação 100% frontend sem dependências, os testes são manuais:

1. **Teste de câmera**: Abrir em dispositivo com câmera, verificar se o vídeo aparece
2. **Teste de gyroscope**: Mover o dispositivo, verificar se o ângulo muda
3. **Teste de precisão**: Medir um objeto de altura conhecida, comparar resultado
4. **Teste cross-browser**: Chrome, Firefox, Safari, Edge
5. **Teste de responsividade**: Portrait e landscape, diferentes tamanhos de tela
6. **Teste offline**: DevTools → Network → Offline, recarregar, app deve funcionar

### Casos de borda verificados

- **Ângulo negativo** → clamped para 0
- **Sem gyroscope** → fallback para modo Manual
- **Câmera negada / indisponível** → overlay amigável com mensagem específica do erro e botão "Tentar novamente"
- **Dois Toques sem base** → bloqueia trava do topo
- **Resize da janela** → crosshair é redesenhado
- **SW desatualizado** → toast oferece recarregar pra pegar a versão nova

## Regenerar ícones

Os ícones são gerados a partir de `icon-source.svg` via Pillow:

```bash
pip install Pillow
python build_icons.py
```

Edite o SVG e rode o script para atualizar `icon-192.png` e `icon-512.png`.

## Versionamento de cache

O Service Worker usa a constante `BUILD_VERSION` em `sw.js` como chave do cache (`medir-altura-<versão>`). Para forçar todos os usuários a receberem a próxima versão:

1. Edite `BUILD_VERSION` em `sw.js` (ex: `'2026-06-24'`)
2. Faça commit e push
3. O SW novo apaga caches antigos via `activate`, instala o novo, mostra um toast "Atualização disponível" e recarrega automaticamente após 30s

## Deployment

### GitHub Pages (recomendado)

```bash
git push origin main
```

1. Vá em **Settings > Pages** no repositório
2. Selecione `main` como branch
3. Aponte para a raiz (`/`)
4. O site estará disponível em `https://seu-usuario.github.io/javascript-medir-altura`

### Qualquer servidor estático

Copie a pasta inteira (`index.html`, `style.css`, `js/`, `manifest.json`, `sw.js`, `icon-*.png`) para qualquer servidor estático:

- Netlify (drag & drop)
- Vercel
- Amazon S3
- Nginx / Apache

## Troubleshooting

### Câmera não funciona

- Verifique se o navegador tem permissão de câmera
- Use HTTPS (ou `localhost`) — `getUserMedia` não funciona em HTTP em produção
- Tente em um dispositivo diferente

### Ângulo não atualiza

- Modo Gyroscope: verifique se o dispositivo tem gyroscope
- Em iPhones, o `deviceorientation` requer permissão explícita (iOS 13+)
- Tente o modo **Manual** como fallback

### Valores estranhos

- Certifique-se de que a **distância** está correta
- Segure o dispositivo estável ao fazer a leitura
- Objetos muito distantes ou muito próximos reduzem a precisão

### iOS não funciona

No iOS 13+, o `deviceorientation` é desabilitado por padrão. O app tenta solicitar permissão automaticamente. Se não funcionar:

1. Abra as Configurações do Safari
2. Ative "Motion & Orientation Access"
3. Recarregue a página

## Contributing

1. Faça um fork do repositório
2. Crie uma branch: `git checkout -b minha-feature`
3. Commit: `git commit -m 'feat: minha feature'`
4. Push: `git push origin minha-feature`
5. Abra um Pull Request

## License

MIT
