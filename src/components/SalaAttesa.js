import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import '../styles/SalaAttesa.css';

const SalaAttesa = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asta, setAsta] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'aste', id), (doc) => {
      if (doc.exists()) {
        setAsta({ id: doc.id, ...doc.data() });
      }
    });

    return () => unsubscribe();
  }, [id]);

  const handlePartecipa = async () => {
    try {
      await updateDoc(doc(db, 'aste', id), {
        partecipanti: [...asta.partecipanti, auth.currentUser.uid]
      });
    } catch (error) {
      console.error("Errore durante la partecipazione:", error);
    }
  };

  const handleAvviaAsta = async () => {
    try {
      await updateDoc(doc(db, 'aste', id), {
        stato: 'in corso',
        tempoInizio: new Date()
      });
      navigate(`/asta-in-corso/${id}`);
    } catch (error) {
      console.error("Errore durante l'avvio dell'asta:", error);
    }
  };

  if (!asta) return <div>Caricamento...</div>;

  const isCreator = asta.creatorId === auth.currentUser.uid;
  const isFull = asta.partecipanti.length === asta.numeroPartecipanti;

  return (
    <div className="sala-attesa-container">
      <h2>Sala d'Attesa per l'Asta {asta.id}</h2>
      <p>Partecipanti: {asta.partecipanti.length}/{asta.numeroPartecipanti}</p>
      <ul className="partecipanti-list">
        {asta.partecipanti.map((partecipanteId, index) => (
          <li key={index}>{partecipanteId}</li>
        ))}
      </ul>
      {!asta.partecipanti.includes(auth.currentUser.uid) && (
        <button onClick={handlePartecipa}>Partecipa</button>
      )}
      <button 
        onClick={handleAvviaAsta} 
        disabled={!isCreator || !isFull}
      >
        Avvia l'Asta
      </button>
    </div>
  );
};

export default SalaAttesa;