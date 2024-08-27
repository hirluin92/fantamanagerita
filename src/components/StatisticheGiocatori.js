import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import '../styles/StatisticheGiocatori.css';

const StatisticheGiocatori = () => {
  const [giocatori, setGiocatori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    const fetchGiocatori = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'giocatori'));
        const giocatoriData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGiocatori(giocatoriData);
      } catch (error) {
        console.error("Errore durante il recupero dei giocatori:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGiocatori();
  }, []);

  const giocatoriFiltrati = giocatori.filter(giocatore => 
    giocatore.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    giocatore.squadra.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) return <div>Caricamento statistiche...</div>;

  return (
    <div className="statistiche-giocatori-container">
      <h2>Statistiche Giocatori</h2>
      <input
        type="text"
        placeholder="Cerca giocatore o squadra"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="search-input"
      />
      <table className="statistiche-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Squadra</th>
            <th>Ruolo</th>
            <th>Gol</th>
            <th>Assist</th>
            <th>Voto Medio</th>
          </tr>
        </thead>
        <tbody>
          {giocatoriFiltrati.map(giocatore => (
            <tr key={giocatore.id}>
              <td>{giocatore.nome}</td>
              <td>{giocatore.squadra}</td>
              <td>{giocatore.ruolo}</td>
              <td>{giocatore.gol}</td>
              <td>{giocatore.assist}</td>
              <td>{giocatore.votoMedio.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatisticheGiocatori;