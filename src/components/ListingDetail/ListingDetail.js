// src/components/ListingDetail/ListingDetail.js - Backend entegrasyonu
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Home, Bath, Maximize, Calendar, 
  Thermometer, Sofa, Car, Shield, Phone, Mail, Share2,
  Heart, RefreshCw, AlertCircle
} from 'lucide-react';
import styles from './ListingDetail.module.css';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // ⭐ Backend'den ilan detayını çek
  const fetchListing = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 İlan detayı çekiliyor, ID:', id);
      
      const response = await fetch(`http://localhost:8080/api/listings/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📋 Backend detay response:', result);
      
      if (result.success && result.data) {
        const fetchedListing = result.data;
        
        // Backend verisini frontend formatına uyarla
        const adaptedListing = {
          ...fetchedListing,
          // Görüntüleme için uyarlama
          title: fetchedListing.ismi || fetchedListing.title,
          description: fetchedListing.aciklama || fetchedListing.description,
          price: fetchedListing.fiyat || fetchedListing.price,
          area: fetchedListing.m2 || fetchedListing.area,
          bedrooms: fetchedListing.odaSayisi || fetchedListing.bedrooms,
          buildingAge: fetchedListing.binaYasi || fetchedListing.buildingAge,
          location: fetchedListing.konum || `${fetchedListing.city}/${fetchedListing.district}`,
          
          // Default değerler
          bathrooms: fetchedListing.bathrooms || 1,
          floor: fetchedListing.floor || 'Belirtilmemiş',
          totalFloors: fetchedListing.totalFloors || 'Belirtilmemiş',
          heatingType: fetchedListing.heatingType || 'Belirtilmemiş',
          furnished: fetchedListing.furnished || 'Belirtilmemiş',
          parkingSpot: fetchedListing.parkingSpot || false,
          
          // Sahibi bilgileri (mock data - backend'de henüz yok)
          ownerName: fetchedListing.kimden || 'İlan Sahibi',
          phone: '0532 123 45 67', // Mock
          email: 'contact@example.com', // Mock
          
          // Zaman bilgileri
          createdAt: fetchedListing.createdAt || new Date().toISOString(),
          viewCount: fetchedListing.viewCount || 0,
          
          // Özellikler
          features: fetchedListing.features || [],
          
          // Resim
          imageUrl: fetchedListing.imageUrl || fetchedListing.getImageUrl?.() || 
                   'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
          images: [fetchedListing.imageUrl || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop']
        };
        
        setListing(adaptedListing);
        
        console.log('✅ İlan detayı başarıyla yüklendi:');
        console.log('   - Başlık:', adaptedListing.title);
        console.log('   - Fiyat:', adaptedListing.price);
        console.log('   - Konum:', adaptedListing.location);
        console.log('   - ID:', id);
        
      } else {
        throw new Error(result.message || 'İlan bulunamadı');
      }
      
    } catch (err) {
      console.error('❌ İlan detay yükleme hatası:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Component mount'ta ilanı yükle
  useEffect(() => {
    if (id) {
      fetchListing();
    } else {
      setError('İlan ID\'si belirtilmemiş');
      setLoading(false);
    }
  }, [id]);

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    console.log('❤️ Favori durumu:', !isFavorite ? 'Eklendi' : 'Çıkarıldı');
  };

  const handleContactOwner = () => {
    if (listing?.phone) {
      alert(`İlan Sahibi: ${listing.ownerName}\nTelefon: ${listing.phone}`);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link kopyalandı!');
    } catch (err) {
      alert('Link kopyalanamadı');
    }
  };

  const handleRefresh = () => {
    console.log('🔄 İlan detayı yeniden yükleniyor...');
    fetchListing();
  };

  // Loading durumu
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <h2>İlan detayı yükleniyor...</h2>
          <p>Backend'den veriler alınıyor</p>
        </div>
      </div>
    );
  }

  // Error durumu
  if (error || !listing) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <AlertCircle size={48} />
          <h2>İlan Bulunamadı</h2>
          <p>Hata: {error}</p>
          <div className={styles.errorActions}>
            <button onClick={() => navigate('/')} className={styles.backBtn}>
              Ana Sayfaya Dön
            </button>
            <button onClick={handleRefresh} className={styles.retryBtn}>
              <RefreshCw size={16} />
              Tekrar Dene
            </button>
          </div>
          <div className={styles.debugInfo}>
            <p><strong>Debug Bilgisi:</strong></p>
            <p>İlan ID: {id}</p>
            <p>API URL: http://localhost:8080/api/listings/{id}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ⭐ Sabit Header */}
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => navigate('/')}
        >
          <ArrowLeft size={20} />
          Geri Dön
        </button>
        
        <div className={styles.headerInfo}>
          <span className={styles.backendBadge}>🌐 Backend Verisi</span>
        </div>
        
        <div className={styles.actions}>
          <button onClick={handleRefresh} className={styles.actionBtn} title="Yenile">
            <RefreshCw size={18} />
          </button>
          <button 
            className={`${styles.actionBtn} ${isFavorite ? styles.favorite : ''}`}
            onClick={handleFavoriteToggle}
            title="Favorilere Ekle"
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button className={styles.actionBtn} onClick={handleShare} title="Paylaş">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* ⭐ Scrollable Content */}
      <div className={styles.scrollableContent}>
        {/* Image Section */}
        <div className={styles.imageSection}>
          <div className={styles.mainImage}>
            <img 
              src={listing.imageUrl}
              alt={listing.title}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop';
              }}
            />
          </div>
        </div>

        {/* Info Section */}
        <div className={styles.infoSection}>
          <div className={styles.mainInfo}>
            <h1 className={styles.title}>{listing.title}</h1>
            
            <div className={styles.price}>
              {typeof listing.price === 'number' 
                ? `${listing.price.toLocaleString()}₺/ay` 
                : listing.price
              }
            </div>
            
            <div className={styles.location}>
              <MapPin size={16} />
              <span>{listing.location}</span>
            </div>

            <div className={styles.specs}>
              <div className={styles.spec}>
                <Home size={16} />
                <span>{listing.bedrooms}+1</span>
              </div>
              <div className={styles.spec}>
                <Bath size={16} />
                <span>{listing.bathrooms}</span>
              </div>
              <div className={styles.spec}>
                <Maximize size={16} />
                <span>{listing.area} m²</span>
              </div>
              <div className={styles.spec}>
                <Calendar size={16} />
                <span>{listing.buildingAge} yaş</span>
              </div>
            </div>

            <div className={styles.description}>
              <h3>Açıklama</h3>
              <p>{listing.description}</p>
            </div>

            <div className={styles.details}>
              <h3>Emlak Detayları</h3>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <Thermometer size={16} />
                  <span>Isıtma: {listing.heatingType}</span>
                </div>
                <div className={styles.detailItem}>
                  <Sofa size={16} />
                  <span>Eşya: {listing.furnished}</span>
                </div>
                {listing.parkingSpot && (
                  <div className={styles.detailItem}>
                    <Car size={16} />
                    <span>Otopark Var</span>
                  </div>
                )}
                <div className={styles.detailItem}>
                  <span>Kat: {listing.floor}/{listing.totalFloors}</span>
                </div>
              </div>
            </div>

            {listing.features && listing.features.length > 0 && (
              <div className={styles.features}>
                <h3>Özellikler</h3>
                <div className={styles.featureList}>
                  {listing.features.map((feature, index) => (
                    <span key={index} className={styles.featureTag}>
                      <Shield size={12} />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact Card */}
          <div className={styles.contactCard}>
            <div className={styles.ownerInfo}>
              <h3>İlan Sahibi</h3>
              <div className={styles.ownerDetails}>
                <div className={styles.ownerName}>{listing.ownerName}</div>
                <div className={styles.memberSince}>
                  Üyelik: {new Date(listing.createdAt).getFullYear()}
                </div>
              </div>
            </div>

            <div className={styles.contactButtons}>
              <button 
                className={`${styles.contactBtn} ${styles.primary}`}
                onClick={handleContactOwner}
              >
                <Phone size={18} />
                Telefonu Göster
              </button>
              
              <button 
                className={`${styles.contactBtn} ${styles.secondary}`}
                onClick={() => window.location.href = `mailto:${listing.email}`}
              >
                <Mail size={18} />
                E-posta Gönder
              </button>
            </div>

            <div className={styles.listingStats}>
              <div className={styles.stat}>
                <span>İlan No</span>
                <span>#{listing.ilanID || id}</span>
              </div>
              <div className={styles.stat}>
                <span>Yayın Tarihi</span>
                <span>{new Date(listing.createdAt).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className={styles.stat}>
                <span>Görüntülenme</span>
                <span>{listing.viewCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;