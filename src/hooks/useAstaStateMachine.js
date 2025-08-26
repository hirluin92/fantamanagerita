import { useMachine } from '@xstate/react';
import { createMachine } from 'xstate';
import { ASTA_FASI } from '../utils/constants';

const astaStateMachine = createMachine({
  id: 'asta',
  initial: 'idle',
  states: {
    idle: {
      on: { FETCH_SUCCESS: ASTA_FASI.SELECTING, FETCH_ERROR: 'error' }
    },
    [ASTA_FASI.SELECTING]: {
      on: { SELECT_PLAYER: ASTA_FASI.BIDDING, CONCLUDE_REPARTO: ASTA_FASI.SELECTING }
    },
    [ASTA_FASI.BIDDING]: {
      on: { 
        PLACE_BID: ASTA_FASI.BIDDING,
        PASS_TURN: ASTA_FASI.BIDDING,
        CONCLUDE_PLAYER: ASTA_FASI.SELECTING,
        CONCLUDE_REPARTO: ASTA_FASI.SELECTING
      }
    },
    error: {
      on: { RETRY: 'idle' }
    }
  }
});

export const useAstaStateMachine = () => {
  const [state, send] = useMachine(astaStateMachine);
  return { state, send };
};