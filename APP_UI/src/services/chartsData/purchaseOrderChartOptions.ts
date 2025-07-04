const purchaseOrderChartOptions: Highcharts.Options = {
    title: {
      text: '',
    },
    credits: {
      enabled: false
    },
    xAxis: {
      categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      title: {
        text: 'Days',
      },
    },
    yAxis: {
      title: {
        text: '',
      },
    },
    chart: {
      type: 'column',
      height: 350,
  
    },
    series: [
      {
        name: 'Initiated',
        type: "column",
        data: [10, 5, 4, 7, 8, 12, 9],
        color: "#470247b5"
      },
      {
        name: 'Completed',
        type: "column",
        data: [4, 5, 3, 5, 6, 9, 2],
        color: "#e7542e"
      },
    ],
  };
  export default purchaseOrderChartOptions;