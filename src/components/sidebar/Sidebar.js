// src/components/Sidebar/Sidebar.jsx
import React from "react";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <h2>Filtreler</h2>
      <div className={styles.filter}>
        <label>Fiyat</label>
        <input type="range" min="0" max="10000" />
      </div>
      <div className={styles.filter}>
        <label>Oda Sayısı</label>
        <select>
          <option>1+1</option>
          <option>2+1</option>
          <option>3+1</option>
        </select>
      </div>
    </aside>
  );
};

export default Sidebar;
