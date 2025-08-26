import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import '../../styles/Countdown.css';

const Countdown = () => {
  const { id: astaId } = useParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const audioRef = useRef(null);
  const countdownAudioRef = useRef(null);

  const handleCountdownComplete = async () => {
    try {
      // Aggiorna l'asta per iniziare il sorteggio
      await updateDoc(doc(db, 'aste', astaId), {
        fase: 'draw', // Fase di sorteggio squadre
        tempoInizio: new Date()
      });
      
      // Reindirizza al sorteggio delle squadre
      navigate(`/sorteggio-lega/${astaId}`);
    } catch (error) {
      console.error('Errore durante l\'aggiornamento dell\'asta:', error);
    }
  };

  const startMusic = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setAudioError(null);
      }).catch(error => {
        console.warn('Impossibile riprodurre audio Champions League:', error);
        setAudioError('Impossibile riprodurre audio Champions League');
      });
    }
  };

  useEffect(() => {
    console.log('🎵 Inizializzazione audio countdown...');
    
    // Carica l'audio della Champions League (ma non avviarlo ancora)
    try {
      audioRef.current = new Audio('/audio/uefa_champions.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.7;
      audioRef.current.preload = 'auto';
      
      audioRef.current.addEventListener('canplaythrough', () => {
        console.log('✅ Audio Champions League caricato correttamente');
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.error('❌ Errore caricamento audio Champions League:', e);
        setAudioError('Errore caricamento audio Champions League');
      });
      
    } catch (error) {
      console.warn('Impossibile caricare audio Champions League:', error);
      setAudioError('Impossibile caricare audio Champions League');
    }

    // Carica l'audio del countdown
    try {
      countdownAudioRef.current = new Audio('/audio/start_countdown.mp3');
      countdownAudioRef.current.volume = 0.8;
      countdownAudioRef.current.preload = 'auto';
      
      countdownAudioRef.current.addEventListener('canplaythrough', () => {
        console.log('✅ Audio countdown caricato correttamente');
      });
      
      countdownAudioRef.current.addEventListener('error', (e) => {
        console.error('❌ Errore caricamento audio countdown:', e);
        setAudioError('Errore caricamento audio countdown');
      });
      
    } catch (error) {
      console.warn('Impossibile caricare audio countdown:', error);
      setAudioError('Impossibile caricare audio countdown');
    }

    // Avvia il countdown automaticamente dopo un breve delay
    const startTimer = setTimeout(() => {
      console.log('🔔 Avvio countdown audio...');
      
      // Avvia l'audio del countdown
      if (countdownAudioRef.current) {
        countdownAudioRef.current.play().then(() => {
          console.log('✅ Countdown audio avviato con successo');
        }).catch(error => {
          console.warn('❌ Impossibile riprodurre audio countdown:', error);
          setAudioError('Impossibile riprodurre audio countdown: ' + error.message);
        });
      } else {
        console.log('❌ Countdown audio non disponibile');
      }
      
      // Avvia il countdown con timing sincronizzato
      const startTime = Date.now();
      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const currentSecond = Math.floor(elapsed / 1000);
        const remaining = 10 - currentSecond;
        
        if (remaining <= 0) {
          clearInterval(timer);
          console.log('🔔 Countdown completato, avvio musica Champions...');
          
          // Ferma l'audio del countdown
          if (countdownAudioRef.current) {
            countdownAudioRef.current.pause();
            countdownAudioRef.current.currentTime = 0;
          }
          
          // Avvia la musica Champions League SOLO quando il countdown finisce
          setTimeout(() => {
            startMusic();
          }, 500); // Piccolo delay per transizione
          
          // Aggiorna la fase dell'asta e reindirizza
          handleCountdownComplete();
          setCountdown(0);
        } else {
          setCountdown(remaining);
        }
      }, 100); // Controllo più frequente per sincronizzazione migliore

      return () => clearInterval(timer);
    }, 1000); // Delay di 1 secondo per permettere il caricamento

    return () => {
      clearTimeout(startTimer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (countdownAudioRef.current) {
        countdownAudioRef.current.pause();
        countdownAudioRef.current.currentTime = 0;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="countdown-container">
      <div className="countdown-stars"></div>
      <div className="countdown-content">
        <div className="countdown-logo">
          <div className="champions-logo">🏆</div>
          <h1 className="countdown-title">CHAMPIONS LEAGUE</h1>
        </div>
        
        {audioError && (
          <div className="countdown-audio-error">
            ⚠️ {audioError}
          </div>
        )}
        
        <div className="countdown-display">
          <div className="countdown-number">{countdown}</div>
          <div className="countdown-text">
            {countdown > 0 ? 'L\'ASTA INIZIA TRA' : 'VIA!'}
          </div>
        </div>
        
        <div className="countdown-music-info">
          {countdown > 0 ? (
            <div className="music-loading">
              🔔 Countdown in corso...
            </div>
          ) : (
            <div className="music-playing">
              🎵 Musica Champions League in riproduzione
            </div>
          )}
        </div>
        
        <div className="countdown-progress">
          <div 
            className="countdown-progress-bar"
            style={{ width: `${((10 - countdown) / 10) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Countdown; 