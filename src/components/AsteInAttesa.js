import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import '../styles/AsteInAttesa.css';

const AsteInAttesa = () => {
  const [asteInAttesa, setAsteInAttesa] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAsteInAttesa = async () => {
      const q = query(collection(db, 'aste'), where('stato', '==', 'in attesa'));
      const querySnapshot = await getDocs(q);
      const aste = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAsteInAttesa(aste);
    };

    fetchAsteInAttesa();
  }, []);

  const handlePartecipa = (id) => {
    navigate(`/sala-attesa/${id}`);
  };

  return (
    <div className="aste-in-attesa-container">
      <h2>Aste in Attesa</h2>
      {asteInAttesa.map(asta => (
        <div key={asta.id} className="asta-card">
          <h3>Asta {asta.id}</h3>
          <p>Partecipanti: {asta.partecipanti.length}/{asta.numeroPartecipanti}</p>
          <button onClick={() => handlePartecipa(asta.id)}>Partecipa</button>
        </div>
      ))}
    </div>
  );
};

export default AsteInAttesa;