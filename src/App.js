// src/App.js - Basit login check ile
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar/Sidebar";
import Header from "./components/Header/Header";
import ListingCarousel from "./components/ListingCarousel/ListingCarousel";
import AddListing from "./components/AddListing/AddListing";
import ListingDetail from "./components/ListingDetail/ListingDetail";
import Login from "./components/Login/Login";
import styles from "./App.module.css";

// Ana sayfa komponenti
const HomePage = () => (
  <div className={styles.main}>
    <Sidebar />
    <div className={styles.content}>
      <ListingCarousel />
    </div>
  </div>
);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kullanıcı giriş yapmış mı kontrol et
    const loggedIn = localStorage.getItem('isLoggedIn');
    const user = localStorage.getItem('user');
    
    if (loggedIn === 'true' && user) {
      setIsLoggedIn(true);
      console.log('Kullanıcı zaten giriş yapmış:', JSON.parse(user));
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0f0f0f',
        color: '#c9a96e'
      }}>
        <div>Yükleniyor...</div>
      </div>
    );
  }

  // Giriş yapılmamışsa login sayfasını göster
  if (!isLoggedIn) {
    return (
      <Router>
        <Login />
      </Router>
    );
  }

  // Giriş yapılmışsa ana uygulamayı göster
  return (
    <Router>
      <div className={styles.app}>
        <Routes>
          {/* Ana sayfa */}
          <Route path="/" element={
            <>
              <Header />
              <HomePage />
            </>
          } />
          
          {/* İlan ekleme sayfası */}
          <Route path="/add-listing" element={<AddListing />} />
          
          {/* İlan detay sayfası */}
          <Route path="/listing/:id" element={<ListingDetail />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;