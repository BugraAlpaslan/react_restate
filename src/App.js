// src/App.jsx
import React from "react";
import Header from "./components/Header/Header";
import Sidebar from "./components/sidebar/Sidebar";
//import ListingGrid from "./components/ListingGrid/ListingGrid";//
import ListingCarousel from "./components/ListingCarousel/ListingCarousel";
import styles from "./App.module.css";

const App = () => {
  return (
    <div className={styles.app}>
      <Header />
      <div className={styles.main}>
        <Sidebar />
        <div className={styles.content}>
          <ListingCarousel /> {/* Yeni bileşen burada */}
          
        </div>
      </div>
    </div>
  );
};

export default App;
