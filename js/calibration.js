import { state, els } from './state.js';

function computeRawHeight() {
  var rad = (state.angle * Math.PI) / 180;
  return Math.tan(rad) * state.distance;
}

export function loadCalibration() {
  var saved = localStorage.getItem('medir-altura-calibration');
  if (saved) {
    var data = JSON.parse(saved);
    state.calibrationFactor = data.factor || 1;
    state.calibrationKnownHeight = data.knownHeight || null;
  }
}

function saveCalibration() {
  localStorage.setItem(
    'medir-altura-calibration',
    JSON.stringify({
      factor: state.calibrationFactor,
      knownHeight: state.calibrationKnownHeight,
    })
  );
}

export function updateCalibrationUI() {
  if (state.calibrationFactor !== 1) {
    els.calibrationStatus.textContent =
      'Calibrado (fator: ' + state.calibrationFactor.toFixed(3) + 'x)';
    els.calibrationStatus.classList.remove('hidden');
    els.btnResetCalibration.classList.remove('hidden');
    els.calibrationRow.classList.remove('hidden');
  } else {
    els.calibrationStatus.classList.add('hidden');
    els.btnResetCalibration.classList.add('hidden');
    els.calibrationRow.classList.add('hidden');
  }
}

export function openCalibrationModal() {
  els.calibrationModal.classList.remove('hidden');
  els.calibrationKnownInput.value = state.calibrationKnownHeight || '2.0';
  updateCalibrationMeasured();
}

export function closeCalibrationModal() {
  els.calibrationModal.classList.add('hidden');
}

export function updateCalibrationMeasured() {
  var raw = computeRawHeight();
  els.calibrationMeasured.textContent = raw.toFixed(2) + ' m';
}

export function confirmCalibration() {
  var known = parseFloat(els.calibrationKnownInput.value);
  if (!known || known <= 0) return;
  var raw = computeRawHeight();
  if (raw <= 0) return;
  state.calibrationFactor = known / raw;
  state.calibrationKnownHeight = known;
  saveCalibration();
  updateCalibrationUI();
  closeCalibrationModal();
}

export function resetCalibration() {
  state.calibrationFactor = 1;
  state.calibrationKnownHeight = null;
  localStorage.removeItem('medir-altura-calibration');
  updateCalibrationUI();
}
