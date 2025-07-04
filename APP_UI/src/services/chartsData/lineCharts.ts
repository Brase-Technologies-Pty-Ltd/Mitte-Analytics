const chartOptions: Highcharts.Options = {
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
      text: 'Stock',
    },
  },
  chart: {
    type: 'line',
    height: 350,

  },
  series: [
    {
      name: 'In Stock',
      type: 'line',
      data: [4, 5.5, 7, 6.5, 8, 12],
      color: "#470247b5"
    },
    {
      name: 'Out of Stock',
      type: 'line',
      data: [0, 2, 3, 5],
      color: "#e7542e"
    },
    {
      name: 'Close to Min',
      type: 'line',
      data: [3, 2, 4, 8, 10],
      color: "#046778"
    },
  ],
};
export default chartOptions;