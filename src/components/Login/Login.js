// src/components/Login/Login.js - Navigation düzeltmesi
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('testing');
  const navigate = useNavigate();

  // Backend bağlantısını test et
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/status');
        if (response.ok) {
          setBackendStatus('connected');
          console.log('✅ Backend bağlantısı başarılı');
        } else {
          setBackendStatus('disconnected');
        }
      } catch (error) {
        console.log('❌ Backend bağlantı hatası:', error);
        setBackendStatus('disconnected');
      }
    };
    
    checkBackend();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Error'u temizle
    if (error) setError('');
  };

  const handleLogin = async (username, password) => {
    setLoading(true);
    setError('');

    try {
      console.log('🔑 Giriş deneniyor:', { username, password });
      
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      const result = await response.json();
      console.log('🔑 Login sonucu:', result);

      if (result.success && result.user) {
        // ⭐ localStorage'a kaydet
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('isLoggedIn', 'true');
        
        console.log('✅ Giriş başarılı:', result.user);
        console.log('📱 localStorage güncellendi');
        
        // ⭐ Sayfayı yenile (en emin yol)
        setTimeout(() => {
          console.log('🔄 Sayfa yenileniyor...');
          window.location.href = '/'; // navigate yerine window.location kullan
        }, 100);
        
      } else {
        setError(result.message || 'Giriş başarısız');
        console.log('❌ Giriş başarısız:', result.message);
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Sunucuya bağlanılamıyor. Backend çalışıyor mu?');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleLogin(formData.username, formData.password);
  };

  const handleRegister = async () => {
    if (!formData.username || !formData.password) {
      setError('Kullanıcı adı ve şifre giriniz');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('📝 Kayıt deneniyor:', formData);
      
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const result = await response.json();
      console.log('📝 Register sonucu:', result);

      if (result.success) {
        console.log('✅ Kayıt başarılı:', result);
        // Kayıt başarılıysa otomatik giriş yap
        await handleLogin(formData.username, formData.password);
      } else {
        setError(result.message || 'Kayıt başarısız');
      }
    } catch (err) {
      console.error('❌ Register error:', err);
      setError('Sunucuya bağlanılamıyor. Backend çalışıyor mu?');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (username, password) => {
    setFormData({ username, password });
    // Kısa bir gecikme ile login yap
    setTimeout(async () => {
      await handleLogin(username, password);
    }, 100);
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h2>DOSTemlak'a Hoş Geldiniz</h2>
        
        {/* Backend durumu */}
        <div className={`${styles.backendStatus} ${styles[backendStatus]}`}>
          {backendStatus === 'testing' && '🔄 Backend bağlantısı kontrol ediliyor...'}
          {backendStatus === 'connected' && '✅ Backend bağlantısı başarılı'}
          {backendStatus === 'disconnected' && '❌ Backend bağlantısı başarısız'}
        </div>
        
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>
          
          <div className={styles.buttonGroup}>
            <button 
              type="submit" 
              disabled={loading || backendStatus === 'disconnected'}
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
            
            <button 
              type="button" 
              onClick={handleRegister}
              disabled={loading || backendStatus === 'disconnected'}
              className={styles.registerBtn}
            >
              {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
            </button>
          </div>
        </form>
        
        {/* Hızlı test butonları */}
        <div className={styles.testInfo}>
          <p><strong>Test Hesapları:</strong></p>
          <div className={styles.quickLogin}>
            <button 
              type="button" 
              onClick={() => handleQuickLogin('admin', '123')}
              disabled={loading || backendStatus === 'disconnected'}
              className={styles.quickBtn}
            >
              Admin (123)
            </button>
            <button 
              type="button" 
              onClick={() => handleQuickLogin('test', '456')}
              disabled={loading || backendStatus === 'disconnected'}
              className={styles.quickBtn}
            >
              Test (456)
            </button>
            <button 
              type="button" 
              onClick={() => handleQuickLogin('demo', '789')}
              disabled={loading || backendStatus === 'disconnected'}
              className={styles.quickBtn}
            >
              Demo (789)
            </button>
          </div>
          <p>Veya herhangi bir kullanıcı adı/şifre ile kayıt olabilirsiniz.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;