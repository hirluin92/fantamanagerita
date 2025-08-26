import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import '../styles/DettagliSquadra.css';

const DettagliSquadra = () => {
  const { id } = useParams();
  const [squadra, setSquadra] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSquadra = async () => {
      try {
        const docRef = doc(db, 'teams', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSquadra({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("La squadra non esiste!");
        }
      } catch (error) {
        console.error("Errore durante il recupero della squadra:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSquadra();
  }, [id]);

  if (loading) return <div>Caricamento...</div>;
  if (!squadra) return <div>Squadra non trovata</div>;

  return (
    <div className="dettagli-squadra-container">
      <h2>{squadra.nome}</h2>
      <p>Data di creazione: {squadra.dataCreazione.toDate().toLocaleDateString()}</p>
      <h3>Giocatori:</h3>
      {squadra.giocatori.length > 0 ? (
        <ul className="giocatori-list">
          {squadra.giocatori.map((giocatore, index) => (
            <li key={index}>{giocatore.nome} - {giocatore.ruolo}</li>
          ))}
        </ul>
      ) : (
        <p>Nessun giocatore nella squadra.</p>
      )}
    </div>
  );
};

export default DettagliSquadra;