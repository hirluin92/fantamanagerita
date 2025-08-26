import { useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectPartecipantSquadre } from '../state/selectors/astaSelectors';

export const useSidebar = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [selectedSquadra, setSelectedSquadra] = useState(null);
  const partecipantSquadre = useSelector(selectPartecipantSquadre);

  const toggleSidebar = useCallback(() => {
    setIsSidebarExpanded(prev => !prev);
  }, []);

  const handleSquadraClick = useCallback((squadra) => {
    setSelectedSquadra(squadra);
    setIsSidebarExpanded(true);
  }, []);

  const getParticipantName = useCallback((squadra) => {
    return squadra.participantName || 'N/A';
  }, []);

  const calculateRemainingCredits = useCallback((squadra) => {
    return squadra.credits || 0;
  }, []);

  const memoizedValues = useMemo(() => ({
    isSidebarExpanded,
    selectedSquadra,
    partecipantSquadre,
    toggleSidebar,
    handleSquadraClick,
    getParticipantName,
    calculateRemainingCredits
  }), [isSidebarExpanded, selectedSquadra, partecipantSquadre, toggleSidebar, handleSquadraClick, getParticipantName, calculateRemainingCredits]);

  return memoizedValues;
};