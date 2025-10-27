document.addEventListener('DOMContentLoaded', () => {
  const client = mqtt.connect('wss://broker.emqx.io:8084/mqtt');

  const inputs = {
    temp: document.getElementById('temp'),   // temperatura (°C)
    cond: document.getElementById('condutividade'),   // condutividade (µS/cm)
    turb: document.getElementById('turbidez'),   // turbidez (NTU)
    tds:  document.getElementById('solidos'),    // sólidos dissolvidos (mg/L)
    ph:   document.getElementById('ph')      // pH
  };

  const topics = {
    temp: 'mqtt/ufpb-inst/temp',
    cond: 'mqtt/ufpb-inst/condutividade',
    turb: 'mqtt/ufpb-inst/turbidez',
    tds:  'mqtt/ufpb-inst/solidos_dissolvidos',
    ph:   'mqtt/ufpb-inst/ph'
  };

  const logs = document.getElementById('logs');
  const button = document.querySelector('button');

  function logLine(text) {
    if (!logs) return;
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    logs.innerHTML += `${hh}:${mm}:${ss} - ${text}<br/>`;
  }

  function publishAll() {
    Object.keys(inputs).forEach(key => {
      const val = inputs[key]?.value;
      if (val !== null && val !== undefined && val !== '') {
        client.publish(topics[key], val.toString());
        logLine(`Enviou ${key.toUpperCase()}: ${val}`);
      }
    });
  }

  // conecta no broker
  client.on('connect', () => {
    logLine('Conectado ao broker EMQX');
    // publica periodicamente
    setInterval(publishAll, 2000);
  });

  // clique do botão publica na hora
  if (button) {
    button.addEventListener('click', publishAll);
  }
});
