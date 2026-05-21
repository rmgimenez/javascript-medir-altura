const state = {
  mode: 'gyroscope',
  distance: 20,
  angle: 0,
  rawAngle: 0,
  height: 0,
  twoTapBase: null,
  twoTapTop: null,
};

const els = {};

function cacheElements() {
  els.video = document.getElementById('myVideo');
  els.overlay = document.getElementById('overlay');
  els.modeSelect = document.getElementById('modeSelect');
  els.mySlider = document.getElementById('mySlider');
  els.distLabel = document.getElementById('distLabel');
  els.heightInfo = document.getElementById('heightInfo');
  els.angleInfo = document.getElementById('angleInfo');
  els.heightLine = document.getElementById('heightLine');
  els.heightLineLabel = document.getElementById('heightLineLabel');
  els.manualAngleRow = document.getElementById('manualAngleRow');
  els.angleSlider = document.getElementById('angleSlider');
  els.angleLabel = document.getElementById('angleLabel');
  els.twoTapRow = document.getElementById('twoTapRow');
  els.btnLockBase = document.getElementById('btnLockBase');
  els.btnLockTop = document.getElementById('btnLockTop');
  els.btnReset = document.getElementById('btnReset');
}

function main() {
  cacheElements();

  els.modeSelect.addEventListener('change', onModeChange);
  els.mySlider.addEventListener('input', onDistanceChange);
  els.angleSlider.addEventListener('input', onAngleSliderChange);
  els.btnLockBase.addEventListener('click', onLockBase);
  els.btnLockTop.addEventListener('click', onLockTop);
  els.btnReset.addEventListener('click', onResetTwoTap);

  startCamera();
  startGyroscope();

  onModeChange();
  updateUI();
}

function startCamera() {
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: 'environment' } })
    .then(function (signal) {
      els.video.srcObject = signal;
      els.video.play();
    })
    .catch(function () {
      els.overlay.style.background = '#1a1a1a';
    });
}

function startGyroscope() {
  window.addEventListener('deviceorientation', onOrientationChange);
}

function onModeChange() {
  state.mode = els.modeSelect.value;

  els.manualAngleRow.classList.toggle('hidden', state.mode !== 'manual');
  els.twoTapRow.classList.toggle('hidden', state.mode !== 'two-tap');

  if (state.mode === 'two-tap') {
    onResetTwoTap();
  }

  updateUI();
}

function onDistanceChange() {
  state.distance = parseFloat(els.mySlider.value);
  els.distLabel.textContent = state.distance;
  calculateHeight();
}

function onOrientationChange(event) {
  if (!event || event.beta === null) return;

  state.rawAngle = Math.max(0, event.beta - 90);

  if (state.mode === 'gyroscope') {
    state.angle = state.rawAngle;
    calculateHeight();
  }
}

function onAngleSliderChange() {
  state.angle = parseFloat(els.angleSlider.value);
  els.angleLabel.textContent = state.angle.toFixed(0);
  calculateHeight();
}

function calculateHeight() {
  if (state.mode === 'two-tap') {
    if (state.twoTapBase === null || state.twoTapTop === null) {
      drawOverlay();
      return;
    }
    const realAngle = state.twoTapTop - state.twoTapBase;
    state.angle = Math.max(0, realAngle);
  }

  const rad = (state.angle * Math.PI) / 180;
  state.height = Math.tan(rad) * state.distance;

  updateUI();
  drawOverlay();
}

function updateUI() {
  els.heightInfo.innerHTML = state.height.toFixed(1) + ' m';
  els.angleInfo.innerHTML = '(' + state.angle.toFixed(1) + '&deg;)';
  els.heightLineLabel.textContent = state.height.toFixed(1) + ' m';

  const maxAngle = 90;
  const pct = Math.min(state.angle / maxAngle, 1);
  const bottomPx = 10 + (1 - pct) * 30;
  els.heightLine.style.bottom = bottomPx + '%';
  els.heightLineLabel.style.bottom = 'calc(' + bottomPx + '% + 8px)';
}

function drawOverlay() {
  const canvas = els.overlay;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, canvas.height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(canvas.width, cy);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('+', cx, cy + 5);
}

function onLockBase() {
  const a = getCurrentAngle();
  state.twoTapBase = a;
  state.twoTapTop = null;
  state.angle = 0;
  state.height = 0;
  els.btnLockBase.disabled = true;
  els.btnLockTop.disabled = false;
  els.btnLockBase.textContent = '1. Base: ' + a.toFixed(1) + '° (travado)';
  updateUI();
  drawOverlay();
}

function onLockTop() {
  const a = getCurrentAngle();
  if (state.twoTapBase === null) return;
  state.twoTapTop = a;
  els.btnLockTop.disabled = true;
  els.btnLockTop.textContent = '2. Topo: ' + a.toFixed(1) + '° (travado)';
  calculateHeight();
}

function onResetTwoTap() {
  state.twoTapBase = null;
  state.twoTapTop = null;
  state.angle = 0;
  state.height = 0;
  els.btnLockBase.disabled = false;
  els.btnLockTop.disabled = true;
  els.btnLockBase.textContent = '1. Travar base';
  els.btnLockTop.textContent = '2. Travar topo';
  updateUI();
  drawOverlay();
}

function getCurrentAngle() {
  if (state.mode === 'gyroscope' || state.mode === 'two-tap') {
    return state.rawAngle;
  }
  return parseFloat(els.angleSlider.value);
}

window.addEventListener('resize', function () {
  drawOverlay();
});
