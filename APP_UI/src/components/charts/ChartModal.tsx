import { useRef, FC } from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

interface ReusableChartProps extends HighchartsReact.Props {
  chartOptions: Highcharts.Options;
}

const ReusableChart: FC<ReusableChartProps> = ({ chartOptions, ...props }) => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={chartOptions}
      ref={chartComponentRef}
      {...props}
    />
  );
};

export default ReusableChart;
