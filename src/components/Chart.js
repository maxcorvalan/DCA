import React from 'react';
import { Line } from 'react-chartjs-2';

const Chart = ({ monthlyReturns }) => {
    const labels = monthlyReturns.map((monthlyReturn) => monthlyReturn.month);
    const data = monthlyReturns.map((monthlyReturn) => monthlyReturn.profit);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Ganancia en CLP',
                data: data,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }
        ]
    };

    return <Line data={chartData} />;
};

export default Chart;
