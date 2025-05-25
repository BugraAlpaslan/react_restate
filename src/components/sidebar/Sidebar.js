// src/components/Sidebar/Sidebar.js
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className={styles.sidebar}>
      <h2>Filtreler</h2>
      
      {/* İlan Tipi */}
      <div className={styles.filter}>
        <div 
          className={styles.filterHeader} 
          onClick={() => toggleSection('type')}
        >
          <span>İlan Tipi</span>
          {openSections.type ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
        {openSections.type && (
          <div className={styles.filterContent}>
            <select>
              <option>Tümü</option>
              <option>Kiralık</option>
              <option>Satılık</option>
            </select>
          </div>
        )}
      </div>

      {/* Fiyat */}
      <div className={styles.filter}>
        <div 
          className={styles.filterHeader} 
          onClick={() => toggleSection('price')}
        >
          <span>Fiyat</span>
          {openSections.price ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
        {openSections.price && (
          <div className={styles.filterContent}>
            <div className={styles.priceRow}>
              <input type="text" placeholder="Min ₺" />
              <span>-</span>
              <input type="text" placeholder="Max ₺" />
            </div>
            <input type="range" min="1000" max="50000" />
          </div>
        )}
      </div>

      {/* Konum */}
      <div className={styles.filter}>
        <div 
          className={styles.filterHeader} 
          onClick={() => toggleSection('location')}
        >
          <span>Konum</span>
          {openSections.location ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
        {openSections.location && (
          <div className={styles.filterContent}>
            <input type="text" placeholder="Şehir" />
            <input type="text" placeholder="İlçe" />
          </div>
        )}
      </div>

      {/* Oda & Banyo */}
      <div className={styles.filter}>
        <div 
          className={styles.filterHeader} 
          onClick={() => toggleSection('rooms')}
        >
          <span>Oda & Banyo</span>
          {openSections.rooms ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
        {openSections.rooms && (
          <div className={styles.filterContent}>
            <div>
              <label>Oda</label>
              <select>
                <option>Tümü</option>
                <option>1+0</option>
                <option>1+1</option>
                <option>2+1</option>
                <option>3+1</option>
              </select>
            </div>
            <div>
              <label>Banyo</label>
              <select>
                <option>Tümü</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Alan */}
      <div className={styles.filter}>
        <div 
          className={styles.filterHeader} 
          onClick={() => toggleSection('area')}
        >
          <span>Alan (m²)</span>
          {openSections.area ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
        {openSections.area && (
          <div className={styles.filterContent}>
            <div className={styles.priceRow}>
              <input type="number" placeholder="Min" />
              <span>-</span>
              <input type="number" placeholder="Max" />
            </div>
          </div>
        )}
      </div>

      {/* Detaylar */}
      <div className={styles.filter}>
        <div 
          className={styles.filterHeader} 
          onClick={() => toggleSection('details')}
        >
          <span>Detaylar</span>
          {openSections.details ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
        {openSections.details && (
          <div className={styles.filterContent}>
            <div>
              <label>Isıtma</label>
              <select>
                <option>Tümü</option>
                <option>Merkezi</option>
                <option>Bireysel</option>
              </select>
            </div>
            <div>
              <label>Eşya</label>
              <select>
                <option>Tümü</option>
                <option>Boş</option>
                <option>Eşyalı</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Özellikler */}
      <div className={styles.filter}>
        <div 
          className={styles.filterHeader} 
          onClick={() => toggleSection('features')}
        >
          <span>Özellikler</span>
          {openSections.features ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
        {openSections.features && (
          <div className={styles.filterContent}>
            <div className={styles.checkboxGrid}>
              <label><input type="checkbox" /> Havuz</label>
              <label><input type="checkbox" /> Asansör</label>
              <label><input type="checkbox" /> Otopark</label>
              <label><input type="checkbox" /> Güvenlik</label>
              <label><input type="checkbox" /> Balkon</label>
              <label><input type="checkbox" /> Teras</label>
            </div>
          </div>
        )}
      </div>

      <button className={styles.clearBtn}>Filtreleri Temizle</button>
    </div>
  );
};

export default Sidebar;