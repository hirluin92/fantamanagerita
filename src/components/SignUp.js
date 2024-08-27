import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import '../styles/AuthForms.css';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Le password non corrispondono');
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/create-auction');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Crea un Account</h2>
          <p>Unisciti a Fantacalcio Manager</p>
        </div>
        <form onSubmit={handleSignUp} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="La tua email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Crea una password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Conferma Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Conferma la tua password"
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Registrazione in corso...' : 'Registrati'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
        <div className="auth-footer">
          <p>Hai già un account? <Link to="/login">Accedi</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;