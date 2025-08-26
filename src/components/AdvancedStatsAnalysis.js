import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

const AdvancedStatsAnalysis = ({ playerId }) => {
  const [playerStats, setPlayerStats] = useState(null);

  useEffect(() => {
    const fetchPlayerStats = async () => {
      const q = query(collection(db, 'playerStats'), where('playerId', '==', playerId));
      const querySnapshot = await getDocs(q);
      const stats = querySnapshot.docs.map(doc => doc.data());
      setPlayerStats(stats);
    };

    fetchPlayerStats();
  }, [playerId]);

  const calculateTrend = (data) => {
    // Implementa qui la logica per calcolare la tendenza
    // Questo è solo un esempio semplificato
    const values = data.map(d => d.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return values[values.length - 1] > avg ? 'In crescita' : 'In calo';
  };

  if (!playerStats) return <div>Caricamento statistiche...</div>;

  const chartData = {
    labels: playerStats.map(stat => stat.date),
    datasets: [
      {
        label: 'Punteggio Fantacalcio',
        data: playerStats.map(stat => stat.fantasyScore),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="advanced-stats-analysis">
      <h2>Analisi Statistica Avanzata</h2>
      <div className="stats-summary">
        <p>Media punti: {(playerStats.reduce((sum, stat) => sum + stat.fantasyScore, 0) / playerStats.length).toFixed(2)}</p>
        <p>Tendenza: {calculateTrend(playerStats.map(stat => ({date: stat.date, value: stat.fantasyScore})))}</p>
        {/* Aggiungi qui altre statistiche avanzate */}
      </div>
      <div className="stats-chart">
        <Line data={chartData} />
      </div>
    </div>
  );
};

export default AdvancedStatsAnalysis;