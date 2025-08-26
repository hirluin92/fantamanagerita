import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useDispatch } from 'react-redux';
import { setAstaId } from '../state/slices/astaSlice';
import { errorHandler } from '../utils/errorHandler';

export const useCreaAsta = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const handleError = useCallback((error) => errorHandler(dispatch)(error), [dispatch]);
    const [opzioniAsta, setOpzioniAsta] = useState({
      crediti: '100',
      baseAsta: 'quotazione',
      timebank: '10',
      chiamata: 'reparto',
      numeroPartecipanti: '8',
      legaId: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [leghe, setLeghe] = useState([]);
  
    useEffect(() => {
      let isMounted = true;
      const fetchLeghe = async () => {
        setIsLoading(true);
        try {
          const legheSnapshot = await getDocs(collection(db, 'leagues'));
          if (isMounted) {
            const legheList = legheSnapshot.docs
              .map(doc => ({
                id: doc.id, 
                nome: doc.data()?.nome || doc.data()?.name || `Lega ${doc.id}`,
              }))
              .filter(Boolean);
            setLeghe(legheList);
          }
        } catch (error) {
          if (isMounted) {
            console.error('Errore nel caricamento delle leghe:', error);
            handleError(error);
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };
  
      fetchLeghe();
  
      return () => {
        isMounted = false;
        // NON settare leghe a [] qui - causa loop infinito!
      };
    }, [handleError]); // Rimossa la dipendenza leghe.length

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setOpzioniAsta(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      setError('Devi essere autenticato per creare un\'asta.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const astaData = {
        ...opzioniAsta,
        creatorId: auth.currentUser.uid,
        stato: 'in attesa',
        partecipanti: Array(parseInt(opzioniAsta.numeroPartecipanti)).fill(null),
        creditiIniziali: parseInt(opzioniAsta.crediti),
        dataCreazione: new Date(),
      };

      const astaRef = await addDoc(collection(db, 'aste'), astaData);
      dispatch(setAstaId(astaRef.id));
      navigate(`/sala-attesa/${astaRef.id}`);
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [opzioniAsta, dispatch, navigate, handleError]);

  return {
    opzioniAsta,
    error,
    isLoading,
    isSubmitting,
    leghe,
    handleChange,
    handleSubmit
  };
};