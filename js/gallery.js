import { state, els } from './state.js';
import { savePhoto, loadPhotos, deletePhoto } from './storage.js';

export function capturePhoto() {
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

export function renderGallery() {
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
