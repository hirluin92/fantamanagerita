import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import '../../styles/AuthForms.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Email o password non validi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="stars"></div>
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Accedi</h2>
            <p>Bentornato su Fantacalcio Manager</p>
          </div>
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
              />
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </button>
            {error && <p className="error-message">{error}</p>}
          </form>
          <div className="auth-footer">
            <p>Non hai un account? <a href="/signup">Registrati</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;