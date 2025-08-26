export const isValidEmail = (email) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(String(email).toLowerCase());
  };
  
  export const isValidPassword = (password) => {
    return password.length >= 8;
  };
  
  export const isValidUsername = (username) => {
    return username.length >= 3 && username.length <= 20;
  };
  
  export const isValidBid = (bid, currentBid, userCredits) => {
    return bid > currentBid && bid <= userCredits;
  };