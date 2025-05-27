// src/components/MyListings/MyListings.js - Kullanıcının ilanları sayfası
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Edit3, Trash2, Eye, Plus, MapPin, 
  Home, Bath, Maximize, Calendar, RefreshCw, AlertCircle,
  TrendingUp, Users, Clock
} from 'lucide-react';
import styles from './MyListings.module.css';

const MyListings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalListings: 0,
    totalViews: 0,
    avgPrice: 0
  });

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

  // ⭐ Kullanıcının ilanlarını backend'den çek
  const loadMyListings = async () => {
    if (!user?.id) {
      console.log('❌ Kullanıcı ID bulunamadı');
      setError('Kullanıcı bilgisi bulunamadı');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📋 Kullanıcı ilanları yükleniyor, User ID:', user.id);

      // Backend'den kullanıcının ilanlarını çek
      const response = await fetch(`http://localhost:8080/api/listings/user/${user.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📋 Backend my listings response:', result);
      
      if (result.success && result.data) {
        const userListings = result.data.map(listing => ({
          ...listing,
          // Görüntüleme için uyarlama
          title: listing.ismi || listing.title,
          description: listing.aciklama || listing.description,
          price: listing.fiyat || listing.price,
          area: listing.m2 || listing.area,
          bedrooms: listing.odaSayisi || listing.bedrooms,
          location: listing.konum || `${listing.city}/${listing.district}`,
          createdAt: listing.createdAt || new Date().toISOString(),
          viewCount: listing.viewCount || 0
        }));

        setListings(userListings);
        
        // İstatistikleri hesapla
        const totalViews = userListings.reduce((sum, listing) => sum + listing.viewCount, 0);
        const avgPrice = userListings.length > 0 
          ? userListings.reduce((sum, listing) => sum + (listing.price || 0), 0) / userListings.length
          : 0;

        setStats({
          totalListings: userListings.length,
          totalViews,
          avgPrice
        });

        console.log(`✅ ${userListings.length} ilan yüklendi`);
        
      } else {
        // İlan yoksa boş array set et
        setListings([]);
        setStats({ totalListings: 0, totalViews: 0, avgPrice: 0 });
        console.log('ℹ️ Kullanıcının hiç ilanı yok');
      }
      
    } catch (error) {
      console.error('❌ İlan yükleme hatası:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // User değiştiğinde ilanları yükle
  useEffect(() => {
    if (user?.id) {
      loadMyListings();
    }
  }, [user]);

  // ⭐ İlan sil
  const deleteListing = async (listingId) => {
    if (!window.confirm('Bu ilanı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      console.log('🗑️ İlan siliniyor:', listingId);

      const response = await fetch(`http://localhost:8080/api/listings/${listingId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        // State'den çıkar
        setListings(prev => prev.filter(listing => 
          (listing.ilanID || listing.id) !== listingId
        ));
        
        console.log('✅ İlan silindi:', listingId);
        alert('İlan başarıyla silindi!');
        
        // İstatistikleri güncelle
        loadMyListings();
        
      } else {
        throw new Error(result.message || 'İlan silinemedi');
      }

    } catch (error) {
      console.error('❌ İlan silme hatası:', error);
      alert('İlan silinirken hata oluştu: ' + error.message);
    }
  };

  // ⭐ İlan düzenle
  const editListing = (listingId) => {
    navigate(`/edit-listing/${listingId}`);
  };

  // ⭐ İlan detayına git
  const viewListing = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  // ⭐ Yeni ilan ekle
  const addNewListing = () => {
    navigate('/add-listing');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <h2>İlanlarınız yükleniyor...</h2>
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
          <h2>İlanlar Yüklenemedi</h2>
          <p>Hata: {error}</p>
          <button onClick={loadMyListings} className={styles.retryBtn}>
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
            <FileText size={24} />
            İlanlarım
          </h1>
          
          <div className={styles.headerActions}>
            <button 
              onClick={addNewListing}
              className={styles.addBtn}
            >
              <Plus size={16} />
              Yeni İlan Ekle
            </button>
            <button 
              onClick={loadMyListings}
              className={styles.refreshBtn}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FileText size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.totalListings}</div>
              <div className={styles.statLabel}>Toplam İlan</div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Users size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>{stats.totalViews}</div>
              <div className={styles.statLabel}>Toplam Görüntülenme</div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <TrendingUp size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>
                {stats.avgPrice > 0 ? `${Math.round(stats.avgPrice).toLocaleString()}₺` : '0₺'}
              </div>
              <div className={styles.statLabel}>Ortalama Fiyat</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {listings.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText size={64} className={styles.emptyIcon} />
            <h2>Henüz İlanınız Yok</h2>
            <p>İlk ilanınızı ekleyerek emlak portföyünüzü oluşturmaya başlayın.</p>
            <button 
              onClick={addNewListing}
              className={styles.browseBtn}
            >
              <Plus size={20} />
              İlk İlanımı Ekle
            </button>
          </div>
        ) : (
          <div className={styles.listingsGrid}>
            {listings.map((listing) => (
              <div key={listing.ilanID || listing.id} className={styles.listingCard}>
                <div className={styles.imageContainer}>
                  <img
                    src={listing.imageUrl || listing.getImageUrl?.() || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop'}
                    alt={listing.title}
                    className={styles.listingImage}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop';
                    }}
                  />
                  <div className={styles.listingBadge}>
                    <Users size={12} />
                    <span>{listing.viewCount} görüntülenme</span>
                  </div>
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

                  <div className={styles.listingMeta}>
                    <div className={styles.createdAt}>
                      <Clock size={12} />
                      <span>{new Date(listing.createdAt).toLocaleDateString('tr-TR')}</span>
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
                        title="İlanı Görüntüle"
                      >
                        <Eye size={16} />
                      </button>
                      
                      <button
                        onClick={() => editListing(listing.ilanID || listing.id)}
                        className={styles.editBtn}
                        title="İlanı Düzenle"
                      >
                        <Edit3 size={16} />
                      </button>
                      
                      <button
                        onClick={() => deleteListing(listing.ilanID || listing.id)}
                        className={styles.deleteBtn}
                        title="İlanı Sil"
                      >
                        <Trash2 size={16} />
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

export default MyListings;