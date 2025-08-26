// services/astaService.js
import { doc, updateDoc, getDoc, runTransaction, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const updateAsta = async (id, updates) => {
  try {
    await updateDoc(doc(db, 'aste', id), updates);
  } catch (error) {
    console.error("Errore nell'aggiornamento dell'asta:", error);
    throw error;
  }
};

export const getAsta = async (id) => {
  try {
    const astaDoc = await getDoc(doc(db, 'aste', id));
    if (astaDoc.exists()) {
      return { id: astaDoc.id, ...astaDoc.data() };
    } else {
      throw new Error("Asta non trovata");
    }
  } catch (error) {
    console.error("Errore nel recupero dell'asta:", error);
    throw error;
  }
};

export const concludiAstaGiocatore = async (astaId, winner, selectedPlayer, currentBid) => {
  try {
    await runTransaction(db, async (transaction) => {
      const astaRef = doc(db, 'aste', astaId);
      const astaDoc = await transaction.get(astaRef);
      const astaData = astaDoc.data();

      if (!astaData) {
        throw new Error('Dati asta non trovati');
      }

      const roseRef = doc(db, 'rose', winner.id);
      const rosaDoc = await transaction.get(roseRef);
      const rosaData = rosaDoc.data() || {};
      
      const ruolo = selectedPlayer.R;
      const nuovaRosa = {
        ...rosaData,
        [ruolo]: [...(rosaData[ruolo] || []), { ...selectedPlayer, costoAcquisto: currentBid }]
      };

      const winnerUpdatedCredits = winner.crediti - currentBid;
      const nextSelectorIndex = (astaData.lastSelectorIndex + 1) % astaData.partecipanti.length;

      transaction.update(astaRef, {
        fase: 'selecting',
        selectedPlayer: null,
        currentBid: 0,
        currentBidder: null,
        timer: 20,
        partecipanti: astaData.partecipanti.map(p => 
          p.id === winner.id ? { ...p, crediti: winnerUpdatedCredits } : p
        ),
        currentTurnIndex: nextSelectorIndex,
        activeParticipants: astaData.partecipanti.map(p => ({ ...p, isActive: true })),
        lastSelectorIndex: nextSelectorIndex
      });

      transaction.set(roseRef, nuovaRosa, { merge: true });
    });
  } catch (error) {
    console.error('Errore durante la conclusione dell\'asta:', error);
    throw error;
  }
};

export const fetchGiocatori = async (reparto) => {
  try {
    const giocatoriRef = collection(db, 'giocatori');
    const q = query(giocatoriRef, where('R', '==', reparto), orderBy('Qt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Errore nel recupero dei giocatori:", error);
    throw error;
  }
};