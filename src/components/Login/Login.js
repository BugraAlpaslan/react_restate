// src/components/Login/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Giriş deneniyor:', formData);
      
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      console.log('Login response status:', response.status);
      
      const result = await response.json();
      console.log('Login result:', result);

      if (result.success) {
        // Kullanıcı bilgilerini localStorage'a kaydet
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('isLoggedIn', 'true');
        
        console.log('Giriş başarılı, kullanıcı:', result.user);
        navigate('/'); // Ana sayfaya yönlendir
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Giriş yapılırken hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!formData.username || !formData.password) {
      setError('Kullanıcı adı ve şifre giriniz');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Kayıt deneniyor:', formData);
      
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      const result = await response.json();
      console.log('Register result:', result);

      if (result.success) {
        alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        // Otomatik giriş yap
        handleSubmit(new Event('submit'));
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Kayıt olurken hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h2>DOSTemlak'a Hoş Geldiniz</h2>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Kullanıcı Adı</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Kullanıcı adınızı giriniz"
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Şifre</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Şifrenizi giriniz"
              required
            />
          </div>
          
          <div className={styles.buttonGroup}>
            <button type="submit" disabled={loading}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
            
            <button 
              type="button" 
              onClick={handleRegister}
              disabled={loading}
              className={styles.registerBtn}
            >
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </button>
          </div>
        </form>
        
        <div className={styles.testInfo}>
          <p><strong>Test için:</strong></p>
          <p>Herhangi bir kullanıcı adı ve şifre girebilirsiniz.</p>
          <p>Kayıt ol butonuyla otomatik hesap oluşturulur.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;