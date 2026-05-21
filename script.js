var state = {
  mode: 'gyroscope',
  distance: 20,
  angle: 0,
  rawAngle: 0,
  height: 0,
  twoTapBase: null,
  twoTapTop: null,
  calibrationFactor: 1,
  calibrationKnownHeight: null,
};

var els = {};

var DB_NAME = 'medir-altura-photos';
var DB_VERSION = 1;
var STORE_NAME = 'photos';

function cacheElements() {
  els.video = document.getElementById('myVideo');
  els.overlay = document.getElementById('overlay');
  els.modeSelect = document.getElementById('modeSelect');
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

  els.btnCalibrate = document.getElementById('btnCalibrate');
  els.calibrationModal = document.getElementById('calibrationModal');
  els.calibrationClose = document.getElementById('calibrationClose');
  els.calibrationKnownInput = document.getElementById('calibrationKnownInput');
  els.calibrationMeasured = document.getElementById('calibrationMeasured');
  els.btnConfirmCalibration = document.getElementById('btnConfirmCalibration');
  els.btnResetCalibration = document.getElementById('btnResetCalibration');
  els.calibrationStatus = document.getElementById('calibrationStatus');
  els.btnCapture = document.getElementById('btnCapture');
  els.gallery = document.getElementById('gallery');
  els.calibrationRow = document.getElementById('calibrationRow');
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

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
  }
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

function changeDistance(delta) {
  state.distance = Math.max(1, Math.min(100, state.distance + delta));
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

function computeRawHeight() {
  var rad = (state.angle * Math.PI) / 180;
  return Math.tan(rad) * state.distance;
}

function calculateHeight() {
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

function updateUI() {
  els.heightInfo.innerHTML = state.height.toFixed(1) + ' m';
  els.angleInfo.innerHTML = '(' + state.angle.toFixed(1) + '&deg;)';
  els.heightLineLabel.textContent = state.height.toFixed(1) + ' m';

  var maxAngle = 90;
  var pct = Math.min(state.angle / maxAngle, 1);
  var bottomPx = 10 + (1 - pct) * 30;
  els.heightLine.style.bottom = bottomPx + '%';
  els.heightLineLabel.style.bottom = 'calc(' + bottomPx + '% + 8px)';
}

function drawOverlay() {
  var canvas = els.overlay;
  var rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;

  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  var cx = canvas.width / 2;
  var cy = canvas.height / 2;

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

function onLockTop() {
  var a = getCurrentAngle();
  if (state.twoTapBase === null) return;
  state.twoTapTop = a;
  els.btnLockTop.disabled = true;
  els.btnLockTop.textContent = '2. Topo: ' + a.toFixed(1) + '\u00b0 (travado)';
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

function loadCalibration() {
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

function updateCalibrationUI() {
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

function openCalibrationModal() {
  els.calibrationModal.classList.remove('hidden');
  els.calibrationKnownInput.value = state.calibrationKnownHeight || '2.0';
  updateCalibrationMeasured();
}

function closeCalibrationModal() {
  els.calibrationModal.classList.add('hidden');
}

function updateCalibrationMeasured() {
  var raw = computeRawHeight();
  els.calibrationMeasured.textContent = raw.toFixed(2) + ' m';
}

function confirmCalibration() {
  var known = parseFloat(els.calibrationKnownInput.value);
  if (!known || known <= 0) return;
  var raw = computeRawHeight();
  if (raw <= 0) return;
  state.calibrationFactor = known / raw;
  state.calibrationKnownHeight = known;
  saveCalibration();
  updateCalibrationUI();
  closeCalibrationModal();
  calculateHeight();
}

function resetCalibration() {
  state.calibrationFactor = 1;
  state.calibrationKnownHeight = null;
  localStorage.removeItem('medir-altura-calibration');
  updateCalibrationUI();
  calculateHeight();
}

function openDB() {
  return new Promise(function (resolve, reject) {
    var req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = function (e) {
      var db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = function (e) {
      resolve(e.target.result);
    };
    req.onerror = function (e) {
      reject(e.target.error);
    };
  });
}

function savePhoto(blob, height) {
  return openDB().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(STORE_NAME, 'readwrite');
      var store = tx.objectStore(STORE_NAME);
      var item = { blob: blob, height: height, date: new Date().toISOString() };
      var req = store.add(item);
      req.onsuccess = function () {
        resolve();
      };
      req.onerror = function (e) {
        reject(e.target.error);
      };
    });
  });
}

function loadPhotos() {
  return openDB().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(STORE_NAME, 'readonly');
      var store = tx.objectStore(STORE_NAME);
      var req = store.getAll();
      req.onsuccess = function () {
        var items = req.result || [];
        items.reverse();
        items.forEach(function (item) {
          item.url = URL.createObjectURL(item.blob);
        });
        resolve(items);
      };
      req.onerror = function (e) {
        reject(e.target.error);
      };
    });
  });
}

function deletePhoto(id) {
  return openDB().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(STORE_NAME, 'readwrite');
      var store = tx.objectStore(STORE_NAME);
      var req = store.delete(id);
      req.onsuccess = function () {
        resolve();
      };
      req.onerror = function (e) {
        reject(e.target.error);
      };
    });
  });
}

function capturePhoto() {
  var video = els.video;
  if (!video.videoWidth) return;

  var canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  var ctx = canvas.getContext('2d');

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  var cx = canvas.width / 2;
  var cy = canvas.height / 2;

  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, canvas.height);
  ctx.moveTo(0, cy);
  ctx.lineTo(canvas.width, cy);
  ctx.stroke();

  var maxAngle = 90;
  var pct = Math.min(state.angle / maxAngle, 1);
  var bottomPx = 10 + (1 - pct) * 30;
  var lineY = canvas.height * (1 - bottomPx / 100);

  ctx.strokeStyle = '#ff4444';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#ff4444';
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.moveTo(0, lineY);
  ctx.lineTo(canvas.width, lineY);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ff4444';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(state.height.toFixed(1) + ' m', 8, lineY - 8);

  canvas.toBlob(function (blob) {
    savePhoto(blob, state.height).then(function () {
      renderGallery();
    });
  }, 'image/jpeg', 0.85);
}

function renderGallery() {
  loadPhotos().then(function (items) {
    state.photos = items;
    if (items.length === 0) {
      els.gallery.innerHTML = '';
      els.gallery.classList.add('hidden');
      return;
    }
    els.gallery.classList.remove('hidden');
    var html = '<div class="gallery-inner">';
    items.forEach(function (item) {
      html += '<div class="gallery-item" data-id="' + item.id + '">';
      html += '<img src="' + item.url + '" alt="Foto" />';
      html += '<div class="gallery-info">';
      html += '<span>' + item.height.toFixed(1) + ' m</span>';
      html += '<span class="gallery-date">' + new Date(item.date).toLocaleDateString() + '</span>';
      html += '</div>';
      html += '<button class="gallery-delete">&times;</button>';
      html += '</div>';
    });
    html += '</div>';
    els.gallery.innerHTML = html;

    els.gallery.querySelectorAll('.gallery-delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = parseInt(this.parentElement.dataset.id);
        deletePhoto(id).then(function () {
          renderGallery();
        });
      });
    });
  });
}

window.addEventListener('resize', function () {
  drawOverlay();
});
