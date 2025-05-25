// src/components/ListingDetail/ListingDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Home, Bath, Maximize, Calendar, 
  Thermometer, Sofa, Car, Shield, Phone, Mail, Share2,
  Heart, ChevronLeft, ChevronRight
} from 'lucide-react';
import styles from './ListingDetail.module.css';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Java Backend API çağrısı
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        // Java Spring Boot endpoint
        const response = await fetch(`/api/listings/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setListing(data);
        
        // Favoriler kontrolü
        const favoritesResponse = await fetch(`/api/users/favorites/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}` // JWT token
          }
        });
        if (favoritesResponse.ok) {
          setIsFavorite(true);
        }
        
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  const handleFavoriteToggle = async () => {
    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      const response = await fetch(`/api/users/favorites/${id}`, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleContactOwner = async () => {
    try {
      // İletişim log'u backend'e gönder
      await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          listingId: id,
          contactType: 'PHONE_VIEW',
          timestamp: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error('Error logging contact:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: listing.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: clipboard'a kopyala
      navigator.clipboard.writeText(window.location.href);
      alert('Link kopyalandı!');
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === listing.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? listing.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>İlan yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>İlan Bulunamadı</h2>
          <p>{error || 'İlan mevcut değil veya kaldırılmış.'}</p>
          <button onClick={() => navigate('/')} className={styles.backBtn}>
            Ana Sayfaya Dön
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
          Geri Dön
        </button>
        
        <div className={styles.actions}>
          <button 
            className={`${styles.actionBtn} ${isFavorite ? styles.favorite : ''}`}
            onClick={handleFavoriteToggle}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button className={styles.actionBtn} onClick={handleShare}>
            <Share2 size={18} />
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Image Gallery */}
        <div className={styles.imageSection}>
          <div className={styles.mainImage}>
            <img 
              src={listing.images?.[currentImageIndex] || listing.imageUrl || '/placeholder.jpg'} 
              alt={listing.title}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop';
              }}
            />
            
            {listing.images?.length > 1 && (
              <>
                <button className={styles.imageNav + ' ' + styles.prevBtn} onClick={prevImage}>
                  <ChevronLeft size={24} />
                </button>
                <button className={styles.imageNav + ' ' + styles.nextBtn} onClick={nextImage}>
                  <ChevronRight size={24} />
                </button>
                
                <div className={styles.imageCounter}>
                  {currentImageIndex + 1} / {listing.images.length}
                </div>
              </>
            )}
          </div>

          {listing.images?.length > 1 && (
            <div className={styles.thumbnails}>
              {listing.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${listing.title} ${index + 1}`}
                  className={`${styles.thumbnail} ${index === currentImageIndex ? styles.active : ''}`}
                  onClick={() => setCurrentImageIndex(index)}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=150&h=100&fit=crop';
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className={styles.infoSection}>
          <div className={styles.mainInfo}>
            <h1 className={styles.title}>{listing.title}</h1>
            <div className={styles.price}>{listing.price}</div>
            
            <div className={styles.location}>
              <MapPin size={16} />
              <span>{listing.location}</span>
            </div>

            <div className={styles.specs}>
              <div className={styles.spec}>
                <Home size={16} />
                <span>{listing.bedrooms}+{listing.livingRooms || 1}</span>
              </div>
              <div className={styles.spec}>
                <Bath size={16} />
                <span>{listing.bathrooms}</span>
              </div>
              <div className={styles.spec}>
                <Maximize size={16} />
                <span>{listing.area} m²</span>
              </div>
              {listing.buildingAge && (
                <div className={styles.spec}>
                  <Calendar size={16} />
                  <span>{listing.buildingAge} yaş</span>
                </div>
              )}
            </div>

            <div className={styles.description}>
              <h3>Açıklama</h3>
              <p>{listing.description}</p>
            </div>

            {/* Property Details */}
            <div className={styles.details}>
              <h3>Emlak Detayları</h3>
              <div className={styles.detailGrid}>
                {listing.heatingType && (
                  <div className={styles.detailItem}>
                    <Thermometer size={16} />
                    <span>Isıtma: {listing.heatingType}</span>
                  </div>
                )}
                {listing.furnished && (
                  <div className={styles.detailItem}>
                    <Sofa size={16} />
                    <span>Eşya: {listing.furnished}</span>
                  </div>
                )}
                {listing.parkingSpot && (
                  <div className={styles.detailItem}>
                    <Car size={16} />
                    <span>Otopark Var</span>
                  </div>
                )}
                {listing.floor && (
                  <div className={styles.detailItem}>
                    <span>Kat: {listing.floor}/{listing.totalFloors || '?'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            {listing.features?.length > 0 && (
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
                <div className={styles.ownerName}>{listing.ownerName || 'İlan Sahibi'}</div>
                <div className={styles.memberSince}>
                  Üyelik: {new Date(listing.createdAt).getFullYear()}
                </div>
              </div>
            </div>

            <div className={styles.contactButtons}>
              <button 
                className={styles.contactBtn + ' ' + styles.primary}
                onClick={handleContactOwner}
              >
                <Phone size={18} />
                Telefon: {listing.phone || 'Göster'}
              </button>
              
              {listing.email && (
                <button className={styles.contactBtn + ' ' + styles.secondary}>
                  <Mail size={18} />
                  E-posta Gönder
                </button>
              )}
            </div>

            <div className={styles.listingStats}>
              <div className={styles.stat}>
                <span>İlan No</span>
                <span>#{listing.id}</span>
              </div>
              <div className={styles.stat}>
                <span>Yayın Tarihi</span>
                <span>{new Date(listing.createdAt).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className={styles.stat}>
                <span>Görüntülenme</span>
                <span>{listing.viewCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;