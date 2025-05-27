// src/components/MyFavorites/MyFavorites.js - Favori ilanlar sayfası
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Trash2, Eye, MapPin, Home, Bath, 
  Maximize, Calendar, RefreshCw, AlertCircle 
} from 'lucide-react';
import styles from './MyFavorites.module.css';

const MyFavorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Kullanıcı bilgisini al
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        setUser(parsed);
      }
    } catch (error) {
      console.error('❌ User data parse hatası:', error);
    }
  }, []);

  // ⭐ Favori ilanları localStorage'dan yükle
  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      // LocalStorage'dan favori ID'leri al
      const favoriteIds = JSON.parse(localStorage.getItem('favoriteListings') || '[]');
      
      if (favoriteIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      console.log('💖 Favori ilanlar yükleniyor:', favoriteIds);

      // Her favori için backend'den detay bilgisi çek
      const favoritePromises = favoriteIds.map(async (id) => {
        try {
          const response = await fetch(`http://localhost:8080/api/listings/${id}`);
          const result = await response.json();
          
          if (result.success && result.data) {
            return {
              ...result.data,
              // Görüntüleme için uyarlama
              title: result.data.ismi || result.data.title,
              description: result.data.aciklama || result.data.description,
              price: result.data.fiyat || result.data.price,
              area: result.data.m2 || result.data.area,
              bedrooms: result.data.odaSayisi || result.data.bedrooms,
              location: result.data.konum || `${result.data.city}/${result.data.district}`
            };
          }
          return null;
        } catch (error) {
          console.error(`❌ İlan ${id} yüklenemedi:`, error);
          return null;
        }
      });

      const favoriteListings = (await Promise.all(favoritePromises))
        .filter(listing => listing !== null);

      setFavorites(favoriteListings);
      console.log(`✅ ${favoriteListings.length} favori ilan yüklendi`);

    } catch (error) {
      console.error('❌ Favori ilanlar yükleme hatası:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Component mount'ta favori ilanları yükle
  useEffect(() => {
    loadFavorites();
  }, []);

  // ⭐ Favorilerden çıkar
  const removeFromFavorites = (listingId) => {
    try {
      const favoriteIds = JSON.parse(localStorage.getItem('favoriteListings') || '[]');
      const updatedIds = favoriteIds.filter(id => id !== listingId);
      
      localStorage.setItem('favoriteListings', JSON.stringify(updatedIds));
      
      // State'i güncelle
      setFavorites(prev => prev.filter(listing => 
        (listing.ilanID || listing.id) !== listingId
      ));
      
      console.log('💔 Favorilerden çıkarıldı:', listingId);
      
    } catch (error) {
      console.error('❌ Favorilerden çıkarma hatası:', error);
    }
  };

  // ⭐ İlan detayına git
  const viewListing = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  // ⭐ Tüm favorileri temizle
  const clearAllFavorites = () => {
    if (window.confirm('Tüm favori ilanlarınızı silmek istediğinizden emin misiniz?')) {
      localStorage.removeItem('favoriteListings');
      setFavorites([]);
      console.log('🗑️ Tüm favoriler temizlendi');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <h2>Favori ilanlarınız yükleniyor...</h2>
          <p>Veriler getiriliyor</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <AlertCircle size={48} />
          <h2>Favoriler Yüklenemedi</h2>
          <p>Hata: {error}</p>
          <button onClick={loadFavorites} className={styles.retryBtn}>
            <RefreshCw size={16} />
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={20} />
          Ana Sayfa
        </button>
        
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <Heart size={24} fill="currentColor" />
            Favori İlanlarım
          </h1>
          
          <div className={styles.headerInfo}>
            <span className={styles.favoriteCount}>
              {favorites.length} favori ilan
            </span>
            {favorites.length > 0 && (
              <button 
                onClick={clearAllFavorites}
                className={styles.clearAllBtn}
              >
                <Trash2 size={16} />
                Tümünü Temizle
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {favorites.length === 0 ? (
          <div className={styles.emptyState}>
            <Heart size={64} className={styles.emptyIcon} />
            <h2>Henüz Favori İlanınız Yok</h2>
            <p>Beğendiğiniz ilanları favorilere ekleyerek burada görüntüleyebilirsiniz.</p>
            <button 
              onClick={() => navigate('/')}
              className={styles.browseBtn}
            >
              İlanları Keşfet
            </button>
          </div>
        ) : (
          <div className={styles.favoritesGrid}>
            {favorites.map((listing) => (
              <div key={listing.ilanID || listing.id} className={styles.favoriteCard}>
                <div className={styles.imageContainer}>
                  <img
                    src={listing.imageUrl || listing.getImageUrl?.() || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop'}
                    alt={listing.title}
                    className={styles.listingImage}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop';
                    }}
                  />
                  <button
                    onClick={() => removeFromFavorites(listing.ilanID || listing.id)}
                    className={styles.removeBtn}
                    title="Favorilerden Çıkar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className={styles.cardContent}>
                  <h3 className={styles.listingTitle}>{listing.title}</h3>
                  
                  <div className={styles.listingLocation}>
                    <MapPin size={14} />
                    <span>{listing.location}</span>
                  </div>

                  <p className={styles.listingDescription}>
                    {listing.description}
                  </p>

                  <div className={styles.listingSpecs}>
                    <div className={styles.spec}>
                      <Home size={14} />
                      <span>{listing.bedrooms}+1</span>
                    </div>
                    <div className={styles.spec}>
                      <Bath size={14} />
                      <span>{listing.bathrooms || 1}</span>
                    </div>
                    <div className={styles.spec}>
                      <Maximize size={14} />
                      <span>{listing.area} m²</span>
                    </div>
                    <div className={styles.spec}>
                      <Calendar size={14} />
                      <span>{listing.buildingAge || 0} yaş</span>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.price}>
                      {typeof listing.price === 'number' 
                        ? `${listing.price.toLocaleString()}₺/ay` 
                        : listing.price
                      }
                    </div>
                    
                    <div className={styles.cardActions}>
                      <button
                        onClick={() => viewListing(listing.ilanID || listing.id)}
                        className={styles.viewBtn}
                      >
                        <Eye size={16} />
                        İncele
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFavorites;