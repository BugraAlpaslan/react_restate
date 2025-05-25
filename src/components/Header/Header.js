// src/components/Header/Header.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import styles from "./Header.module.css";

const Header = () => {
  const navigate = useNavigate();

  const handleAddListing = () => {
    navigate('/add-listing');
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
      </div>
    </header>
  );
};

export default Header;