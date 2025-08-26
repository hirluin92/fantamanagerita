import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { updateAstaAsync } from '../state/slices/astaSlice';
import { db } from '../firebaseConfig';
import { doc, collection, getDocs, getDoc, query, where } from 'firebase/firestore';

export const useLeagueDraw = (astaId) => {
  const dispatch = useDispatch();
  
  const [availableParticipants, setAvailableParticipants] = useState([]);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [currentParticipant, setCurrentParticipant] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [results, setResults] = useState([]);
  const [drawStage, setDrawStage] = useState('initial');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayedNames, setDisplayedNames] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [hasStartedMusic, setHasStartedMusic] = useState(false);
  
  const animationRef = useRef(null);
  const astaDataRef = useRef(null);
  const championsAudioRef = useRef(null);

  // Inizializza l'audio della Champions League
  useEffect(() => {
    try {
      console.log('🎵 Inizializzazione audio Champions League...');
      championsAudioRef.current = new Audio('/audio/uefa_champions.mp3');
      championsAudioRef.current.loop = true;
      championsAudioRef.current.volume = 0.7;
      championsAudioRef.current.preload = 'auto';
      
      // Test di caricamento audio
      championsAudioRef.current.addEventListener('canplaythrough', () => {
        console.log('✅ Audio Champions League caricato correttamente');
      });
      
      championsAudioRef.current.addEventListener('error', (e) => {
        console.error('❌ Errore caricamento audio Champions League:', e);
        setAudioError('Errore caricamento audio Champions League');
      });
      
    } catch (error) {
      console.warn('Impossibile caricare l\'audio Champions League:', error);
      setAudioError('Impossibile caricare l\'audio Champions League');
    }

    return () => {
      if (championsAudioRef.current) {
        championsAudioRef.current.pause();
        championsAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  const fetchTeams = useCallback(async (legaId) => {
    try {
      const societiesRef = collection(db, 'societies');
      const q = query(societiesRef, where("leagueId", "==", legaId));
      const societiesSnapshot = await getDocs(q);
      
      if (societiesSnapshot.empty) {
        setError("Nessuna squadra trovata per questa lega");
        setAvailableTeams([]);
        return;
      }
      
      const teamsData = societiesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(team => team.name && team.logo);
      
      if (teamsData.length === 0) {
        setError("Nessuna squadra valida trovata per questa lega");
      } else {
        setAvailableTeams(teamsData);
      }
    } catch (error) {
      console.error("Errore nel caricamento delle squadre:", error);
      setError("Errore nel caricamento delle squadre: " + error.message);
    }
  }, []);

  const loadAstaData = useCallback(async () => {
    try {
      setIsLoading(true);
      const astaRef = doc(db, 'aste', astaId);
      const astaSnap = await getDoc(astaRef);
      
      if (astaSnap.exists()) {
        const astaData = astaSnap.data();
        astaDataRef.current = astaData;
        
        if (astaData.legaId) {
          await fetchTeams(astaData.legaId);
          
          const participants = astaData.partecipanti || [];
          const availableParticipantsWithDetails = participants
            .filter(p => p !== null && p.id)
            .map(p => ({
              id: p.id,
              displayName: p.displayName || p.name || `Partecipante ${p.id}`,
              name: p.name || p.displayName || `Partecipante ${p.id}`,
              isBot: p.isBot || false
            }));
          setAvailableParticipants(availableParticipantsWithDetails);
          
          // Avvia la musica Champions League quando si atterra sulla pagina
          if (!hasStartedMusic && championsAudioRef.current) {
            console.log('🎵 Avvio musica Champions League al caricamento pagina...');
            setHasStartedMusic(true);
            setIsMusicPlaying(true);
            
            championsAudioRef.current.play().then(() => {
              console.log('✅ Musica Champions League avviata con successo al caricamento');
            }).catch(error => {
              console.warn('❌ Impossibile riprodurre l\'audio Champions League al caricamento:', error);
              setAudioError('Impossibile riprodurre l\'audio Champions League al caricamento: ' + error.message);
              setIsMusicPlaying(false);
            });
          }
        } else {
          setError("Dati della lega non trovati nell'asta");
        }
      } else {
        setError("Asta non trovata");
      }
    } catch (error) {
      console.error("Errore nel caricamento dell'asta:", error);
      setError("Errore nel caricamento dell'asta: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [astaId, fetchTeams, hasStartedMusic]);

  useEffect(() => {
    if (!astaId) return;
    loadAstaData();
  }, [astaId, loadAstaData]);

  const handleDrawAnimation = useCallback(() => {
    const shuffledParticipants = [...availableParticipants].sort(() => Math.random() - 0.5);
    const selectedParticipant = shuffledParticipants[0];
    let currentIndex = 0;
    let isRunning = true;
    
    console.log('🎰 Inizio animazione slot machine con', shuffledParticipants.length, 'partecipanti');

    // Mostra subito il primo nome per evitare stati vuoti
    const initialName = shuffledParticipants[0].displayName || shuffledParticipants[0].name;
    setDisplayedNames([initialName]);
    console.log('🚀 Primo nome mostrato:', initialName);

    const animate = () => {
      if (!isRunning) return;
      
      // Mostra il nome corrente
      const currentName = shuffledParticipants[currentIndex].displayName || shuffledParticipants[currentIndex].name;
      setDisplayedNames([currentName]);
      console.log('🔄 Mostro nome:', currentName, 'indice:', currentIndex);
      
      // Passa al nome successivo
      currentIndex = (currentIndex + 1) % shuffledParticipants.length;
      
      // Calcola la velocità che aumenta gradualmente
      const baseSpeed = 100; // Velocità iniziale più veloce
      const maxSpeed = 600; // Velocità massima ridotta
      const speed = baseSpeed + (maxSpeed - baseSpeed) * (currentIndex / shuffledParticipants.length);
      
      // Continua l'animazione
      if (isRunning) {
        animationRef.current = setTimeout(animate, speed);
      }
    };

    // Avvia l'animazione dopo un breve delay per mostrare il primo nome
    setTimeout(() => {
      setIsAnimating(true);
      animate();
    }, 500);
    
    // Dopo 6 secondi, ferma l'animazione e mostra il risultato finale
    setTimeout(() => {
      isRunning = false;
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
      
      console.log('🎯 Animazione finita, risultato finale:', selectedParticipant.displayName || selectedParticipant.name);
      
      // Mostra il nome finale
      setDisplayedNames([selectedParticipant.displayName || selectedParticipant.name]);
      setCurrentParticipant(selectedParticipant);
      setIsAnimating(false);
      setIsAnimationComplete(true);
      
      // Aspetta un po' prima di passare alla selezione squadra
      setTimeout(() => setDrawStage('selecting'), 2000); // Ridotto a 2 secondi
      
      console.log('🎵 Animazione finita, musica Champions League continua...');
    }, 6500); // Aumentato a 6.5 secondi per compensare il delay iniziale
    
    // Cleanup function
    return () => {
      isRunning = false;
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [availableParticipants]);

  const startDraw = useCallback(() => {
    if (availableParticipants.length === 1) {
      // Ultimo partecipante rimasto, va direttamente alla selezione squadra
      console.log('🎯 Ultimo partecipante rimasto:', availableParticipants[0].displayName || availableParticipants[0].name);
      setCurrentParticipant(availableParticipants[0]);
      setDrawStage('selecting');
    } else if (availableParticipants.length > 1) {
      setDrawStage('drawing');
      setIsAnimationComplete(false); // Reset del flag per la nuova animazione
      
      console.log('🎲 Avvio estrazione partecipante...');
      
      // NON avviare la musica Champions League qui - è già in riproduzione dalla pagina
      if (isMusicPlaying) {
        console.log('ℹ️ Musica Champions League già in riproduzione, continuo...');
      } else {
        console.log('⚠️ Musica Champions League non in riproduzione');
      }
      
      handleDrawAnimation();
    }
  }, [availableParticipants, handleDrawAnimation, isMusicPlaying]);

  const handleTeamSelect = useCallback((team) => {
    setSelectedTeam(team);
  }, []);

  const confirmSelection = useCallback(() => {
    if (currentParticipant && selectedTeam) {
      console.log("Conferma selezione:", { user: currentParticipant, team: selectedTeam });
      setResults((prev) => {
        const newResults = [...prev, { 
          user: currentParticipant, 
          team: selectedTeam,
          participantName: currentParticipant.displayName || currentParticipant.name,
          teamName: selectedTeam.name
        }];
        console.log("Risultati aggiornati:", newResults);
        return newResults;
      });
      
      // Aggiorna i partecipanti e le squadre disponibili
      setAvailableParticipants((prev) => {
        const newParticipants = prev.filter((user) => user.id !== currentParticipant.id);
        // Controlla se è l'ultimo partecipante
        if (newParticipants.length === 0) {
          // Tutti hanno scelto, passa alla fase successiva
          setDrawStage('completed');
        } else if (newParticipants.length === 1) {
          // Rimane solo un partecipante, lascialo scegliere
          setDrawStage('initial');
        } else {
          // Ci sono ancora più partecipanti
          setDrawStage('initial');
        }
        return newParticipants;
      });
      
      setAvailableTeams((prev) => prev.filter((team) => team.id !== selectedTeam.id));
      setCurrentParticipant(null);
      setSelectedTeam(null);
    }
  }, [currentParticipant, selectedTeam]);

  const proceedToNextPhase = useCallback(async () => {
    try {
      // Ferma la musica se è ancora in riproduzione
      if (championsAudioRef.current && isMusicPlaying) {
        championsAudioRef.current.pause();
        championsAudioRef.current.currentTime = 0;
        setIsMusicPlaying(false);
        setHasStartedMusic(false); // Reset del flag per la prossima volta
      }

      const drawResults = results.map(result => ({
        squadraId: result.team.id,
        squadraName: result.team.name,
        squadraLogo: result.team.logo,
        participantName: result.participantName,
        participantId: result.user.id
      }));

      console.log("Draw results prima di onComplete:", drawResults);
      
      // Aggiorna l'asta con i risultati del sorteggio
      await dispatch(updateAstaAsync({
        id: astaId,
        fase: 'order-selection',
        drawResults: drawResults
      }));

      // Reindirizza alla selezione dell'ordine
      window.location.href = `/order-selection/${astaId}`;
    } catch (error) {
      console.error('Errore durante il passaggio alla fase successiva:', error);
      setError('Errore durante il passaggio alla fase successiva: ' + error.message);
    }
  }, [results, dispatch, astaId, isMusicPlaying]);

  const getUserDisplayName = useCallback((userId) => {
    const participant = availableParticipants.find(p => p.id === userId);
    return participant?.displayName || participant?.name || 'Utente sconosciuto';
  }, [availableParticipants]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
      if (championsAudioRef.current && isMusicPlaying) {
        championsAudioRef.current.pause();
        championsAudioRef.current.currentTime = 0;
        setIsMusicPlaying(false);
      }
    };
  }, [isMusicPlaying]);

  return {
    availableTeams,
    availableParticipants,
    selectedTeam,
    results,
    isLoading,
    error,
    audioError,
    currentParticipant,
    drawStage,
    displayedNames,
    isAnimating,
    isAnimationComplete,
    startDraw,
    handleTeamSelect,
    confirmSelection,
    proceedToNextPhase,
    getUserDisplayName
  };
};