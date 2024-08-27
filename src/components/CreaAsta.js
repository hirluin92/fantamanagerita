import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import '../styles/CreaAsta.css';

const CreaAsta = () => {
  const navigate = useNavigate();
  const [opzioniAsta, setOpzioniAsta] = useState({
    crediti: 100,
    partenzaDa: 'quotazione',
    timebank: 10,
    tempoPerRilanciare: 5,
    chiamata: 'libera',
    numeroPartecipanti: 5
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOpzioniAsta(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const astaRef = await addDoc(collection(db, 'aste'), {
        ...opzioniAsta,
        creatorId: auth.currentUser.uid,
        stato: 'in attesa',
        partecipanti: [],
        dataCreazione: new Date()
      });
      navigate(`/sala-attesa/${astaRef.id}`);
    } catch (error) {
      console.error("Errore durante la creazione dell'asta:", error);
    }
  };

  return (
    <div className="crea-asta-container">
      <h2>Crea una Nuova Asta</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Crediti:</label>
          <select name="crediti" value={opzioniAsta.crediti} onChange={handleChange}>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="500">500</option>
            <option value="1000">1000</option>
          </select>
        </div>
        <div className="form-group">
          <label>Partendo da:</label>
          <select name="partenzaDa" value={opzioniAsta.partenzaDa} onChange={handleChange}>
            <option value="1">1</option>
            <option value="quotazione">Quotazione giocatore</option>
          </select>
        </div>
        <div className="form-group">
          <label>Timebank:</label>
          <select name="timebank" value={opzioniAsta.timebank} onChange={handleChange}>
            <option value="10">10 secondi</option>
            <option value="15">15 secondi</option>
            <option value="30">30 secondi</option>
          </select>
        </div>
        <div className="form-group">
          <label>Tempo per rilanciare:</label>
          <select name="tempoPerRilanciare" value={opzioniAsta.tempoPerRilanciare} onChange={handleChange}>
            <option value="5">5 secondi</option>
            <option value="10">10 secondi</option>
            <option value="15">15 secondi</option>
          </select>
        </div>
        <div className="form-group">
          <label>Chiamata:</label>
          <select name="chiamata" value={opzioniAsta.chiamata} onChange={handleChange}>
            <option value="libera">Libera</option>
            <option value="reparto">Per reparto</option>
          </select>
        </div>
        <div className="form-group">
          <label>Numero di partecipanti:</label>
          <select name="numeroPartecipanti" value={opzioniAsta.numeroPartecipanti} onChange={handleChange}>
            {[...Array(8)].map((_, i) => (
              <option key={i} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
        <button type="submit">Crea Asta</button>
      </form>
    </div>
  );
};

export default CreaAsta;