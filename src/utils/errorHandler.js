import { setError } from '../state/slices/astaSlice';

export const errorHandler = (dispatch) => (error) => {
  console.error('Error occurred:', error);
  
  let errorMessage;
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    errorMessage = `Errore del server: ${error.response.status} ${error.response.data.message || ''}`;
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = 'Nessuna risposta dal server. Controlla la tua connessione.';
  } else {
    // Something happened in setting up the request that triggered an Error
    errorMessage = error.message || 'Si è verificato un errore sconosciuto';
  }

  dispatch(setError(errorMessage));
};