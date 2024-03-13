function main() {
  window.addEventListener('deviceorientation', onOrientationChange);

  navigator.mediaDevices
    .getUserMedia({
      video: {
        facingMode: 'environment', // 'user' para a câmera do usuário, 'environment' para a câmera do ambiente.
      },
    })
    .then(function (signal) {
      const video = document.getElementById('myVideo');
      video.srcObject = signal;
      video.play();
    })
    .catch(function (err) {
      alert('Não foi possível acessar a câmera do dispositivo.');
    });

  onOrientationChange();
}

function onOrientationChange(event) {
  let angle = event.beta - 90;
  if (angle < 0) angle = 0;

  const distancia = document.getElementById('mySlider').value;

  document.getElementById('myLabel').innerHTML = `Distância: ${distancia} metros`;

  const height = Math.tan((angle * Math.PI) / 180) * distancia;

  document.getElementById('heightInfo').innerHTML =
    height.toFixed(1) + ' m (' + angle.toFixed(1) + '&deg;)';
}
