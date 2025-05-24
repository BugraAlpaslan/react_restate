// src/components/Header/Header.jsx
import React from "react";
import styles from "./Header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <input className={styles.search} type="text" placeholder="Arama yap..." />
    </header>
  );
};

export default Header;
