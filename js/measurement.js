import { state, els } from './state.js';
import { drawOverlay } from './overlay.js';
import { updateCalibrationMeasured } from './calibration.js';

export function onModeChange() {
  state.mode = els.modeSelect.value;

  els.manualAngleRow.classList.toggle('hidden', state.mode !== 'manual');
  els.twoTapRow.classList.toggle('hidden', state.mode !== 'two-tap');

  if (state.mode === 'two-tap') {
    onResetTwoTap();
  }

  updateUI();
}

export function changeDistance(delta) {
  state.distance = Math.max(1, Math.min(100, state.distance + delta));
  els.distLabel.textContent = state.distance;
  calculateHeight();
}

export function onAngleSliderChange() {
  state.angle = parseFloat(els.angleSlider.value);
  els.angleLabel.textContent = state.angle.toFixed(0);
  calculateHeight();
}

function computeRawHeight() {
  var rad = (state.angle * Math.PI) / 180;
  return Math.tan(rad) * state.distance;
}

function getCurrentAngle() {
  if (state.mode === 'gyroscope' || state.mode === 'two-tap') {
    return state.rawAngle;
  }
  return parseFloat(els.angleSlider.value);
}

export function calculateHeight() {
  if (state.mode === 'two-tap') {
    if (state.twoTapBase === null || state.twoTapTop === null) {
      drawOverlay();
      return;
    }
    var realAngle = state.twoTapTop - state.twoTapBase;
    state.angle = Math.max(0, realAngle);
  }

  state.height = computeRawHeight() * state.calibrationFactor;

  updateUI();
  drawOverlay();

  if (!els.calibrationModal.classList.contains('hidden')) {
    updateCalibrationMeasured();
  }
}

export function updateUI() {
  els.heightInfo.innerHTML = state.height.toFixed(1) + ' m';
  els.angleInfo.innerHTML = '(' + state.angle.toFixed(1) + '&deg;)';
  els.heightLineLabel.textContent = state.height.toFixed(1) + ' m';

  var maxAngle = 90;
  var pct = Math.min(state.angle / maxAngle, 1);
  var bottomPx = 10 + (1 - pct) * 30;
  els.heightLine.style.bottom = bottomPx + '%';
  els.heightLineLabel.style.bottom = 'calc(' + bottomPx + '% + 8px)';
}

export function onLockBase() {
  var a = getCurrentAngle();
  state.twoTapBase = a;
  state.twoTapTop = null;
  state.angle = 0;
  state.height = 0;
  els.btnLockBase.disabled = true;
  els.btnLockTop.disabled = false;
  els.btnLockBase.textContent = '1. Base: ' + a.toFixed(1) + '\u00b0 (travado)';
  updateUI();
  drawOverlay();
}

export function onLockTop() {
  var a = getCurrentAngle();
  if (state.twoTapBase === null) return;
  state.twoTapTop = a;
  els.btnLockTop.disabled = true;
  els.btnLockTop.textContent = '2. Topo: ' + a.toFixed(1) + '\u00b0 (travado)';
  calculateHeight();
}

export function onResetTwoTap() {
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
