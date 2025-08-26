import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { db } from '../../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

export const updateAstaAsync = createAsyncThunk(
  'asta/updateAsta',
  async (updateData, { getState }) => {
    const { asta } = getState();
    const astaRef = doc(db, 'aste', asta.id);

    const serializedData = Object.entries(updateData).reduce((acc, [key, value]) => {
      acc[key] = value instanceof Date ? value.toISOString() : value;
      return acc;
    }, {});

    await updateDoc(astaRef, serializedData);
    return serializedData;
  }
);

const initialState = {
  id: null,
  currentPhase: null,
  participants: [],
  selectedPlayer: null,
  currentBid: 0,
  currentBidder: null,
  timer: 20,
  currentReparto: 'P',
  currentTurnIndex: 0,
  lastSelectorIndex: 0,
  activeParticipants: [],
  partecipantSquadre: [],
  allGiocatori: [],
  filteredGiocatori: [],
  userCredits: 0,
  isLoading: true,
  teams: [],
  users: [],
  tempoInizio: null,
  error: null
};

const astaSlice = createSlice({
  name: 'asta',
  initialState,
  reducers: {
    setAstaId: (state, action) => {
      state.id = action.payload;
    },
    setCurrentPhase: (state, action) => {
      state.currentPhase = action.payload;
    },
    setParticipants: (state, action) => {
      state.participants = action.payload;
    },
    setSelectedPlayer: (state, action) => {
      state.selectedPlayer = action.payload;
    },
    setCurrentBid: (state, action) => {
      state.currentBid = action.payload;
    },
    setCurrentBidder: (state, action) => {
      state.currentBidder = action.payload;
    },
    setTimer: (state, action) => {
      state.timer = action.payload;
    },
    setCurrentReparto: (state, action) => {
      state.currentReparto = action.payload;
    },
    setCurrentTurnIndex: (state, action) => {
      state.currentTurnIndex = action.payload;
    },
    setLastSelectorIndex: (state, action) => {
      state.lastSelectorIndex = action.payload;
    },
    setActiveParticipants: (state, action) => {
      state.activeParticipants = action.payload;
    },
    setPartecipantSquadre: (state, action) => {
      state.partecipantSquadre = action.payload;
    },
    setAllGiocatori: (state, action) => {
      state.allGiocatori = action.payload;
    },
    setFilteredGiocatori: (state, action) => {
      state.filteredGiocatori = action.payload;
    },
    setUserCredits: (state, action) => {
      state.userCredits = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setTeams: (state, action) => {
      state.teams = action.payload;
    },
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateAstaAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateAstaAsync.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
        
        if (typeof state.tempoInizio === 'string') {
          state.tempoInizio = new Date(state.tempoInizio);
        }

        if (action.payload.fase) {
          state.currentPhase = action.payload.fase;
        }

        state.isLoading = false;
      })
      .addCase(updateAstaAsync.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const {
  setAstaId,
  setCurrentPhase,
  setParticipants,
  setSelectedPlayer,
  setCurrentBid,
  setCurrentBidder,
  setTimer,
  setCurrentReparto,
  setCurrentTurnIndex,
  setLastSelectorIndex,
  setActiveParticipants,
  setPartecipantSquadre,
  setAllGiocatori,
  setFilteredGiocatori,
  setUserCredits,
  setIsLoading,
  setTeams,
  setUsers,
  setError,
} = astaSlice.actions;

export default astaSlice.reducer;