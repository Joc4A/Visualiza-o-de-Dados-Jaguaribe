document.addEventListener('DOMContentLoaded', () => {
  const client = mqtt.connect('wss://broker.emqx.io:8084/mqtt');
  const data = [];

  const tempTopic = 'mqtt/ufpb-inst/temp';
  const turbidezTopic = 'mqtt/ufpb-inst/turbidez';
  const solidosTopic = 'mqtt/ufpb-inst/solidos';
  const condutividadeTopic = 'mqtt/ufpb-inst/condutividade';
  const phTopic = 'mqtt/ufpb-inst/ph';
  const controlTopic = 'mqtt/ufpb-inst/t';

  client.subscribe(tempTopic);
  client.subscribe(turbidezTopic);
  client.subscribe(solidosTopic);
  client.subscribe(condutividadeTopic);
  client.subscribe(phTopic);
  client.subscribe(controlTopic);

  client.on('message', function (topic, payload) {
    try {
      console.log(`Message on topic ${topic}: ${payload.toString()}`);
      const number = parseFloat(payload.toString());
      if (!isNaN(number)) {
        updateChart(topic, number);
      }
    } catch (e) {
      console.log(e.message);
    }
  });

  client.on('connect', () => {
    setTimeout(infoHide, 1000);
    toastr.success('Conectado!');
  });

  const createChartConfig = (label, yAxisText) => ({
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: label,
          backgroundColor: '#4ECCA3',
          borderColor: '#4ECCA3',
          data: [],
          fill: false,
          tension: 0.5,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          title: {
            display: true,
            text: yAxisText,
            color: '#EEEEEE',
          },
          ticks: {
            color: '#EEEEEE',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Tempo',
            color: '#EEEEEE',
          },
          ticks: {
            color: '#EEEEEE',
          },
        },
      },
      interaction: {
        mode: 'nearest',
        intersect: false,
      },
      color: '#EEEEEE',
    },
  });

  const configTemp = createChartConfig('Temperatura', 'Temperatura');
  const configTurbidez = createChartConfig('Turbidez', 'Turbidez');
  const configSolidos = createChartConfig('Sólidos Dissolvidos', 'Sólidos Dissolvidos');
  const configCondutividade = createChartConfig('Condutividade', 'Condutividade');
  const configPH = createChartConfig('pH', 'pH');

  const ctxTemp = document.getElementById('canvas').getContext('2d');
  window.myLineTemp = new Chart(ctxTemp, configTemp);

  const ctxTurbidez = document.getElementById('canvasTurbidez').getContext('2d');
  window.myLineTurbidez = new Chart(ctxTurbidez, configTurbidez);

  const ctxSolidos = document.getElementById('canvasSolidos').getContext('2d');
  window.myLineSolidos = new Chart(ctxSolidos, configSolidos);

  const ctxCondutividade = document.getElementById('canvasCondutividade').getContext('2d');
  window.myLineCondutividade = new Chart(ctxCondutividade, configCondutividade);

  const ctxPH = document.getElementById('canvasPH').getContext('2d');
  window.myLinePH = new Chart(ctxPH, configPH);

  const logs = document.getElementById('logs');
  const limit = 10;

  const updateChart = (topic, number) => {
    let chart;
    let unit = '';
    switch (topic) {
      case tempTopic:
        chart = window.myLineTemp;
        unit = 'ºC';
        break;
      case turbidezTopic:
        chart = window.myLineTurbidez;
        unit = 'NTU';
        break;
      case solidosTopic:
        chart = window.myLineSolidos;
        unit = 'ppm';
        break;
      case condutividadeTopic:
        chart = window.myLineCondutividade;
        unit = 'µS/cm';
        break;
      case phTopic:
        chart = window.myLinePH;
        unit = '';
        break;
      default:
        return;
    }

    if (chart.config.data.datasets.length > 0) {
      const date = new Date();
      const hours = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
      const copyData = chart.config.data.labels.slice((limit - 1) * -1);

      copyData.push(hours);
      chart.config.data.labels = copyData;

      chart.config.data.datasets.forEach(function (dataset) {
        const copyData = dataset.data.slice((limit - 1) * -1);
        copyData.push(number);

        data.unshift({ hours, number, topic });

        logs.innerHTML = '';
        data.forEach((item) => {
          let itemUnit = '';
          switch (item.topic) {
            case tempTopic: itemUnit = 'ºC'; break;
            case turbidezTopic: itemUnit = 'NTU'; break;
            case solidosTopic: itemUnit = 'ppm'; break;
            case condutividadeTopic: itemUnit = 'µS/cm'; break;
            case phTopic: itemUnit = ''; break;
          }
          logs.innerHTML += `<div class="log">
            <div class="logHora">${item.hours}</div>
            <div class="separador"></div>
            <div class="logDado">${item.number}${itemUnit}</div>
            </div>`;
        });

        dataset.data = copyData;
      });

      chart.update();
    }
  };

  infoShow(
    '<h3>Conectando </h3><img width="100px" src="https://media3.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" />'
  );
  function infoShow() {
    const info = document.getElementById('statusInfo');
    info.innerHTML = `
    <div class="loading">
        <div class="lds-facebook">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      <div class="status">Conectando...</div>
    `;
  }
  function infoHide() {
    const info = document.getElementById('statusInfo');
    info.innerHTML =
      '<div class="status"><i class="fa fa-check"></i> Conectado</div>';
    info.style.color = 'var(--green-light)';
  }

  const saveButton = document.getElementById('save');
  saveButton.addEventListener('click', () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      data.map((e) => `${e.hours};${e.topic};${e.number}`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'dados.csv');
    document.body.appendChild(link);
    link.click();
    toastr.info('Arquivo .csv gerado!', 'Sucesso!');
  });

  const startButton = document.getElementById('start');
  startButton.addEventListener('click', () => {
    try {
      client.publish(controlTopic, 'start');
    } catch (error) {
      console.log('erro ao começar');
    }
  });
});