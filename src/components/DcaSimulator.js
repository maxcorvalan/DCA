import React, { useState } from 'react';
import axios from 'axios';

const DcaSimulator = () => {
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [historicalData, setHistoricalData] = useState([]);
  const [results, setResults] = useState([]);

  const handleInputChange = (event) => {
    setInvestmentAmount(event.target.value);
  };

  const fetchData = async () => {
    try {
      const response = await axios.get('https://proxy-buda.onrender.com/api/markets/BTC-CLP/trades');
      setHistoricalData(response.data.trades.entries);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  const calculateResults = async () => {
    if (!investmentAmount || !historicalData || historicalData.length === 0) {
      console.error('Please enter all required fields and fetch historical data.');
      return;
    }

    const monthlyInvestment = parseFloat(investmentAmount);
    const currentDate = new Date();
    const endDate = currentDate.getTime(); // Fecha actual
    const startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1, 12, 0, 0, 0).getTime(); // Hace un año

    const results = [];
    let totalInvested = 0;
    let totalValue = 0;

    // Obtener transacciones para el primer día de cada mes durante el último año
    for (let timestamp = startDate; timestamp <= endDate; timestamp = getNextMonthFirstDay(timestamp)) {
      const dayOfMonth = new Date(timestamp).getDate();
      if (dayOfMonth !== 1) continue; // Saltar si no es el primer día del mes

      try {
        // Consultar transacciones del mercado BTC-CLP para el primer día del mes a las 12:00 UTC
        const response = await axios.get(`https://proxy-buda.onrender.com/api/markets/BTC-CLP/trades?timestamp=${timestamp}`);
        const entries = response.data.trades.entries;
        
        // Filtrar transacciones para este mes
        const filteredEntries = entries.filter(entry => isSameMonthYear(entry[0], timestamp));
        
        // Obtener el precio final del mes
        const lastEntry = filteredEntries[filteredEntries.length - 1];
        const finalPrice = parseFloat(lastEntry[2]);

        // Calcular el valor total de la inversión este mes usando el precio final
        const totalAmount = filteredEntries.reduce((total, entry) => total + parseFloat(entry[1]), 0);
        const monthlyValue = totalAmount * finalPrice;

        // Actualizar el total invertido y el valor total
        totalInvested += monthlyInvestment;
        totalValue += monthlyValue;

        // Calcular la ganancia y el porcentaje de cambio
        const monthlyProfit = totalValue - totalInvested;
        const percentageChange = (monthlyProfit / totalInvested) * 100;

        // Agregar resultados a la lista
        results.push({
          date: new Date(timestamp).toISOString().split('T')[0],
          totalInvested: totalInvested.toFixed(2),
          totalValue: totalValue.toFixed(2),
          monthlyProfit: monthlyProfit.toFixed(2),
          percentageChange: percentageChange.toFixed(2),
        });
      } catch (error) {
        console.error('Error fetching data for timestamp:', timestamp, error);
      }
    }

    setResults(results);
  };

  // Función para obtener el primer día del siguiente mes
  const getNextMonthFirstDay = (timestamp) => {
    const nextMonth = new Date(timestamp);
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
    nextMonth.setUTCDate(1);
    nextMonth.setUTCHours(12, 0, 0, 0);
    return nextMonth.getTime();
  };

  // Función para verificar si la fecha de la transacción está en el mismo mes y año
  const isSameMonthYear = (timestamp1, timestamp2) => {
    const date1 = new Date(parseInt(timestamp1));
    const date2 = new Date(timestamp2);
    return date1.getUTCMonth() === date2.getUTCMonth() && date1.getUTCFullYear() === date2.getUTCFullYear();
  };

  return (
    <div>
      <h1>DCA Simulator</h1>
      <InvestmentForm onFetchData={fetchData} onCalculateResults={calculateResults} />
      <Chart monthlyReturns={results} />
      <Table monthlyReturns={results} />
    </div>
  );
};

export default DcaSimulator;
