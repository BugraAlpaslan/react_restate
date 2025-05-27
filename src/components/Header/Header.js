// src/components/Header/Header.js - Düzeltilmiş Global Arama
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, LogOut, User, ChevronDown, Heart, FileText, Search } from "lucide-react";
import styles from "./Header.module.css";

const Header = ({ user, onLogout, onSearch, searchTerm }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');
  const profileRef = useRef(null);

  // Global search term değiştiğinde local state'i güncelle
  useEffect(() => {
    setLocalSearchTerm(searchTerm || '');
  }, [searchTerm]);

  // Profil menüsünü dışarı tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddListing = () => {
    navigate('/add-listing');
  };

  // ⭐ Geliştirilmiş arama fonksiyonu - tüm sayfalarda çalışır
  const handleSearch = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    
    // Debounced search - 300ms bekle
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      console.log('🔍 Header arama (debounced):', value);
      
      // Eğer ana sayfada değilse ana sayfaya git
      if (location.pathname !== '/' && value.trim()) {
        console.log('📍 Ana sayfaya yönlendiriliyor...');
        navigate('/');
        // Kısa bir gecikme ile arama yap (sayfa geçişi için)
        setTimeout(() => {
          if (onSearch) {
            onSearch(value);
          }
        }, 100);
      } else if (onSearch) {
        // Ana sayfadaysa direkt arama yap
        onSearch(value);
      }
    }, 300);
  };

  // ⭐ Enter tuşuyla arama
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter' && localSearchTerm.trim()) {
      console.log('⌨️ Enter ile arama:', localSearchTerm);
      
      // Ana sayfaya git ve arama yap
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          if (onSearch) {
            onSearch(localSearchTerm);
          }
        }, 100);
      } else if (onSearch) {
        onSearch(localSearchTerm);
      }
    }
  };

  // ⭐ Arama ikonuna tıklama
  const handleSearchIconClick = () => {
    if (localSearchTerm.trim()) {
      console.log('🔍 Search icon tıklandı:', localSearchTerm);
      
      // Ana sayfaya git ve arama yap
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          if (onSearch) {
            onSearch(localSearchTerm);
          }
        }, 100);
      } else if (onSearch) {
        onSearch(localSearchTerm);
      }
    }
  };

  // ⭐ Arama kutusunu temizle
  const handleClearSearch = () => {
    setLocalSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  const handleLogout = () => {
    console.log('🚪 Çıkış yapılıyor...');
    
    // localStorage'ı temizle
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    
    console.log('🗑️ localStorage temizlendi');
    
    // Parent component'e bildir
    if (onLogout) {
      onLogout();
    }
    
    // Profil menüsünü kapat
    setIsProfileOpen(false);
    
    // Sayfayı yenile
    setTimeout(() => {
      console.log('🔄 Sayfa yenileniyor...');
      window.location.href = '/';
    }, 100);
  };

  const handleProfileMenuClick = (action) => {
    setIsProfileOpen(false);
    
    switch(action) {
      case 'favorites':
        navigate('/my-favorites');
        break;
      case 'my-listings':
        navigate('/my-listings');
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  const getUsername = () => {
    if (user && user.username) {
      return user.username;
    }
    
    // Fallback: localStorage'dan al
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed.username || 'Kullanıcı';
      }
    } catch (error) {
      console.error('❌ User data parse hatası:', error);
    }
    
    return 'Kullanıcı';
  };

  const getUserId = () => {
    if (user && user.id) {
      return user.id;
    }
    
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed.id;
      }
    } catch (error) {
      console.error('❌ User ID parse hatası:', error);
    }
    
    return null;
  };

  // ⭐ Arama placeholder'ını sayfaya göre değiştir
  const getSearchPlaceholder = () => {
    if (location.pathname === '/') {
      return "İlan ara (başlık, konum, açıklama)...";
    } else {
      return "Ana sayfada arama yapmak için Enter'a basın...";
    }
  };

  // ⭐ Arama kutusunun durumunu belirle
  const isSearchActive = location.pathname === '/';

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <button 
          className={styles.addListingBtn}
          onClick={handleAddListing}
        >
          <Plus size={20} />
          İlan Ekle
        </button>
        
        {/* ⭐ Geliştirilmiş Global Arama Kutusu */}
        <div className={styles.searchContainer}>
          <input 
            className={`${styles.search} ${!isSearchActive ? styles.searchInactive : ''}`}
            type="text" 
            placeholder={getSearchPlaceholder()}
            value={localSearchTerm}
            onChange={handleSearch}
            onKeyPress={handleSearchKeyPress}
          />
          
          {/* Arama/Temizle İkonu */}
          {localSearchTerm ? (
            <button 
              className={styles.searchIcon}
              onClick={handleClearSearch}
              title="Aramayı Temizle"
            >
              ✕
            </button>
          ) : (
            <button 
              className={styles.searchIcon}
              onClick={handleSearchIconClick}
              title="Ara"
            >
              <Search size={20} />
            </button>
          )}
          
          {/* Arama Durumu Göstergesi */}
          <div className={`${styles.searchStatus} ${isSearchActive ? styles.active : ''}`}>
            {isSearchActive ? (
              <span className={styles.statusActive}>🟢 Aktif</span>
            ) : (
              <span className={styles.statusInactive}>⚫ Enter'a basın</span>
            )}
          </div>
        </div>
        
        <div className={styles.userSection} ref={profileRef}>
          <button 
            className={`${styles.profileBtn} ${isProfileOpen ? styles.active : ''}`}
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className={styles.userInfo}>
              <User size={18} />
              <span>{getUsername()}</span>
            </div>
            <ChevronDown 
              size={16} 
              className={`${styles.chevron} ${isProfileOpen ? styles.rotated : ''}`} 
            />
          </button>
          
          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className={styles.profileDropdown}>
              <div className={styles.dropdownHeader}>
                <div className={styles.userDetails}>
                  <div className={styles.userName}>{getUsername()}</div>
                  <div className={styles.userId}>ID: {getUserId()}</div>
                </div>
              </div>
              
              <div className={styles.dropdownDivider}></div>
              
              <button 
                className={styles.dropdownItem}
                onClick={() => handleProfileMenuClick('favorites')}
              >
                <Heart size={18} />
                <div className={styles.itemContent}>
                  <span className={styles.itemTitle}>Favori İlanlarım</span>
                  <span className={styles.itemDesc}>Beğendiğim ilanları görüntüle</span>
                </div>
              </button>
              
              <button 
                className={styles.dropdownItem}
                onClick={() => handleProfileMenuClick('my-listings')}
              >
                <FileText size={18} />
                <div className={styles.itemContent}>
                  <span className={styles.itemTitle}>İlanlarım</span>
                  <span className={styles.itemDesc}>İlanlarımı düzenle ve yönet</span>
                </div>
              </button>
              
              <div className={styles.dropdownDivider}></div>
              
              <button 
                className={`${styles.dropdownItem} ${styles.logoutItem}`}
                onClick={() => handleProfileMenuClick('logout')}
              >
                <LogOut size={18} />
                <div className={styles.itemContent}>
                  <span className={styles.itemTitle}>Çıkış Yap</span>
                  <span className={styles.itemDesc}>Hesabından çıkış yap</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;