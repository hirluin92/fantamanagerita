import { createSelector } from 'reselect';

const selectAsta = state => state.asta;

export const selectAstaState = selectAsta;

export const selectActiveParticipants = createSelector(
  [selectAsta],
  asta => asta.activeParticipants
);

export const selectCurrentBid = createSelector(
  [selectAsta],
  asta => asta.currentBid
);

export const selectUserCredits = createSelector(
  [selectAsta],
  asta => asta.userCredits
);

export const selectParticipants = createSelector(
  [selectAsta],
  asta => asta.participants
);

export const selectFilteredGiocatori = createSelector(
  [selectAsta],
  asta => asta.filteredGiocatori
);

export const selectAllGiocatori = createSelector(
  [selectAsta],
  asta => asta.allGiocatori
);

export const selectCurrentReparto = createSelector(
  [selectAsta],
  asta => asta.currentReparto
);

export const selectPartecipantSquadre = createSelector(
  [selectAsta],
  asta => asta.partecipantSquadre
);