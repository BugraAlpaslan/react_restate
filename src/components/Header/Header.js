// src/components/Header/Header.js - Çıkış butonu ile
import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LogOut, User } from "lucide-react";
import styles from "./Header.module.css";

const Header = () => {
  const navigate = useNavigate();

  const handleAddListing = () => {
    navigate('/add-listing');
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    window.location.reload(); // Sayfayı yenile
  };

  const getUsername = () => {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user).username;
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