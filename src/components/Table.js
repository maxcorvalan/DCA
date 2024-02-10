import React from 'react';

const Table = ({ monthlyReturns }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Mes</th>
                    <th>Ganancia en CLP</th>
                    <th>% de la inversión</th>
                </tr>
            </thead>
            <tbody>
                {monthlyReturns && monthlyReturns.map((monthlyReturn, index) => (
                    <tr key={index}>
                        <td>{monthlyReturn.month}</td>
                        <td>{monthlyReturn.profit ? monthlyReturn.profit.toFixed(2) : ''}</td>
                        <td>{monthlyReturn.percentage ? monthlyReturn.percentage.toFixed(2) : ''}%</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default Table;
