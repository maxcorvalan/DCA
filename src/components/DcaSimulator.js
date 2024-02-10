import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Table from './Table';

const DcaSimulator = () => {
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('https://www.buda.com/api/v2/markets/BTC-CLP/trades');
      const trades = response.data.data.trades.entries.map(entry => ({
        timestamp: parseInt(entry[0]),
        amount: parseFloat(entry[1]),
        price: parseFloat(entry[2]),
        direction: entry[3]
      }));
      setHistoricalData(trades);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  const calculateResults = () => {
    if (!investmentAmount || !startDate || !endDate) {
      console.error('Please enter all required fields.');
      return;
    }

    const filteredData = historicalData.filter(entry => entry.timestamp >= startDate && entry.timestamp <= endDate);
    const monthlyInvestment = parseFloat(investmentAmount);
    let totalInvested = 0;
    let totalValue = 0;
    let currentDate = startDate;

    const results = [];

    while (currentDate <= endDate) {
      const filteredEntries = filteredData.filter(entry => entry.timestamp <= currentDate);
      const averagePrice = filteredEntries.reduce((acc, curr) => acc + curr.price, 0) / filteredEntries.length;
      const totalCoins = filteredEntries.reduce((acc, curr) => acc + curr.amount, 0);
      const currentValue = totalCoins * averagePrice;
      totalInvested += monthlyInvestment;
      totalValue = totalCoins * averagePrice;

      results.push({
        date: currentDate,
        totalInvested,
        totalValue,
        percentageChange: ((totalValue - totalInvested) / totalInvested) * 100
      });

      const nextMonthDate = new Date(currentDate);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      currentDate = nextMonthDate.getTime();
    }

    setResults(results);
  };

  return (
    <div>
      <h2>Dollar Cost Averaging (DCA) Simulator</h2>
      <label htmlFor="investmentAmount">Monthly Investment Amount (CLP):</label>
      <input
        type="number"
        id="investmentAmount"
        value={investmentAmount}
        onChange={(e) => setInvestmentAmount(e.target.value)}
      />
      <label htmlFor="startDate">Start Date:</label>
      <input
        type="date"
        id="startDate"
        value={startDate ? new Date(startDate).toISOString().split('T')[0] : ''}
        onChange={(e) => setStartDate(new Date(e.target.value).getTime())}
      />
      <label htmlFor="endDate">End Date:</label>
      <input
        type="date"
        id="endDate"
        value={endDate ? new Date(endDate).toISOString().split('T')[0] : ''}
        onChange={(e) => setEndDate(new Date(e.target.value).getTime())}
      />
      <button onClick={calculateResults}>Calculate</button>
      {results.length > 0 && <Table data={results} />}
    </div>
  );
};

export default DcaSimulator;
