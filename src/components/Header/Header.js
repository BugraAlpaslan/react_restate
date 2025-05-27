// src/components/Header/Header.js - Profil dropdown menüsü
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LogOut, User, ChevronDown, Heart, FileText, Search } from "lucide-react";
import styles from "./Header.module.css";

const Header = ({ user, onLogout, onSearch }) => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const profileRef = useRef(null);

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

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Debounced search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      if (onSearch) {
        onSearch(value);
      }
    }, 300);
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
        
        <div className={styles.searchContainer}>
          <input 
            className={styles.search} 
            type="text" 
            placeholder="İlan ara (başlık, konum, açıklama)..." 
            value={searchTerm}
            onChange={handleSearch}
          />
          <Search size={20} className={styles.searchIcon} />
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