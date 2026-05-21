export const DB_NAME = 'medir-altura-photos';
export const DB_VERSION = 1;
export const STORE_NAME = 'photos';

export const state = {
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

export const els = {};

export function cacheElements() {
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
