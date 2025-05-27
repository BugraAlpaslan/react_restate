// src/components/MyFavorites/MyFavorites.js - Sadece Backend
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
        console.log('👤 Kullanıcı:', parsed);
      }
    } catch (error) {
      console.error('❌ User data parse hatası:', error);
    }
  }, []);

  // ⭐ Favori ilanları backend'den yükle
  const loadFavorites = async () => {
    if (!user?.id) {
      setError('Kullanıcı girişi gerekli');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('💖 Favori ilanlar backend\'den yükleniyor, User ID:', user.id);

      const response = await fetch(`http://localhost:8080/api/favorites/user/${user.id}`);
      const result = await response.json();

      if (result.success && result.data) {
        setFavorites(result.data);
        console.log(`✅ ${result.data.length} favori ilan yüklendi`);
      } else {
        setFavorites([]);
        console.log('ℹ️ Kullanıcının hiç favori ilanı yok');
      }

    } catch (error) {
      console.error('❌ Favori ilanlar yükleme hatası:', error);
      setError('Backend ile bağlantı kurulamadı: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Component mount'ta favori ilanları yükle
  useEffect(() => {
    if (user?.id) {
      loadFavorites();
    }
  }, [user]);

  // ⭐ Favorilerden çıkar (sadece backend)
  const removeFromFavorites = async (listingId) => {
    if (!user?.id) {
      alert('Kullanıcı girişi gerekli!');
      return;
    }

    if (!window.confirm('Bu ilanı favorilerinizden çıkarmak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      console.log('💔 Favorilerden çıkarılıyor:', listingId);

      const response = await fetch('http://localhost:8080/api/favorites/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          listingId: listingId
        })
      });

      const result = await response.json();

      if (result.success) {
        // State'den çıkar
        setFavorites(prev => prev.filter(listing => 
          (listing.ilanID || listing.id) !== listingId
        ));
        
        console.log('✅ Backend\'den favorilerden çıkarıldı:', listingId);
        alert('💔 İlan favorilerinizden çıkarıldı!');
        
      } else {
        alert('❌ Favori çıkarma işlemi başarısız: ' + result.message);
      }

    } catch (error) {
      console.error('❌ Favori çıkarma hatası:', error);
      alert('❌ Sunucu ile bağlantı kurulamadı!');
    }
  };

  // ⭐ İlan detayına git
  const viewListing = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  // ⭐ Tüm favorileri temizle
  const clearAllFavorites = async () => {
    if (!user?.id) {
      alert('Kullanıcı girişi gerekli!');
      return;
    }

    if (!window.confirm('Tüm favori ilanlarınızı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      console.log('🗑️ Tüm favoriler temizleniyor...');

      // Her favori için backend'den sil
      const deletePromises = favorites.map(async (listing) => {
        const listingId = listing.ilanID || listing.id;
        return fetch('http://localhost:8080/api/favorites/remove', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            listingId: listingId
          })
        });
      });

      await Promise.all(deletePromises);
      
      setFavorites([]);
      console.log('✅ Tüm favoriler backend\'den temizlendi');
      alert('🗑️ Tüm favori ilanlarınız silindi!');

    } catch (error) {
      console.error('❌ Tüm favorileri temizleme hatası:', error);
      alert('❌ Sunucu ile bağlantı kurulamadı!');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <h2>Favori ilanlarınız yükleniyor...</h2>
          <p>Backend'den veriler getiriliyor</p>
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
                    src={listing.imageUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop'}
                    alt={listing.title || listing.ismi}
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
                  <h3 className={styles.listingTitle}>{listing.title || listing.ismi}</h3>
                  
                  <div className={styles.listingLocation}>
                    <MapPin size={14} />
                    <span>{listing.location || listing.konum}</span>
                  </div>

                  <p className={styles.listingDescription}>
                    {listing.description || listing.aciklama}
                  </p>

                  <div className={styles.listingSpecs}>
                    <div className={styles.spec}>
                      <Home size={14} />
                      <span>{listing.bedrooms || listing.odaSayisi}+1</span>
                    </div>
                    <div className={styles.spec}>
                      <Bath size={14} />
                      <span>{listing.bathrooms || 1}</span>
                    </div>
                    <div className={styles.spec}>
                      <Maximize size={14} />
                      <span>{listing.area || listing.m2} m²</span>
                    </div>
                    <div className={styles.spec}>
                      <Calendar size={14} />
                      <span>{listing.buildingAge || listing.binaYasi || 0} yaş</span>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.price}>
                      {typeof (listing.price || listing.fiyat) === 'number' 
                        ? `${(listing.price || listing.fiyat).toLocaleString()}₺/ay` 
                        : (listing.price || listing.fiyat)
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