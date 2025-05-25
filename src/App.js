// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar/Sidebar";
import Header from "./components/Header/Header";
import ListingCarousel from "./components/ListingCarousel/ListingCarousel";
import AddListing from "./components/AddListing/AddListing";
import ListingDetail from "./components/ListingDetail/ListingDetail"; // ⭐ SADECE BU EKLENDİ
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
          
          {/* ⭐ SADECE BU ROUTE EKLENDİ */}
          <Route path="/listing/:id" element={<ListingDetail />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;