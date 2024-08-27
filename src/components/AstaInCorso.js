import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import '../styles/AstaInCorso.css';

const AstaInCorso = () => {
  const { id } = useParams();
  const [asta, setAsta] = useState(null);
  const [giocatoreAttuale, setGiocatoreAttuale] = useState(null);
  const [offertaAttuale, setOffertaAttuale] = useState(0);
  const [tempoRimanente, setTempoRimanente] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'aste', id), (doc) => {
      if (doc.exists()) {
        setAsta({ id: doc.id, ...doc.data() });
      }
    });

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (asta && asta.stato === 'in corso') {
      // Logica per gestire il timer e le offerte
      const timer = setInterval(() => {
        setTempoRimanente(prev => {
          if (prev > 0) return prev - 1;
          // Gestire la fine del tempo per l'offerta attuale
          return 0;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [asta]);

  const faOfferta = async (nuovaOfferta) => {
    if (nuovaOfferta > offertaAttuale) {
      try {
        await updateDoc(doc(db, 'aste', id), {
          offertaAttuale: nuovaOfferta,
          offerenteAttuale: auth.currentUser.uid
        });
        setOffertaAttuale(nuovaOfferta);
        setTempoRimanente(asta.tempoPerRilanciare);
      } catch (error) {
        console.error("Errore durante l'offerta:", error);
      }
    }
  };

  const selezionaGiocatore = async (giocatore) => {
    try {
      await updateDoc(doc(db, 'aste', id), {
        giocatoreAttuale: giocatore,
        offertaAttuale: asta.partenzaDa === '1' ? 1 : giocatore.quotazione,
        offerenteAttuale: null
      });
      setGiocatoreAttuale(giocatore);
      setOffertaAttuale(asta.partenzaDa === '1' ? 1 : giocatore.quotazione);
      setTempoRimanente(asta.timebank);
    } catch (error) {
      console.error("Errore durante la selezione del giocatore:", error);
    }
  };

  if (!asta) return <div>Caricamento...</div>;

  return (
    <div className="asta-in-corso-container">
      <h2>Asta in Corso</h2>
      {giocatoreAttuale ? (
        <div className="giocatore-attuale">
          <h3>{giocatoreAttuale.nome}</h3>
          <p>Offerta attuale: {offertaAttuale}</p>
          <p>Tempo rimanente: {tempoRimanente}</p>
          <button onClick={() => faOfferta(offertaAttuale + 1)}>Rilancia</button>
        </div>
      ) : (
        <div className="seleziona-giocatore">
          <h3>Seleziona un giocatore</h3>
          {/* Qui andrebbe una lista o una ricerca di giocatori */}
        </div>
      )}
      <div className="partecipanti">
        {/* Lista dei partecipanti e dei loro crediti rimanenti */}
      </div>
    </div>
  );
};

export default AstaInCorso;