import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import '../styles/CreaSquadra.css';

const CreaSquadra = () => {
  const [nomeSquadra, setNomeSquadra] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, 'teams'), {
        nome: nomeSquadra,
        userId: auth.currentUser.uid,
        giocatori: [],
        dataCreazione: new Date()
      });
      navigate(`/team/${docRef.id}`);
    } catch (error) {
      console.error("Errore durante la creazione della squadra:", error);
    }
  };

  return (
    <div className="crea-squadra-container">
      <h2>Crea una Nuova Squadra</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nomeSquadra">Nome della Squadra:</label>
          <input
            type="text"
            id="nomeSquadra"
            value={nomeSquadra}
            onChange={(e) => setNomeSquadra(e.target.value)}
            required
          />
        </div>
        <button type="submit">Crea Squadra</button>
      </form>
    </div>
  );
};

export default CreaSquadra;