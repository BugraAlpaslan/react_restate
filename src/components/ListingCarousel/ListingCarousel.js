// src/components/ListingCarousel/ListingCarousel.js - Backend resimler düzeltmesi
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import styles from './ListingCarousel.module.css';

const ListingCarousel = ({ customListings = null, loading: externalLoading = false, isFiltered = false }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const navigate = useNavigate();

  // ⭐ Custom listings kullan veya backend'den çek
  const displayListings = customListings || listings;
  const isLoading = externalLoading || (loading && !customListings);
  
  const itemsPerSlide = 9;

  // ⭐ Backend'den ilanları çek
  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Backend\'den ilanlar çekiliyor...');
      
      const response = await fetch('http://localhost:8080/api/listings');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📋 Backend response:', data);
      
      if (data.success && data.data) {
        setListings(data.data);
        setLastUpdate(new Date());
        console.log(`✅ ${data.data.length} ilan başarıyla yüklendi`);
        
        // İlk birkaç ilanın detayını log'la
        data.data.slice(0, 3).forEach((ilan, index) => {
          console.log(`${index + 1}. ${ilan.ismi} - ${ilan.fiyat}₺ (ID: ${ilan.ilanID})`);
          console.log(`   🖼️ Resimler:`, ilan.getImageUrls ? ilan.getImageUrls() : [ilan.imageUrl || ilan.getImageUrl?.()]);
        });
        
      } else {
        throw new Error(data.message || 'İlanlar alınamadı');
      }
      
    } catch (error) {
      console.error('❌ İlan yükleme hatası:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Component mount'ta ilanları yükle
  useEffect(() => {
    fetchListings();
  }, []);

  // Sayfalama hesaplamaları
  const totalSlides = Math.ceil(displayListings.length / itemsPerSlide);

  // ⭐ Custom listings değiştiğinde slide'ı sıfırla
  useEffect(() => {
    if (customListings) {
      setCurrentSlide(0);
    }
  }, [customListings]);

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const getCurrentSlideItems = () => {
    const startIndex = currentSlide * itemsPerSlide;
    const endIndex = startIndex + itemsPerSlide;
    return displayListings.slice(startIndex, endIndex);
  };

  const handleViewDetails = (listingId) => {
    console.log('👁️ İlan detayına gidiliyor, ID:', listingId);
    navigate(`/listing/${listingId}`);
  };

  const handleRefresh = () => {
    console.log('🔄 İlanlar yeniden yükleniyor...');
    setCurrentSlide(0); // İlk sayfaya dön
    fetchListings();
  };

  // ⭐ İlan resim URL'ini al - backend'den gelen veriyi kullan
  const getListingImageUrl = (listing) => {
    console.log('🖼️ Resim URL alınıyor:', listing.ismi);
    
    // 1. Backend'den gelen imageUrl (ana resim)
    if (listing.imageUrl) {
      console.log('📸 Ana resim kullanıldı:', listing.imageUrl);
      return listing.imageUrl;
    }
    
    // 2. getImageUrl metodu varsa kullan
    if (typeof listing.getImageUrl === 'function') {
      const methodImage = listing.getImageUrl();
      if (methodImage) {
        console.log('📸 Method resmi kullanıldı:', methodImage);
        return methodImage;
      }
    }
    
    // 3. getImageUrls array'inin ilk elemanı
    if (typeof listing.getImageUrls === 'function') {
      const imageArray = listing.getImageUrls();
      if (imageArray && imageArray.length > 0) {
        console.log('📸 Array ilk resmi kullanıldı:', imageArray[0]);
        return imageArray[0];
      }
    }
    
    // 4. images array'i varsa ilk elemanı
    if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
      const firstImage = typeof listing.images[0] === 'string' 
        ? listing.images[0] 
        : listing.images[0].url;
      if (firstImage) {
        console.log('📸 Images array kullanıldı:', firstImage);
        return firstImage;
      }
    }
    
    // 5. Default resim
    console.log('📸 Default resim kullanıldı');
    return 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop';
  };

  // Loading durumu
  if (isLoading) {
    return (
      <div className={styles.carouselContainer}>
        <div className={styles.carouselWrapper}>
          <div className={styles.loadingState}>
            <div className={styles.loadingSpinner}></div>
            <h2>İlanlar yükleniyor...</h2>
            <p>Backend'den veriler alınıyor</p>
          </div>
        </div>
      </div>
    );
  }

  // Error durumu
  if (error) {
    return (
      <div className={styles.carouselContainer}>
        <div className={styles.carouselWrapper}>
          <div className={styles.errorState}>
            <AlertCircle size={48} />
            <h2>İlanlar Yüklenemedi</h2>
            <p>Hata: {error}</p>
            <div className={styles.errorActions}>
              <button onClick={handleRefresh} className={styles.retryBtn}>
                <RefreshCw size={16} />
                Tekrar Dene
              </button>
              <button 
                onClick={() => console.log('Backend durumu:', 'http://localhost:8080/api/listings')}
                className={styles.debugBtn}
              >
                Backend Durumunu Kontrol Et
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // İlan yoksa
  if (displayListings.length === 0 && !isLoading) {
    return (
      <div className={styles.carouselContainer}>
        <div className={styles.carouselWrapper}>
          <div className={styles.emptyState}>
            <h2>{isFiltered ? 'Filtreye Uygun İlan Bulunamadı' : 'Henüz İlan Yok'}</h2>
            <p>{isFiltered ? 'Filtre kriterlerinizi değiştirmeyi deneyin' : 'Backend\'de hiç ilan bulunamadı'}</p>
            <button onClick={handleRefresh} className={styles.retryBtn}>
              <RefreshCw size={16} />
              {isFiltered ? 'Filtreleri Temizle' : 'Yenile'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ListingCard = ({ listing }) => {
    // ⭐ Resim URL'ini al
    const imageUrl = getListingImageUrl(listing);
    const isBackendImage = imageUrl.includes('localhost:8080');
    
    return (
      <div className={styles.listingCard}>
        <div className={styles.listingImageContainer}>
          <img
            src={imageUrl}
            alt={listing.ismi || listing.title}
            className={styles.listingImage}
            onError={(e) => {
              console.log('❌ Resim yüklenemedi:', e.target.src);
              e.target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop';
            }}
          />
          
          {/* ⭐ Resim kaynağı göstergesi */}
          <div className={`${styles.imageSource} ${isBackendImage ? styles.backendBadge : styles.mockBadge}`}>
            {isBackendImage ? '📸 Backend' : '🖼️ Mock'}
          </div>
        </div>
        
        <div className={styles.listingContent}>
          <h3 className={styles.listingTitle}>
            {listing.ismi || listing.title}
          </h3>
          <p className={styles.listingDescription}>
            {listing.aciklama || listing.description}
          </p>
          <div className={styles.listingMeta}>
            <span className={styles.listingLocation}>
              📍 {listing.city}/{listing.district}
            </span>
            <span className={styles.listingSpecs}>
              🏠 {listing.odaSayisi || listing.bedrooms}+1 • 🛁 {listing.bathrooms} • 📐 {listing.m2 || listing.area}m²
            </span>
          </div>
          <div className={styles.listingFooter}>
            <span className={styles.listingPrice}>
              {listing.fiyat ? `${listing.fiyat.toLocaleString()}₺` : listing.price}
            </span>
            <button 
              className={styles.listingBtn}
              onClick={() => handleViewDetails(listing.ilanID || listing.id)}
            >
              Detayları Gör
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.carouselWrapper}>
        {/* Header */}
        <div className={styles.carouselHeader}>
          <h1 className={styles.carouselTitle}>
            {isFiltered ? 'Filtrelenmiş İlanlar' : 'Emlak İlanları'}
          </h1>
          <div className={styles.carouselInfo}>
            <span className={styles.slideCounter}>
              {currentSlide + 1} / {totalSlides}
            </span>
            <button onClick={handleRefresh} className={styles.refreshBtn} title="İlanları Yenile">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Backend bilgisi */}
        <div className={styles.dataSource}>
          <span className={styles.dataSourceBadge}>
            🌐 {isFiltered ? 'Filtrelenmiş' : 'Backend\'den Canlı'} Veriler
          </span>
          {lastUpdate && !isFiltered && (
            <span className={styles.lastUpdate}>
              Son güncelleme: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          {isFiltered && (
            <span className={styles.filterInfo}>
              Filtreleme uygulandı
            </span>
          )}
        </div>

        {/* Carousel Content with Side Arrows */}
        <div className={styles.carouselContent}>
          {/* Sol Ok */}
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`${styles.sideArrow} ${styles.leftArrow} ${currentSlide === 0 ? styles.disabled : ''}`}
          >
            <ChevronLeft size={32} />
          </button>
          
          {/* Grid */}
          <div className={styles.listingsGrid}>
            {getCurrentSlideItems().map((listing) => (
              <ListingCard key={listing.ilanID || listing.id} listing={listing} />
            ))}
          </div>
          
          {/* Sağ Ok */}
          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className={`${styles.sideArrow} ${styles.rightArrow} ${currentSlide === totalSlides - 1 ? styles.disabled : ''}`}
          >
            <ChevronRight size={32} />
          </button>
        </div>

        {/* Slide Indicators */}
        {totalSlides > 1 && (
          <div className={styles.slideIndicators}>
            {Array.from({ length: totalSlides }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`${styles.indicator} ${index === currentSlide ? styles.active : ''}`}
              />
            ))}
          </div>
        )}

        {/* Summary */}
        <div className={styles.carouselSummary}>
          <p className={styles.summaryText}>
            {isFiltered ? 'Filtrelenmiş: ' : 'Toplam '}{displayListings.length} ilan • Sayfa {currentSlide + 1}/{totalSlides} • {getCurrentSlideItems().length} ilan gösteriliyor
          </p>
        </div>
      </div>
    </div>
  );
};

export default ListingCarousel;