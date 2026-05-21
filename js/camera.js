import { state, els } from './state.js';
import { calculateHeight } from './measurement.js';

export function startCamera() {
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
