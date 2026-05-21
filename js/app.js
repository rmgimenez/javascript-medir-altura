import { els, cacheElements } from './state.js';
import { loadCalibration, updateCalibrationUI, openCalibrationModal, closeCalibrationModal, confirmCalibration, resetCalibration, updateCalibrationMeasured } from './calibration.js';
import { startCamera, startGyroscope } from './camera.js';
import { onModeChange, changeDistance, onAngleSliderChange, onLockBase, onLockTop, onResetTwoTap, updateUI, calculateHeight } from './measurement.js';
import { drawOverlay } from './overlay.js';
import { capturePhoto, renderGallery } from './gallery.js';

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
  }
}

function main() {
  cacheElements();
  loadCalibration();

  els.modeSelect.addEventListener('change', onModeChange);
  els.angleSlider.addEventListener('input', onAngleSliderChange);
  els.distBtns = document.querySelectorAll('.dist-btn');
  els.distBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      changeDistance(parseInt(this.dataset.step));
    });
  });
  els.btnLockBase.addEventListener('click', onLockBase);
  els.btnLockTop.addEventListener('click', onLockTop);
  els.btnReset.addEventListener('click', onResetTwoTap);

  els.btnCalibrate.addEventListener('click', openCalibrationModal);
  els.calibrationClose.addEventListener('click', closeCalibrationModal);
  els.btnConfirmCalibration.addEventListener('click', confirmCalibration);
  els.btnResetCalibration.addEventListener('click', resetCalibration);
  els.calibrationKnownInput.addEventListener('input', updateCalibrationMeasured);
  els.btnCapture.addEventListener('click', capturePhoto);

  startCamera();
  startGyroscope();

  onModeChange();
  updateCalibrationUI();
  renderGallery();
  updateUI();
  registerSW();
}

main();

window.addEventListener('resize', function () {
  drawOverlay();
});
