// src/App.js - Import hatası düzeltilmiş
import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar/Sidebar";
import Header from "./components/Header/Header";
import ListingCarousel from "./components/ListingCarousel/ListingCarousel";
import AddListing from "./components/AddListing/AddListing";
import ListingDetail from "./components/ListingDetail/ListingDetail";
import MyFavorites from "./components/MyFavorites/MyFavorites"; // ⭐ Bu import'ta sorun var
import MyListings from "./components/MyListings/MyListings";
import Login from "./components/Login/Login";
import styles from "./App.module.css";

// ⭐ Güncellenmiş Ana sayfa komponenti - Header'dan arama desteği
const HomePage = () => {
  const [filteredListings, setFilteredListings] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [loading, setLoading] = useState(false);

  // ⭐ Filter değişikliklerini handle et
  const handleFiltersChange = useCallback(async (filters) => {
    try {
      setLoading(true);
      console.log('🔍 HomePage: Filtreler uygulanıyor', filters);
      
      // ⭐ Backend'de filter endpoint'i yoksa basit filtreleme
      const response = await fetch('http://localhost:8080/api/listings');
      const data = await response.json();
      
      if (data.success) {
        // Client-side filtreleme (backend endpoint yoksa)
        let filtered = data.data;
        
        if (filters.searchTerm) {
          filtered = filtered.filter(listing => 
            (listing.ismi || listing.title || '').toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            (listing.aciklama || listing.description || '').toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
            (listing.city || '').toLowerCase().includes(filters.searchTerm.toLowerCase())
          );
        }
        
        if (filters.minPrice) {
          filtered = filtered.filter(listing => (listing.fiyat || listing.price) >= parseInt(filters.minPrice));
        }
        
        if (filters.maxPrice) {
          filtered = filtered.filter(listing => (listing.fiyat || listing.price) <= parseInt(filters.maxPrice));
        }
        
        if (filters.city) {
          filtered = filtered.filter(listing => 
            (listing.city || '').toLowerCase().includes(filters.city.toLowerCase())
          );
        }
        
        if (filters.bedrooms) {
          filtered = filtered.filter(listing => 
            (listing.odaSayisi || listing.bedrooms) >= parseInt(filters.bedrooms)
          );
        }
        
        setFilteredListings(filtered);
        setIsFiltered(true);
        
        console.log(`✅ Filtreleme başarılı: ${filtered.length}/${data.data.length} ilan`);
      } else {
        console.error('❌ Filtreleme hatası:', data.message);
      }
    } catch (error) {
      console.error('❌ Filter API hatası:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ⭐ Arama işlemini handle et (Header'dan gelecek)
  const handleSearch = useCallback(async (searchTerm) => {
    try {
      setLoading(true);
      console.log('🔍 HomePage: Arama yapılıyor', searchTerm);
      
      const response = await fetch('http://localhost:8080/api/listings');
      const data = await response.json();
      
      if (data.success) {
        if (searchTerm.trim()) {
          const filtered = data.data.filter(listing => 
            (listing.ismi || listing.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (listing.aciklama || listing.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (listing.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (listing.district || '').toLowerCase().includes(searchTerm.toLowerCase())
          );
          
          setFilteredListings(filtered);
          setIsFiltered(true);
          console.log(`✅ Arama tamamlandı: ${filtered.length} ilan bulundu`);
        } else {
          setFilteredListings([]);
          setIsFiltered(false);
          console.log('🔍 Arama temizlendi, tüm ilanlar gösteriliyor');
        }
      } else {
        console.error('❌ Arama hatası:', data.message);
      }
    } catch (error) {
      console.error('❌ Search API hatası:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className={styles.main} style={{ 
      display: 'flex', 
      flex: 1, 
      height: 'calc(100vh - 120px)' 
    }}>
      <Sidebar 
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
      />
      <div className={styles.content} style={{ 
        flex: 1, 
        padding: '40px', 
        overflowY: 'auto',
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%)',
        backdropFilter: 'blur(30px) saturate(150%)',
        borderLeft: '1px solid rgba(201, 169, 110, 0.08)',
        position: 'relative'
      }}>
        <ListingCarousel 
          customListings={isFiltered ? filteredListings : null}
          loading={loading}
          isFiltered={isFiltered}
        />
      </div>
    </div>
  );
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ⭐ Login durumunu kontrol et
  const checkLoginStatus = () => {
    try {
      const loggedIn = localStorage.getItem('isLoggedIn');
      const userData = localStorage.getItem('user');
      
      console.log('🔍 Login durumu kontrol ediliyor...');
      console.log('📱 localStorage isLoggedIn:', loggedIn);
      console.log('📱 localStorage user:', userData);
      
      if (loggedIn === 'true' && userData) {
        const parsedUser = JSON.parse(userData);
        setIsLoggedIn(true);
        setUser(parsedUser);
        console.log('✅ Kullanıcı zaten giriş yapmış:', parsedUser);
        return true;
      } else {
        setIsLoggedIn(false);
        setUser(null);
        console.log('❌ Kullanıcı giriş yapmamış');
        return false;
      }
    } catch (error) {
      console.error('❌ Login durumu kontrol hatası:', error);
      setIsLoggedIn(false);
      setUser(null);
      return false;
    }
  };

  // ⭐ Component mount'ta ve localStorage değişikliklerinde kontrol et
  useEffect(() => {
    console.log('🚀 App component yüklendi');
    
    checkLoginStatus();
    setLoading(false);

    // ⭐ localStorage değişikliklerini dinle
    const handleStorageChange = (e) => {
      if (e.key === 'isLoggedIn' || e.key === 'user') {
        console.log('📱 localStorage değişti, login durumu güncelleniyor...');
        checkLoginStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // ⭐ Sayfa focus'ta da kontrol et (tab değişimlerinde)
    const handleFocus = () => {
      console.log('👁️ Sayfa focus aldı, login durumu kontrol ediliyor...');
      checkLoginStatus();
    };

    window.addEventListener('focus', handleFocus);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // ⭐ Manual refresh function (Header'dan çağırılabilir)
  const refreshLoginStatus = () => {
    console.log('🔄 Manual login durumu yenileniyor...');
    checkLoginStatus();
  };

  // ⭐ Header arama handler'ı - sadece ana sayfada çalışacak
  const handleHeaderSearch = useCallback(async (searchTerm) => {
    console.log("🔍 Header'dan arama:", searchTerm);
    // Bu fonksiyon sadece HomePage'de aktif olacak
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0f0f0f',
        color: '#c9a96e',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ fontSize: '2rem' }}>🏠</div>
        <div>DOSTemlak yükleniyor...</div>
      </div>
    );
  }

  // ⭐ Giriş yapılmamışsa login sayfasını göster
  if (!isLoggedIn) {
    console.log('🔐 Login sayfası gösteriliyor');
    return (
      <Router>
        <Login />
      </Router>
    );
  }

  // ⭐ Giriş yapılmışsa ana uygulamayı göster
  console.log('🏠 Ana uygulama gösteriliyor, kullanıcı:', user?.username);
  
  return (
    <Router>
      <div className={styles.app}>
        <Routes>
          {/* Ana sayfa */}
          <Route path="/" element={
            <>
              <Header 
                user={user} 
                onLogout={refreshLoginStatus}
                onSearch={handleHeaderSearch}
              />
              <HomePage />
            </>
          } />
          
          {/* İlan ekleme sayfası */}
          <Route path="/add-listing" element={
            <>
              <Header 
                user={user} 
                onLogout={refreshLoginStatus}
                onSearch={handleHeaderSearch}
              />
              <AddListing />
            </>
          } />
          
          {/* İlan detay sayfası */}
          <Route path="/listing/:id" element={
            <>
              <Header 
                user={user} 
                onLogout={refreshLoginStatus}
                onSearch={handleHeaderSearch}
              />
              <ListingDetail />
            </>
          } />
          
          {/* ⭐ Favori ilanlar sayfası */}
          <Route path="/my-favorites" element={
            <>
              <Header 
                user={user} 
                onLogout={refreshLoginStatus}
                onSearch={handleHeaderSearch}
              />
              <MyFavorites />
            </>
          } />
          
          {/* ⭐ Kullanıcının ilanları sayfası */}
          <Route path="/my-listings" element={
            <>
              <Header 
                user={user} 
                onLogout={refreshLoginStatus}
                onSearch={handleHeaderSearch}
              />
              <MyListings />
            </>
          } />
          
          {/* ⭐ İlan düzenleme sayfası (gelecekte eklenecek) */}
          <Route path="/edit-listing/:id" element={
            <>
              <Header 
                user={user} 
                onLogout={refreshLoginStatus}
                onSearch={handleHeaderSearch}
              />
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '60vh',
                color: '#c9a96e',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <h2>İlan Düzenleme</h2>
                <p>Bu özellik henüz tamamlanmamıştır.</p>
                <button 
                  onClick={() => window.history.back()}
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(32, 32, 32, 0.9)',
                    border: '1px solid rgba(201, 169, 110, 0.3)',
                    borderRadius: '12px',
                    color: 'rgba(230, 200, 148, 0.95)',
                    cursor: 'pointer'
                  }}
                >
                  Geri Dön
                </button>
              </div>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;