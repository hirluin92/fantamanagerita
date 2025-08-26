import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, getDoc, runTransaction } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useDispatch } from 'react-redux';
import { setAstaId, setParticipants, setCurrentPhase } from '../state/slices/astaSlice';
import { errorHandler } from '../utils/errorHandler';

export const useSalaAttesa = (astaId) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleError = useCallback((error) => errorHandler(dispatch)(error), [dispatch]);
  const [asta, setAsta] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [partecipantiNomi, setPartecipantiNomi] = useState({});
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [botName, setBotName] = useState('');

  useEffect(() => {
    if (!astaId) return;

    const unsubscribe = onSnapshot(doc(db, 'aste', astaId), async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const astaData = { id: docSnapshot.id, ...docSnapshot.data() };
        setAsta(astaData);
        dispatch(setAstaId(astaData.id));
        dispatch(setParticipants(astaData.partecipanti || []));
        dispatch(setCurrentPhase(astaData.fase || 'waiting'));

        // Gestione nomi partecipanti ottimizzata
        if (astaData.partecipanti && astaData.partecipanti.length > 0) {
          const nomiPromises = astaData.partecipanti.map(async (p) => {
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
            setPartecipantiNomi(nomiObj); // Sostituisce invece di aggiungere
          } catch (error) {
            console.warn('Errore nel recupero nomi partecipanti:', error);
          }
        }

        setIsLoading(false);

        if (astaData.stato === 'in corso' && astaData.fase !== 'seating') {
          navigate(`/asta-in-corso/${astaId}`);
        }
      } else {
        setError("Asta non trovata");
        setIsLoading(false);
      }
    }, (error) => {
      console.error('Errore listener asta:', error);
      handleError(error);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
      // Cleanup aggiuntivo per sicurezza
      setAsta(null);
      setError(null);
      setIsLoading(true);
    };
  }, [astaId, navigate, dispatch, handleError]); // Rimossa dipendenza partecipantiNomi per evitare loop infinito

  const handleStartAsta = useCallback(async () => {
    try {
      // Prima aggiorna l'asta per iniziare il countdown
      await updateDoc(doc(db, 'aste', astaId), {
        stato: 'in corso',
        fase: 'countdown', // Fase di countdown
        tempoInizio: new Date(),
        isSimulationMode: isSimulationMode
      });
      
      // Poi reindirizza al countdown con musica Champions
      navigate(`/countdown/${astaId}`);
    } catch (error) {
      handleError(error);
    }
  }, [astaId, isSimulationMode, handleError, navigate]);

  const handleAggiungiBot = useCallback(async () => {
    if (!asta) return;
    setError(null);

    if (!botName.trim()) {
      setError("Inserisci un nome per il bot");
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        const astaRef = doc(db, 'aste', astaId);
        const astaSnap = await transaction.get(astaRef);
        
        if (!astaSnap.exists()) {
          throw new Error("Asta non trovata");
        }

        const astaData = astaSnap.data();
        const partecipanti = astaData.partecipanti || [];
        const emptySlotIndex = partecipanti.findIndex(p => !p || !p.id);

        if (emptySlotIndex === -1) {
          throw new Error("Asta piena");
        }

        const botId = `bot_${Date.now()}`;
        const updatedPartecipanti = [...partecipanti];
        updatedPartecipanti[emptySlotIndex] = {
          id: botId,
          crediti: astaData.creditiIniziali,
          isBot: true,
          name: botName.trim()
        };

        transaction.update(astaRef, {
          partecipanti: updatedPartecipanti,
        });
      });

      setBotName('');
    } catch (error) {
      handleError(error);
    }
  }, [astaId, asta, botName, handleError]);

  const handlePartecipa = useCallback(async () => {
    setError(null);

    try {
      await runTransaction(db, async (transaction) => {
        const astaRef = doc(db, 'aste', astaId);
        const astaSnap = await transaction.get(astaRef);
        
        if (!astaSnap.exists()) {
          throw new Error("Asta non trovata");
        }

        const astaData = astaSnap.data();
        if (astaData.stato === 'in corso') {
          throw new Error("L'asta è già iniziata");
        }

        const partecipanti = astaData.partecipanti || [];
        const emptySlotIndex = partecipanti.findIndex(p => !p || !p.id);

        if (emptySlotIndex === -1) {
          throw new Error("Asta piena");
        }

        const updatedPartecipanti = [...partecipanti];
        updatedPartecipanti[emptySlotIndex] = {
          id: auth.currentUser.uid,
          crediti: astaData.creditiIniziali
        };

        transaction.update(astaRef, {
          partecipanti: updatedPartecipanti,
        });
      });
    } catch (error) {
      handleError(error);
    }
  }, [astaId, handleError]);

  return {
    asta,
    error,
    isLoading,
    partecipantiNomi,
    isSimulationMode,
    botName,
    setIsSimulationMode,
    setBotName,
    handleStartAsta,
    handleAggiungiBot,
    handlePartecipa
  };
};