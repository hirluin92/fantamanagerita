import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useSalaAttesa } from '../../hooks/useSalaAttesa';
import SeatingSelection from './SeatingSelection';
import Loading from '../common/Loading';
import '../../styles/SalaAttesa.css';

const SalaAttesa = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [partecipantiNomi, setPartecipantiNomi] = useState({});
  const {
    asta,
    error,
    isLoading,
    isSimulationMode,
    botName,
    setIsSimulationMode,
    setBotName,
    handleStartAsta,
    handleAggiungiBot,
    handlePartecipa
  } = useSalaAttesa(id);

  useEffect(() => {
    if (asta && asta.fase === 'league_draw' && location.pathname !== `/sorteggio-lega/${id}`) {
      navigate(`/sorteggio-lega/${id}`);
    }
  }, [asta, id, navigate, location.pathname]);

  // Gestione nomi partecipanti semplificata - solo quando l'asta cambia
  useEffect(() => {
    if (!asta || !asta.partecipanti) return;
        
    const fetchNomiPartecipanti = async () => {
      const nomiPromises = asta.partecipanti.map(async (p) => {
          if (p && p.id) {
            if (p.isBot) {
              return { [p.id]: p.name || `Bot ${p.id.substr(4, 4)}` };
            } else {
            try {
              const userDocRef = doc(db, 'users', p.id);
              const userDocSnap = await getDoc(userDocRef);
              if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                return { [p.id]: userData.displayName || `${userData.name} ${userData.surname}` || 'Utente sconosciuto' };
              }
            } catch (error) {
              console.warn('Errore nel recupero nome utente:', error);
              return { [p.id]: 'Utente sconosciuto' };
              }
            }
          }
          return { [p?.id || 'unknown']: 'Utente sconosciuto' };
        });

      try {
        const nomiResults = await Promise.all(nomiPromises);
        const nomiObj = Object.assign({}, ...nomiResults);
        setPartecipantiNomi(nomiObj);
      } catch (error) {
        console.warn('Errore nel recupero nomi partecipanti:', error);
      }
    };

    fetchNomiPartecipanti();
  }, [asta?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;
  if (!asta) return <div>Asta non trovata</div>;

  if (asta.fase === 'seating') {
    return <SeatingSelection astaId={id} />;
  }
  
  if (asta.fase === 'countdown') {
    // Reindirizza al countdown se siamo in quella fase
    window.location.href = `/countdown/${id}`;
    return <Loading />;
  }

  const isCreator = asta.creatorId === auth.currentUser?.uid;
  const isFull = asta.partecipanti?.every(p => p && p.id);
  const hasJoined = asta.partecipanti?.some(p => p && p.id === auth.currentUser?.uid);

  return (
    <div className="sala-attesa-container">
      <div className="stars"></div>
      <div className="sala-attesa-content">
        <h2>Sala d'Attesa per l'Asta {asta.id}</h2>
        {error && <div className="error-message">{error}</div>}
        <p>Partecipanti: {asta.partecipanti?.filter(p => p && p.id).length || 0}/{asta.numeroPartecipanti}</p>
        <ul className="partecipanti-list">
          {asta.partecipanti?.map((partecipante, index) => (
            <li key={index}>
              {partecipante && partecipante.id 
                ? `Partecipante ${index + 1}: ${partecipantiNomi[partecipante.id] || (partecipante.isBot ? partecipante.name : 'Caricamento...')}`
                : `Posto ${index + 1}: Libero`}
            </li>
          ))}
        </ul>
        {!hasJoined && (
          <button onClick={handlePartecipa} disabled={isFull}>
            Partecipa
          </button>
        )}
        {isCreator && (
          <>
            <div className="simulation-controls">
              <label>
                <input 
                  type="checkbox" 
                  checked={isSimulationMode} 
                  onChange={(e) => setIsSimulationMode(e.target.checked)} 
                />
                Modalità Simulazione
              </label>
            </div>
            {isSimulationMode && (
              <div className="add-bot-controls">
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="Nome del Bot"
                />
                <button onClick={handleAggiungiBot} disabled={isFull || !botName.trim()}>
                  Aggiungi Bot
                </button>
              </div>
            )}
            {isFull && (
              <button onClick={handleStartAsta}>
                Avvia l'Asta
              </button>
            )}
          </>
        )}
        <p>Stato asta: {asta.stato}</p>
        <p>Fase asta: {asta.fase}</p>
      </div>
    </div>
  );
};

export default SalaAttesa;