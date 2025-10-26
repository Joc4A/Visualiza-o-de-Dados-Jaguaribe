document.addEventListener('DOMContentLoaded', () => {
    const client = mqtt.connect('ws://54.233.175.183:8083/mqtt', {
    clientId: 'emqx_NTEyNz',
  });

  client.on('connect', () => {
    setTimeout(infoHide, 1000);
    setInterval(send, 2000);
  });
  infoShow(
    '<h3>Conectando </h3><img width="100px" src="https://media3.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" />'
  );

  function infoShow(text) {
    const info = document.getElementById('info');
    const content = document.getElementById('content');
    info.innerHTML = text;
    info.style.display = 'flex';
    content.style.display = 'none';
  }
  function infoHide() {
    const info = document.getElementById('info');
    const content = document.getElementById('content');
    info.style.display = 'none';
    content.style.display = 'flex';
  }

  const tempInput = document.getElementById('temp');
  const valueLabel = document.getElementById('value');
  const button = document.querySelector('button');
  const logs = document.getElementById('logs');
  let value = tempInput.value;

  tempInput.addEventListener('change', (e) => {
    value = e.target.value;
    valueLabel.innerHTML = `${value} ºC`;
  });
  button.addEventListener('click', () => {
    try {
      client.publish('mqtt/ufpb-inst/temp', value.toString());
      const date = new Date();
      logs.innerHTML += `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} - Enviou ${value} ºC <br />`;
    } catch (error) {}
  });

  function send() {
    //const number = Math.floor(Math.random() * 0 + 25);
    //client.publish('mqtt/ufpb-inst/temp', number.toString());
    client.publish('mqtt/ufpb-inst/temp', value.toString());
  }
});
