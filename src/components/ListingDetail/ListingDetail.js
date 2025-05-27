// src/components/ListingDetail/ListingDetail.js - Full Page Scroll + Google Maps
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Home, Bath, Maximize, Calendar, 
  Phone, Mail, Heart, Share2, RefreshCw, AlertCircle, User, Map
} from 'lucide-react';
import styles from './ListingDetail.module.css';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);

  // Mock resimler
  const mockImages = [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop'
  ];

  // Backend'den ilan detayını çek
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
      
      if (result.success && result.data) {
        const fetchedListing = result.data;
        
        const adaptedListing = {
          ...fetchedListing,
          title: fetchedListing.ismi || fetchedListing.title,
          description: fetchedListing.aciklama || fetchedListing.description,
          price: fetchedListing.fiyat || fetchedListing.price,
          area: fetchedListing.m2 || fetchedListing.area,
          bedrooms: fetchedListing.odaSayisi || fetchedListing.bedrooms,
          buildingAge: fetchedListing.binaYasi || fetchedListing.buildingAge,
          location: fetchedListing.konum || `${fetchedListing.city}/${fetchedListing.district}`,
          bathrooms: fetchedListing.bathrooms || 1,
          floor: fetchedListing.floor || 'Belirtilmemiş',
          totalFloors: fetchedListing.totalFloors || 'Belirtilmemiş',
          type: fetchedListing.type || 'rent',
          heatingType: fetchedListing.heatingType || 'Belirtilmemiş',
          furnished: fetchedListing.furnished || 'Belirtilmemiş',
          parkingSpot: fetchedListing.parkingSpot || false,
          balcony: fetchedListing.balcony || false,
          ownerName: fetchedListing.kimden || 'İlan Sahibi',
          phone: '0532 123 45 67',
          email: 'contact@example.com',
          createdAt: fetchedListing.createdAt || new Date().toISOString(),
          viewCount: fetchedListing.viewCount || Math.floor(Math.random() * 500) + 50,
          features: fetchedListing.features || ['Asansör', 'Güvenlik', 'Otopark'],
          images: mockImages,
          // Konum bilgileri - sadece adres yeterli, koordinat otomatik bulunacak
          address: fetchedListing.konum || `${fetchedListing.city}, ${fetchedListing.district}, İstanbul` || 'Şişli, İstanbul',
          // coordinates artık opsiyonel - yoksa adres üzerinden bulunacak
          coordinates: fetchedListing.coordinates || null
        };
        
        setListing(adaptedListing);
        console.log('✅ İlan detayı başarıyla yüklendi:', adaptedListing.title);
        
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

  // Google Maps API yükle ve haritayı initialize et
  const loadGoogleMaps = () => {
    // Google Maps API script'i zaten yüklenmişse direkt init et
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    // Google Maps API script'ini yükle (Geocoding API de dahil)
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=geometry,places&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    // Global callback fonksiyonu
    window.initMap = initializeMap;
    
    document.head.appendChild(script);
  };

  // ⭐ Gelişmiş Adres -> Koordinat dönüştürme fonksiyonu
  const geocodeAddress = async (address) => {
    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      
      // Geocoding options - Türkiye'ye öncelik ver
      const geocodeOptions = {
        address: address,
        region: 'TR', // Türkiye bölge kodu
        componentRestrictions: {
          country: 'TR' // Sadece Türkiye'de ara
        }
      };
      
      console.log('🔍 Geocoding başlatılıyor:', address);
      
      geocoder.geocode(geocodeOptions, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const result = results[0];
          const location = result.geometry.location;
          const coordinates = {
            lat: location.lat(),
            lng: location.lng()
          };
          
          // Geocoding kalitesini kontrol et
          const locationType = result.geometry.location_type;
          const addressComponents = result.address_components;
          
          console.log('✅ Geocoding başarılı!');
          console.log('📍 Girilen adres:', address);
          console.log('🎯 Bulunan adres:', result.formatted_address);
          console.log('📊 Konum kalitesi:', locationType);
          console.log('🗺️ Koordinatlar:', coordinates);
          
          // Adres componentlerini logla
          const addressInfo = {
            street_number: '',
            route: '',
            neighborhood: '',
            sublocality: '',
            locality: '',
            administrative_area_level_1: '',
            postal_code: ''
          };
          
          addressComponents.forEach(component => {
            const types = component.types;
            if (types.includes('street_number')) addressInfo.street_number = component.long_name;
            if (types.includes('route')) addressInfo.route = component.long_name;
            if (types.includes('neighborhood')) addressInfo.neighborhood = component.long_name;
            if (types.includes('sublocality')) addressInfo.sublocality = component.long_name;
            if (types.includes('locality')) addressInfo.locality = component.long_name;
            if (types.includes('administrative_area_level_1')) addressInfo.administrative_area_level_1 = component.long_name;
            if (types.includes('postal_code')) addressInfo.postal_code = component.long_name;
          });
          
          console.log('🏠 Adres detayları:', addressInfo);
          
          // Kalite kontrolü
          if (locationType === 'ROOFTOP') {
            console.log('🎯 MÜKEMMEL: Tam bina seviyesinde konum bulundu!');
          } else if (locationType === 'RANGE_INTERPOLATED') {
            console.log('✅ İYİ: Sokak seviyesinde yaklaşık konum bulundu');
          } else if (locationType === 'GEOMETRIC_CENTER') {
            console.log('⚠️ ORTA: Bölge merkezi bulundu');
          } else {
            console.log('❗ DÜŞÜKKALİTE: Yaklaşık konum');
          }
          
          resolve({
            coordinates,
            formattedAddress: result.formatted_address,
            locationType: locationType,
            addressComponents: addressInfo
          });
          
        } else {
          console.error('❌ Geocoding hatası:', status);
          console.error('🔍 Bulunamayan adres:', address);
          
          // Hata durumunda varsayılan koordinat döndür
          console.log('🏛️ Varsayılan İstanbul koordinatları kullanılıyor');
          resolve({
            coordinates: {
              lat: 41.0082,
              lng: 28.9784
            },
            formattedAddress: address,
            locationType: 'APPROXIMATE',
            error: `Geocoding hatası: ${status}`
          });
        }
      });
    });
  };

  const initializeMap = async () => {
    if (!mapRef.current || !listing) return;

    try {
      let mapData = {
        coordinates: listing.coordinates,
        formattedAddress: listing.address
      };

      // Eğer koordinat yoksa veya varsayılan değerse, adresi koordinata dönüştür
      if (!mapData.coordinates || 
          (mapData.coordinates.lat === 41.0082 && mapData.coordinates.lng === 28.9784) ||
          (mapData.coordinates.lat === 0 && mapData.coordinates.lng === 0)) {
        
        console.log('🔍 Adres koordinata dönüştürülüyor:', listing.address);
        const geocodeResult = await geocodeAddress(listing.address || listing.location);
        mapData = geocodeResult;
      }

      // Map oluştur
      const map = new window.google.maps.Map(mapRef.current, {
        center: mapData.coordinates,
        zoom: mapData.locationType === 'ROOFTOP' ? 18 : // Tam adres için çok yakın
              mapData.locationType === 'RANGE_INTERPOLATED' ? 17 : // Sokak için yakın
              mapData.locationType === 'GEOMETRIC_CENTER' ? 16 : // Bölge için orta
              15, // Genel için uzak
        styles: [
          // Gelişmiş dark theme
          {
            "elementType": "geometry",
            "stylers": [{"color": "#212121"}]
          },
          {
            "elementType": "labels.icon",
            "stylers": [{"visibility": "off"}]
          },
          {
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#757575"}]
          },
          {
            "elementType": "labels.text.stroke",
            "stylers": [{"color": "#212121"}]
          },
          {
            "featureType": "administrative.locality",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#d59563"}]
          },
          {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#d59563"}]
          },
          {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [{"color": "#263c3f"}]
          },
          {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{"color": "#38414e"}]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [{"color": "#746855"}]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{"color": "#17263c"}]
          }
        ]
      });

      // Konum kalitesine göre marker rengi
      const markerColor = mapData.locationType === 'ROOFTOP' ? '#00ff00' : // Yeşil - mükemmel
                         mapData.locationType === 'RANGE_INTERPOLATED' ? '#d4af37' : // Altın - iyi
                         mapData.locationType === 'GEOMETRIC_CENTER' ? '#ffa500' : // Turuncu - orta
                         '#ff6b6b'; // Kırmızı - düşük kalite

      // Custom marker
      const marker = new window.google.maps.Marker({
        position: mapData.coordinates,
        map: map,
        title: listing.title,
        icon: {
          url: 'data:image/svg+xml;base64,' + btoa(`
            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="${markerColor}" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3" fill="${markerColor}"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(44, 44),
          anchor: new window.google.maps.Point(22, 44)
        },
        animation: window.google.maps.Animation.DROP
      });

      // Gelişmiş Info Window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="color: #333; font-family: 'Arial', sans-serif; max-width: 250px; padding: 8px;">
            <h4 style="margin: 0 0 8px 0; color: #d4af37; font-size: 1.1rem;">${listing.title}</h4>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 0.9rem; line-height: 1.4;">
              📍 ${mapData.formattedAddress || listing.address}
            </p>
            <p style="margin: 0 0 8px 0; font-weight: bold; color: #d4af37; font-size: 1.1rem;">
              💰 ${typeof listing.price === 'number' ? listing.price.toLocaleString() + '₺/ay' : listing.price}
            </p>
            <p style="margin: 0; color: #888; font-size: 0.8rem;">
              🎯 Konum kalitesi: ${
                mapData.locationType === 'ROOFTOP' ? '🟢 Mükemmel (Tam adres)' :
                mapData.locationType === 'RANGE_INTERPOLATED' ? '🟡 İyi (Sokak seviyesi)' :
                mapData.locationType === 'GEOMETRIC_CENTER' ? '🟠 Orta (Bölge merkezi)' :
                '🔴 Yaklaşık'
              }
            </p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      // Otomatik info window açma
      setTimeout(() => {
        infoWindow.open(map, marker);
      }, 1200);

      googleMapRef.current = map;
      console.log('🗺️ Google Maps başarıyla yüklendi');
      console.log('📍 Final koordinatlar:', mapData.coordinates);
      console.log('🏠 Formatlanmış adres:', mapData.formattedAddress);

    } catch (error) {
      console.error('❌ Google Maps yükleme hatası:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchListing();
    } else {
      setError('İlan ID\'si belirtilmemiş');
      setLoading(false);
    }
  }, [id]);

  // Listing yüklendikten sonra Google Maps'i yükle
  useEffect(() => {
    if (listing && !loading && !error) {
      const timer = setTimeout(() => {
        loadGoogleMaps();
      }, 500); // Biraz bekle ki DOM render olsun
      
      return () => clearTimeout(timer);
    }
  }, [listing, loading, error]);

  const handleImageSelect = (index) => {
    setSelectedImage(index);
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    console.log('❤️ Favori durumu:', !isFavorite ? 'Eklendi' : 'Çıkarıldı');
  };

  const handleContactOwner = () => {
    if (listing?.phone) {
      alert(`İlan Sahibi: ${listing.ownerName}\nTelefon: ${listing.phone}`);
    }
  };

  const handleEmailOwner = () => {
    if (listing?.email) {
      window.location.href = `mailto:${listing.email}`;
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

  const handleBack = () => {
    navigate('/');
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
            <button onClick={handleBack} className={styles.backBtn}>
              Ana Sayfaya Dön
            </button>
            <button onClick={handleRefresh} className={styles.retryBtn}>
              <RefreshCw size={16} />
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      
      {/* Header - Sabit */}
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={handleBack}
        >
          <ArrowLeft size={20} />
          Geri Dön
        </button>
        
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

      {/* ⭐ FULL PAGE SCROLL CONTENT */}
      <div className={styles.scrollableContent}>
        <div className={styles.contentWrapper}>
          
          {/* Fotoğraf Galeri */}
          <div className={styles.photoSection}>
            {/* Ana Fotoğraf */}
            <div className={styles.mainPhoto}>
              <img 
                src={listing.images[selectedImage]}
                alt={listing.title}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop';
                }}
              />
              <div className={styles.photoCounter}>
                {selectedImage + 1} / {listing.images.length}
              </div>
            </div>

            {/* Preview Fotoğraflar */}
            <div className={styles.photoPreview}>
              {listing.images.map((image, index) => (
                <div 
                  key={index}
                  className={`${styles.previewItem} ${index === selectedImage ? styles.active : ''}`}
                  onClick={() => handleImageSelect(index)}
                >
                  <img 
                    src={image}
                    alt={`Preview ${index + 1}`}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=150&h=150&fit=crop';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ⭐ GOOGLE MAPS HARİTASI */}
          <div className={styles.mapSection}>
            <div className={styles.mapHeader}>
              <Map size={20} />
              <h3>Konum</h3>
            </div>
            <div 
              ref={mapRef}
              className={styles.mapContainer}
              style={{ height: '400px', width: '100%', borderRadius: '12px' }}
            >
              {/* Google Maps buraya yüklenecek */}
              <div className={styles.mapLoading}>
                <div className={styles.mapSpinner}></div>
                <p>Harita yükleniyor...</p>
              </div>
            </div>
            <div className={styles.addressInfo}>
              <MapPin size={16} />
              <span>{listing.address}</span>
            </div>
          </div>

          {/* İlan Detayları */}
          <div className={styles.detailsGrid}>
            
            {/* Sol Kolon */}
            <div className={styles.leftColumn}>
              
              {/* Başlık ve Fiyat */}
              <div className={styles.titleCard}>
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
              </div>

              {/* Özellikler */}
              <div className={styles.specs}>
                <div className={styles.specItem}>
                  <Home size={20} />
                  <span>{listing.bedrooms}+1</span>
                  <small>Oda</small>
                </div>
                <div className={styles.specItem}>
                  <Bath size={20} />
                  <span>{listing.bathrooms}</span>
                  <small>Banyo</small>
                </div>
                <div className={styles.specItem}>
                  <Maximize size={20} />
                  <span>{listing.area}</span>
                  <small>m²</small>
                </div>
                <div className={styles.specItem}>
                  <Calendar size={20} />
                  <span>{listing.buildingAge}</span>
                  <small>Yaş</small>
                </div>
              </div>

              {/* Açıklama */}
              <div className={styles.description}>
                <h3>Açıklama</h3>
                <p>{listing.description}</p>
              </div>

              {/* Detaylar */}
              <div className={styles.details}>
                <h3>Detaylar</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span>İlan Tipi:</span>
                    <span>{listing.type === 'rent' ? 'Kiralık' : 'Satılık'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span>Kat:</span>
                    <span>{listing.floor}/{listing.totalFloors}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span>Isıtma:</span>
                    <span>{listing.heatingType}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span>Eşya:</span>
                    <span>{listing.furnished}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span>Otopark:</span>
                    <span>{listing.parkingSpot ? 'Var' : 'Yok'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span>Balkon:</span>
                    <span>{listing.balcony ? 'Var' : 'Yok'}</span>
                  </div>
                </div>
              </div>

              {/* Özellikler */}
              {listing.features && listing.features.length > 0 && (
                <div className={styles.features}>
                  <h3>Özellikler</h3>
                  <div className={styles.featureTags}>
                    {listing.features.map((feature, index) => (
                      <span key={index} className={styles.featureTag}>
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Sağ Kolon - İletişim */}
            <div className={styles.rightColumn}>
              <div className={styles.contact}>
                <h3>İlan Sahibi</h3>
                <div className={styles.ownerInfo}>
                  <User size={20} />
                  <span>{listing.ownerName}</span>
                </div>
                <div className={styles.contactButtons}>
                  <button onClick={handleContactOwner} className={styles.phoneBtn}>
                    <Phone size={16} />
                    Telefonu Göster
                  </button>
                  <button onClick={handleEmailOwner} className={styles.emailBtn}>
                    <Mail size={16} />
                    E-posta Gönder
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ListingDetail;