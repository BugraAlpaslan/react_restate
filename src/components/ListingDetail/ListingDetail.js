// src/components/ListingDetail/ListingDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Home, Bath, Maximize, Calendar, 
  Thermometer, Sofa, Car, Shield, Phone, Mail, Share2,
  Heart
} from 'lucide-react';
import styles from './ListingDetail.module.css';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // ⭐ Mock data'dan listing al
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        
        // Mock data import et
        const { listings } = await import('../../data/listings.js');
        const foundListing = listings.find(l => l.id === parseInt(id));
        
        if (foundListing) {
          // Mock data'yı detay formatına uyarla
          const adaptedListing = {
            ...foundListing,
            location: `İstanbul, ${foundListing.title.includes('Downtown') ? 'Şişli' : 'Beşiktaş'}`,
            bedrooms: foundListing.title.includes('Studio') ? 1 : 3,
            bathrooms: 2,
            area: foundListing.title.includes('Studio') ? 45 : 120,
            buildingAge: 5,
            floor: 3,
            totalFloors: 8,
            heatingType: 'Merkezi',
            furnished: 'Eşyalı',
            parkingSpot: true,
            ownerName: 'Mehmet Yılmaz',
            phone: '0532 123 45 67',
            email: 'mehmet@example.com',
            createdAt: new Date().toISOString(),
            viewCount: 250,
            features: ['Asansör', 'Güvenlik', 'Otopark', 'Balkon'],
            images: [foundListing.imageUrl]
          };
          
          setListing(adaptedListing);
        } else {
          setError('İlan bulunamadı');
        }
        
      } catch (err) {
        setError('İlan yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
  };

  const handleContactOwner = () => {
    alert(`İlan Sahibi: ${listing?.ownerName}\nTelefon: ${listing?.phone}`);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link kopyalandı!');
    } catch (err) {
      alert('Link kopyalanamadı');
    }
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
          <p>{error}</p>
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
            <div className={styles.price}>{listing.price}</div>
            
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
                <div className={styles.detailItem}>
                  <Car size={16} />
                  <span>Otopark Var</span>
                </div>
                <div className={styles.detailItem}>
                  <span>Kat: {listing.floor}/{listing.totalFloors}</span>
                </div>
              </div>
            </div>

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
                <span>#{listing.id}</span>
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