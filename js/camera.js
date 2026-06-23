import { state, els } from './state.js';
import { calculateHeight } from './measurement.js';

function showCameraFallback(message) {
  var box = document.getElementById('cameraFallback');
  if (!box) {
    box = document.createElement('div');
    box.id = 'cameraFallback';
    box.className = 'camera-fallback';
    var container = document.getElementById('cameraContainer');
    if (container) container.appendChild(box);
  }
  var name = navigator.userAgent.match(/Firefox\/(\d+)/) ? 'Firefox' :
             navigator.userAgent.match(/Edg\//) ? 'Edge' :
             navigator.userAgent.match(/Chrome\//) ? 'Chrome' :
             navigator.userAgent.match(/Safari\//) ? 'Safari' : 'seu navegador';
  box.innerHTML = '<div class="camera-fallback-box">' +
    '<h3>Câmera indisponível</h3>' +
    '<p>' + message + '</p>' +
    '<p class="camera-fallback-hint">' +
    'No <b>' + name + '</b>: clique no ícone de cadeado/informações na barra ' +
    'de endereço, permita a câmera e recarregue a página.</p>' +
    '<p class="camera-fallback-hint">' +
    'O app continua funcionando em modo <b>Manual</b> ou <b>Dois Toques</b> ' +
    '(use outro celular como visor). Acesse via <b>HTTPS</b> ou <b>localhost</b>.' +
    '</p>' +
    '<button type="button" id="cameraFallbackRetry" class="camera-fallback-btn">' +
    'Tentar novamente</button>' +
    '</div>';
  box.classList.remove('hidden');
  var btn = document.getElementById('cameraFallbackRetry');
  if (btn) btn.addEventListener('click', function () { startCamera(); });
  var overlay = els.overlay;
  if (overlay) overlay.style.background = '#1a1a1a';
}

function hideCameraFallback() {
  var box = document.getElementById('cameraFallback');
  if (box) box.classList.add('hidden');
}

function describeError(err) {
  if (!err) return 'Erro desconhecido ao acessar a câmera.';
  if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
    return 'A permissão de câmera foi negada.';
  }
  if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
    return 'Nenhuma câmera foi encontrada no dispositivo.';
  }
  if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
    return 'A câmera está sendo usada por outro aplicativo.';
  }
  if (err.name === 'OverconstrainedError') {
    return 'Nenhuma câmera atende aos requisitos (câmera traseira).';
  }
  if (err.name === 'SecurityError') {
    return 'Acesso bloqueado por política de segurança. Use HTTPS ou localhost.';
  }
  return 'Erro: ' + (err.message || err.name || 'desconhecido');
}

export function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showCameraFallback('Seu navegador não suporta acesso à câmera (getUserMedia).');
    return;
  }
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: 'environment' } })
    .then(function (signal) {
      els.video.srcObject = signal;
      hideCameraFallback();
      var playPromise = els.video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () { /* autoplay bloqueado, ok */ });
      }
    })
    .catch(function (err) {
      showCameraFallback(describeError(err));
    });
}

export function startGyroscope() {
  window.addEventListener('deviceorientation', onOrientationChange);
}

function onOrientationChange(event) {
  if (!event || event.beta === null) return;

  state.rawAngle = Math.max(0, event.beta - 90);

  if (state.mode === 'gyroscope') {
    state.angle = state.rawAngle;
    calculateHeight();
  }
}
