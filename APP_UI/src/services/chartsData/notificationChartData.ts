const notificationChartOptions: Highcharts.Options = {
  title: {
    text: '',
  },
  credits: {
    enabled: false
  },
  xAxis: {
    categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    title: {
      text: 'Days',
    },
  },
  yAxis: {
    title: {
      text: 'Events',
    },
  },
  chart: {
    type: 'line',
    height: 350,
  },
  series: [
    {
      name: 'Success',
      type: 'line',
      data: [4, 5.5, 7, 6.5, 8, 12],
      color: "#470247b5"
    },
    {
      name: 'Bounce',
      type: 'line',
      data: [0, 2, 3, 12],
      color: "#e7542e"
    },
  ],
};
export default notificationChartOptions;