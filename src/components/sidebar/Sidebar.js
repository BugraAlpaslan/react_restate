// src/components/Sidebar/Sidebar.js - Filtreleme entegrasyonu
import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Search, X, Filter } from "lucide-react";
import styles from "./Sidebar.module.css";

const Sidebar = ({ onFiltersChange, onSearch }) => {
  const [openSections, setOpenSections] = useState({
    search: true,  // Arama bölümü açık başlasın
    price: false,
    location: false,
    rooms: false,
    area: false,
    details: false,
    features: false
  });

  const [filters, setFilters] = useState({
    // Arama
    searchTerm: '',
    
    // Fiyat
    minPrice: '',
    maxPrice: '',
    
    // Konum
    city: '',
    district: '',
    
    // Oda & Banyo
    bedrooms: '',
    bathrooms: '',
    
    // Alan
    minArea: '',
    maxArea: '',
    
    // Detaylar
    type: 'all',
    heatingType: 'all',
    furnished: 'all',
    
    // Özellikler
    features: []
  });

  const [filterOptions, setFilterOptions] = useState({
    cities: [],
    districts: [],
    heatingTypes: [],
    furnishedOptions: [],
    priceRange: { min: 0, max: 100000 },
    areaRange: { min: 0, max: 1000 }
  });

  const [loading, setLoading] = useState(false);

  // ⭐ Filter seçeneklerini backend'den çek
  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/listings/filter-options');
      const data = await response.json();
      
      if (data.success) {
        setFilterOptions(data.data);
        console.log('✅ Filter seçenekleri yüklendi:', data.data);
      }
    } catch (error) {
      console.error('❌ Filter seçenekleri yüklenemedi:', error);
    }
  };

  // Component mount'ta filter seçeneklerini yükle
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // ⭐ Filter değişikliklerini handle et
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Debounce ile parent'a bildir
    clearTimeout(window.filterTimeout);
    window.filterTimeout = setTimeout(() => {
      applyFilters(newFilters);
    }, 500);
  };

  // ⭐ Özellik seçimini handle et
  const handleFeatureToggle = (feature) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature];
    
    handleFilterChange('features', newFeatures);
  };

  // ⭐ Filtreleri uygula
  const applyFilters = async (currentFilters) => {
    if (!onFiltersChange) return;

    setLoading(true);
    
    try {
      // Boş değerleri temizle
      const cleanFilters = {};
      Object.keys(currentFilters).forEach(key => {
        const value = currentFilters[key];
        if (value !== '' && value !== 'all' && 
            !(Array.isArray(value) && value.length === 0)) {
          cleanFilters[key] = value;
        }
      });

      console.log('🔍 Filtreler uygulanıyor:', cleanFilters);
      await onFiltersChange(cleanFilters);
      
    } catch (error) {
      console.error('❌ Filter uygulama hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Arama işlemi
  const handleSearch = (searchTerm) => {
    if (onSearch) {
      console.log('🔍 Arama yapılıyor:', searchTerm);
      onSearch(searchTerm);
    }
  };

  // ⭐ Filtreleri temizle
  const clearFilters = () => {
    const defaultFilters = {
      searchTerm: '',
      minPrice: '',
      maxPrice: '',
      city: '',
      district: '',
      bedrooms: '',
      bathrooms: '',
      minArea: '',
      maxArea: '',
      type: 'all',
      heatingType: 'all',
      furnished: 'all',
      features: []
    };
    
    setFilters(defaultFilters);
    applyFilters(defaultFilters);
    console.log('🗑️ Filtreler temizlendi');
  };

  // Mevcut özellikler listesi
  const availableFeatures = [
    'Havuz', 'Asansör', 'Otopark', 'Güvenlik', 'Balkon', 'Teras',
    'Bahçe', 'Sauna', 'Spor Salonu', 'Jeneratör'
  ];

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2>
          <Filter size={18} />
          Filtreler
        </h2>
        {loading && <div className={styles.loadingSpinner}></div>}
      </div>

      {/* Arama */}
      <div className={styles.filter}>
        <div 
          className={styles.filterHeader} 
          onClick={() => toggleSection('search')}
        >
          <span>🔍 Arama</span>
          {openSections.search ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
        {openSections.search && (
          <div className={styles.filterContent}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="İlan ara..."
                value={filters.searchTerm}
                onChange={(e) => {
                  handleFilterChange('searchTerm', e.target.value);
                  handleSearch(e.target.value);
                }}
              />
              <Search size={16} className={styles.searchIcon} />
            </div>
          </div>
        )}
      </div>

      {/* Fiyat */}
      <div className={styles.filter}>
        <div 
          className={styles.filterHeader} 
          onClick={() => toggleSection('price')}
        >
          <span>💰 Fiyat</span>
          {openSections.price ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
        {openSections.price && (
          <div className={styles.filterContent}>
            <div className={styles.priceRow}>
              <input
                type="number"
                placeholder={`Min (${filterOptions.priceRange.min})`}
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
              <span>-</span>
              <input
                type="number"
                placeholder={`Max (${filterOptions.priceRange.max})`}
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>
            <div className={styles.rangeInfo}>
              {filterOptions.priceRange.min.toLocaleString()}₺ - {filterOptions.priceRange.max.toLocaleString()}₺
            </div>
          </div>
        )}
      </div>

      {/* Konum */}
      <div className={styles.filter}>
        <div 
          className={styles.filterHeader} 
          onClick={() => toggleSection('location')}
        >
          <span>📍 Konum</span>
          {openSections.location ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
        {openSections.location && (
          <div className={styles.filterContent}>
            <div>
              <label>Şehir</label>
              <select
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              >
                <option value="">Tümü</option>
                {filterOptions.cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label>İlçe</label>
              <select
                value={filters.district}
                onChange={(e) => handleFilterChange('district', e.target.value)}
              >
                <option value="">Tümü</option>
                {filterOptions.districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Oda & Banyo */}
      <div className={styles.filter}>
        <div 
          className={styles.filterHeader} 
          onClick={() => toggleSection('rooms')}
        >
          <span>🏠 Oda & Banyo</span>
          {openSections.rooms ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
        {openSections.rooms && (
          <div className={styles.filterContent}>
            <div>
              <label>Oda Sayısı</label>
              <select
                value={filters.bedrooms}
                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
              >
                <option value="">Tümü</option>
                {[1,2,3,4,5,6].map(num => (
                  <option key={num} value={num}>{num}+1</option>
                ))}
              </select>
            </div>
            <div>
              <label>Banyo Sayısı</label>
              <select
                value={filters.bathrooms}
                onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
              >
                <option value="">Tümü</option>
                {[1,2,3,4,5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
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
          <span>📐 Alan (m²)</span>
          {openSections.area ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
        {openSections.area && (
          <div className={styles.filterContent}>
            <div className={styles.priceRow}>
              <input
                type="number"
                placeholder={`Min ${filterOptions.areaRange.min}`}
                value={filters.minArea}
                onChange={(e) => handleFilterChange('minArea', e.target.value)}
              />
              <span>-</span>
              <input
                type="number"
                placeholder={`Max ${filterOptions.areaRange.max}`}
                value={filters.maxArea}
                onChange={(e) => handleFilterChange('maxArea', e.target.value)}
              />
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
          <span>⚙️ Detaylar</span>
          {openSections.details ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
        {openSections.details && (
          <div className={styles.filterContent}>
            <div>
              <label>İlan Tipi</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="all">Tümü</option>
                <option value="rent">Kiralık</option>
                <option value="sale">Satılık</option>
              </select>
            </div>
            <div>
              <label>Isıtma</label>
              <select
                value={filters.heatingType}
                onChange={(e) => handleFilterChange('heatingType', e.target.value)}
              >
                <option value="all">Tümü</option>
                {filterOptions.heatingTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Eşya</label>
              <select
                value={filters.furnished}
                onChange={(e) => handleFilterChange('furnished', e.target.value)}
              >
                <option value="all">Tümü</option>
                {filterOptions.furnishedOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
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
          <span>⭐ Özellikler</span>
          {openSections.features ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
        {openSections.features && (
          <div className={styles.filterContent}>
            <div className={styles.checkboxGrid}>
              {availableFeatures.map(feature => (
                <label key={feature} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.features.includes(feature)}
                    onChange={() => handleFeatureToggle(feature)}
                  />
                  <span>{feature}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Temizle Butonu */}
      <button className={styles.clearBtn} onClick={clearFilters}>
        <X size={16} />
        Filtreleri Temizle
      </button>

      {/* Filter Özeti */}
      <div className={styles.filterSummary}>
        <p>Aktif filtreler: {Object.values(filters).filter(v => 
          v !== '' && v !== 'all' && !(Array.isArray(v) && v.length === 0)
        ).length}</p>
      </div>
    </div>
  );
};

export default Sidebar;