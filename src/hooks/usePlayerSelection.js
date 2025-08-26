import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateAstaAsync, setFilteredGiocatori } from '../state/slices/astaSlice';
import { selectFilteredGiocatori, selectAllGiocatori, selectCurrentReparto } from '../state/selectors/astaSelectors';
import { errorHandler } from '../utils/errorHandler';

export const usePlayerSelection = (astaId) => {
  const dispatch = useDispatch();
  const handleError = errorHandler(dispatch);
  
  const filteredGiocatori = useSelector(selectFilteredGiocatori);
  const allGiocatori = useSelector(selectAllGiocatori);
  const currentReparto = useSelector(selectCurrentReparto);

  const handleSearch = useCallback((value) => {
    const searchTerm = value.toLowerCase();
    const filtered = allGiocatori.filter(giocatore => 
      giocatore.Nome.toLowerCase().includes(searchTerm)
    );
    dispatch(setFilteredGiocatori(filtered));
  }, [allGiocatori, dispatch]);

  const selectPlayer = useCallback(async (player) => {
    try {
      await dispatch(updateAstaAsync({
        id: astaId,
        fase: 'bidding',
        selectedPlayer: player,
        currentBid: player.Qt || 1,
        timer: 15
      }));
    } catch (error) {
      handleError(error);
    }
  }, [astaId, dispatch, handleError]);

  const memoizedValues = useMemo(() => ({
    filteredGiocatori,
    currentReparto,
    handleSearch,
    selectPlayer
  }), [filteredGiocatori, currentReparto, handleSearch, selectPlayer]);

  return memoizedValues;
};