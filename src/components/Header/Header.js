// src/components/Header/Header.js - Props ve logout düzeltmesi
import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LogOut, User } from "lucide-react";
import styles from "./Header.module.css";

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleAddListing = () => {
    navigate('/add-listing');
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
    
    // ⭐ Sayfayı yenile (en emin yol)
    setTimeout(() => {
      console.log('🔄 Sayfa yenileniyor...');
      window.location.href = '/';
    }, 100);
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
        
        <input 
          className={styles.search} 
          type="text" 
          placeholder="Arama yap..." 
        />
        
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <User size={18} />
            <span>{getUsername()}</span>
          </div>
          <button 
            className={styles.logoutBtn}
            onClick={handleLogout}
            title="Çıkış Yap"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;