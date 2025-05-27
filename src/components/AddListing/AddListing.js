// src/components/AddListing/AddListing.js - Çoklu fotoğraf yükleme
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Plus, Home, MapPin, DollarSign, Ruler, Calendar, Thermometer, Sofa, Car, Image, Save } from 'lucide-react';
import styles from './AddListing.module.css';

const AddListing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imageUrl, setImageUrl] = useState(''); // URL input için
  
  // ⭐ Backend ile tam uyumlu form data + images array
  const [formData, setFormData] = useState({
    // Temel bilgiler
    title: '',
    description: '',
    price: '',
    area: '',
    bedrooms: '1',
    bathrooms: '1',
    buildingAge: '',
    
    // Konum bilgileri
    city: '',
    district: '',
    neighborhood: '',
    location: '', // Backend için birleştirilmiş konum
    
    // Detaylar
    floor: '',
    totalFloors: '',
    type: 'rent',
    heatingType: 'central',
    furnished: 'unfurnished',
    parkingSpot: false,
    balcony: false,
    
    // Özellikler
    features: [],
    
    // ⭐ Çoklu Resimler
    images: [], // Array of {url, name, size}
    
    // Backend'de eksik olan alanlar (opsiyonel)
    ownerContact: '',
    ownerName: ''
  });

  // Mevcut özellikler listesi
  const availableFeatures = [
    'Asansör', 'Güvenlik', 'Otopark', 'Balkon', 'Teras', 'Bahçe',
    'Havuz', 'Sauna', 'Spor Salonu', 'Jeneratör', 'Merkezi Sistem',
    'Klima', 'Şömine', 'Jakuzi', 'Bulaşık Makinesi', 'Çamaşır Makinesi'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Error temizle
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  // ⭐ Dosya yükleme fonksiyonu
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (formData.images.length + files.length > 5) {
      alert('Maksimum 5 fotoğraf yükleyebilirsiniz');
      return;
    }

    setLoading(true);
    const newImages = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} dosyası 5MB'dan büyük`);
        continue;
      }

      try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const response = await fetch('http://localhost:8080/api/upload/image', {
          method: 'POST',
          body: uploadFormData,
        });

        const result = await response.json();
        
        if (result.success) {
          newImages.push({
            url: result.url,
            name: result.originalName,
            size: result.size
          });
          console.log('✅ Fotoğraf yüklendi:', result.originalName);
        } else {
          console.error('❌ Fotoğraf yükleme hatası:', result.message);
          alert('Fotoğraf yüklenemedi: ' + result.message);
        }
      } catch (error) {
        console.error('❌ Fotoğraf yükleme hatası:', error);
        alert('Fotoğraf yüklenirken hata oluştu: ' + error.message);
      }
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
    
    setLoading(false);
    e.target.value = ''; // Input'u temizle
  };

  // ⭐ Fotoğraf silme fonksiyonu
  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    console.log('🗑️ Fotoğraf silindi, kalan:', formData.images.length - 1);
  };

  // ⭐ URL ile fotoğraf ekleme
  const handleAddImageUrl = () => {
    if (imageUrl && formData.images.length < 5) {
      // URL'in geçerli bir resim olup olmadığını kontrol et
      const img = new Image();
      img.onload = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, { url: imageUrl, name: 'URL Image', size: 0 }]
        }));
        setImageUrl('');
        console.log('✅ URL ile fotoğraf eklendi:', imageUrl);
      };
      img.onerror = () => {
        alert('Geçersiz resim URL\'si');
      };
      img.src = imageUrl;
    }
  };

  // ⭐ Drag & Drop desteği
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      // Fake event oluştur
      const fakeEvent = {
        target: {
          files: files,
          value: ''
        }
      };
      handleImageUpload(fakeEvent);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Zorunlu alanlar
    if (!formData.title.trim()) newErrors.title = 'Başlık gerekli';
    if (!formData.description.trim()) newErrors.description = 'Açıklama gerekli';
    if (!formData.price || parseInt(formData.price) <= 0) newErrors.price = 'Geçerli fiyat gerekli';
    if (!formData.area || parseInt(formData.area) <= 0) newErrors.area = 'Geçerli alan gerekli';
    if (!formData.city.trim()) newErrors.city = 'Şehir gerekli';
    if (!formData.district.trim()) newErrors.district = 'İlçe gerekli';

    // Sayısal değer kontrolleri
    if (formData.buildingAge && parseInt(formData.buildingAge) < 0) {
      newErrors.buildingAge = 'Bina yaşı 0 veya pozitif olmalı';
    }
    if (formData.floor && parseInt(formData.floor) <= 0) {
      newErrors.floor = 'Kat numarası pozitif olmalı';
    }
    if (formData.totalFloors && parseInt(formData.totalFloors) <= 0) {
      newErrors.totalFloors = 'Toplam kat sayısı pozitif olmalı';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('❌ Form validasyon hatası:', errors);
      return;
    }

    setLoading(true);

    try {
      // ⭐ Backend için veriyi hazırla
      const submitData = {
        ...formData,
        // Konum bilgisini birleştir
        location: `${formData.neighborhood}, ${formData.district}, ${formData.city}`.replace(/^,\s*/, ''),
        
        // Sayısal değerleri dönüştür
        price: parseInt(formData.price),
        area: parseInt(formData.area),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        buildingAge: formData.buildingAge ? parseInt(formData.buildingAge) : 0,
        floor: formData.floor ? parseInt(formData.floor) : null,
        totalFloors: formData.totalFloors ? parseInt(formData.totalFloors) : null,
        
        // ⭐ İlk resmi ana resim olarak kullan, yoksa default
        imageUrl: formData.images.length > 0 
          ? formData.images[0].url 
          : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop'
      };

      console.log('📝 İlan gönderiliyor:', submitData);
      console.log('📸 Toplam fotoğraf sayısı:', formData.images.length);

      const response = await fetch('http://localhost:8080/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ İlan başarıyla eklendi:', result.data);
        alert('İlan başarıyla eklendi!');
        navigate('/');
      } else {
        console.error('❌ İlan ekleme hatası:', result.message);
        alert('İlan eklenemedi: ' + (result.message || 'Bilinmeyen hata'));
      }
      
    } catch (error) {
      console.error('❌ API hatası:', error);
      alert('Sunucu hatası: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header - Sabit */}
      <div className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => navigate('/')}
          disabled={loading}
        >
          <ArrowLeft size={20} />
          Geri Dön
        </button>
        
        <h1 className={styles.title}>
          <Plus size={24} />
          Yeni İlan Ekle
        </h1>
        
        <div className={styles.headerInfo}>
          <span className={styles.backendBadge}>🌐 Backend'e Kaydedilecek</span>
        </div>
      </div>

      {/* ⭐ Scrollable Content */}
      <div className={styles.scrollableContent}>
        <form onSubmit={handleSubmit} className={styles.form}>
          
          {/* Temel Bilgiler */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Home size={20} />
              <h2>Temel Bilgiler</h2>
            </div>
            
            <div className={styles.row}>
              <div className={styles.field}>
                <label>İlan Başlığı *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Örn: Merkezi konumda 3+1 daire"
                  className={errors.title ? styles.error : ''}
                  disabled={loading}
                />
                {errors.title && <span className={styles.errorText}>{errors.title}</span>}
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label>Açıklama *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="İlanınızın detaylı açıklamasını yazın..."
                  rows={4}
                  className={errors.description ? styles.error : ''}
                  disabled={loading}
                />
                {errors.description && <span className={styles.errorText}>{errors.description}</span>}
              </div>
            </div>
          </div>

          {/* Fiyat ve Boyut */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <DollarSign size={20} />
              <h2>Fiyat ve Boyut</h2>
            </div>
            
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Fiyat (₺/ay) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="15000"
                  min="0"
                  className={errors.price ? styles.error : ''}
                  disabled={loading}
                />
                {errors.price && <span className={styles.errorText}>{errors.price}</span>}
              </div>
              
              <div className={styles.field}>
                <label>Alan (m²) *</label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  placeholder="120"
                  min="0"
                  className={errors.area ? styles.error : ''}
                  disabled={loading}
                />
                {errors.area && <span className={styles.errorText}>{errors.area}</span>}
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label>Oda Sayısı</label>
                <select
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  {[1,2,3,4,5,6,7,8].map(num => (
                    <option key={num} value={num}>{num}+1</option>
                  ))}
                </select>
              </div>
              
              <div className={styles.field}>
                <label>Banyo Sayısı</label>
                <select
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  {[1,2,3,4,5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              
              <div className={styles.field}>
                <label>Bina Yaşı</label>
                <input
                  type="number"
                  name="buildingAge"
                  value={formData.buildingAge}
                  onChange={handleInputChange}
                  placeholder="5"
                  min="0"
                  className={errors.buildingAge ? styles.error : ''}
                  disabled={loading}
                />
                {errors.buildingAge && <span className={styles.errorText}>{errors.buildingAge}</span>}
              </div>
            </div>
          </div>

          {/* Konum */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <MapPin size={20} />
              <h2>Konum Bilgileri</h2>
            </div>
            
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Şehir *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="İstanbul"
                  className={errors.city ? styles.error : ''}
                  disabled={loading}
                />
                {errors.city && <span className={styles.errorText}>{errors.city}</span>}
              </div>
              
              <div className={styles.field}>
                <label>İlçe *</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleInputChange}
                  placeholder="Şişli"
                  className={errors.district ? styles.error : ''}
                  disabled={loading}
                />
                {errors.district && <span className={styles.errorText}>{errors.district}</span>}
              </div>
              
              <div className={styles.field}>
                <label>Mahalle</label>
                <input
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleInputChange}
                  placeholder="Merkez Mahallesi"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Kat Bilgileri */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Ruler size={20} />
              <h2>Kat Bilgileri</h2>
            </div>
            
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Bulunduğu Kat</label>
                <input
                  type="number"
                  name="floor"
                  value={formData.floor}
                  onChange={handleInputChange}
                  placeholder="3"
                  min="1"
                  className={errors.floor ? styles.error : ''}
                  disabled={loading}
                />
                {errors.floor && <span className={styles.errorText}>{errors.floor}</span>}
              </div>
              
              <div className={styles.field}>
                <label>Toplam Kat</label>
                <input
                  type="number"
                  name="totalFloors"
                  value={formData.totalFloors}
                  onChange={handleInputChange}
                  placeholder="8"
                  min="1"
                  className={errors.totalFloors ? styles.error : ''}
                  disabled={loading}
                />
                {errors.totalFloors && <span className={styles.errorText}>{errors.totalFloors}</span>}
              </div>
            </div>
          </div>

          {/* Detaylar */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Thermometer size={20} />
              <h2>Emlak Detayları</h2>
            </div>
            
            <div className={styles.row}>
              <div className={styles.field}>
                <label>İlan Tipi</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="rent">Kiralık</option>
                  <option value="sale">Satılık</option>
                </select>
              </div>
              
              <div className={styles.field}>
                <label>Isıtma Tipi</label>
                <select
                  name="heatingType"
                  value={formData.heatingType}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="central">Merkezi</option>
                  <option value="individual">Bireysel</option>
                  <option value="floor">Yerden Isıtma</option>
                  <option value="stove">Soba</option>
                  <option value="none">Yok</option>
                </select>
              </div>
              
              <div className={styles.field}>
                <label>Eşya Durumu</label>
                <select
                  name="furnished"
                  value={formData.furnished}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="unfurnished">Boş</option>
                  <option value="semi-furnished">Yarı Eşyalı</option>
                  <option value="furnished">Eşyalı</option>
                </select>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="parkingSpot"
                    checked={formData.parkingSpot}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <Car size={16} />
                  <span>Otopark</span>
                </label>
                
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="balcony"
                    checked={formData.balcony}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <span>🏠 Balkon</span>
                </label>
              </div>
            </div>
          </div>

          {/* Özellikler */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Özellikler</h2>
            </div>
            
            <div className={styles.featuresGrid}>
              {availableFeatures.map(feature => (
                <label key={feature} className={styles.featureLabel}>
                  <input
                    type="checkbox"
                    checked={formData.features.includes(feature)}
                    onChange={() => handleFeatureToggle(feature)}
                    disabled={loading}
                  />
                  <span>{feature}</span>
                </label>
              ))}
            </div>
            
            <div className={styles.selectedFeatures}>
              <p>Seçili özellikler: {formData.features.length}</p>
              {formData.features.map(feature => (
                <span key={feature} className={styles.featureTag}>
                  {feature}
                  <button
                    type="button"
                    onClick={() => handleFeatureToggle(feature)}
                    disabled={loading}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* ⭐ Fotoğraflar - Çoklu Yükleme */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Image size={20} />
              <h2>Fotoğraflar ({formData.images.length}/5)</h2>
            </div>
            
            {/* Drag & Drop Alan */}
            <div 
              className={styles.uploadArea}
              onClick={() => document.getElementById('fileInput').click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Upload size={48} className={styles.uploadIcon} />
              <div className={styles.uploadText}>Fotoğrafları yüklemek için tıklayın</div>
              <div className={styles.uploadSubtext}>
                veya dosyaları buraya sürükleyin (Maksimum 5 fotoğraf, her biri 5MB'dan küçük)
              </div>
              <input
                id="fileInput"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className={styles.hiddenInput}
                disabled={loading}
              />
            </div>

            {/* Yüklenen Fotoğrafların Önizlemesi */}
            {formData.images && formData.images.length > 0 && (
              <div className={styles.imagePreviewContainer}>
                <h4>Yüklenen Fotoğraflar ({formData.images.length}/5)</h4>
                <div className={styles.imagePreviewGrid}>
                  {formData.images.map((image, index) => (
                    <div key={index} className={styles.imagePreview}>
                      <img 
                        src={image.url || image} 
                        alt={`Fotoğraf ${index + 1}`}
                        className={styles.previewImage}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=150&h=150&fit=crop';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className={styles.removeImageBtn}
                        disabled={loading}
                      >
                        <X size={16} />
                      </button>
                      {index === 0 && (
                        <div className={styles.mainImageBadge}>Ana Fotoğraf</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* URL ile Ekleme (Alternatif) */}
            <div className={styles.urlUpload}>
              <label>Veya URL ile ekleyin:</label>
              <div className={styles.urlInputContainer}>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  disabled={loading || !imageUrl || formData.images.length >= 5}
                  className={styles.addUrlBtn}
                >
                  <Plus size={16} />
                  Ekle
                </button>
              </div>
            </div>
          </div>

          {/* İletişim (Opsiyonel) */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>İletişim (Opsiyonel)</h2>
            </div>
            
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Sahip Adı</label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  placeholder="Ad Soyad"
                  disabled={loading}
                />
              </div>
              
              <div className={styles.field}>
                <label>İletişim</label>
                <input
                  type="text"
                  name="ownerContact"
                  value={formData.ownerContact}
                  onChange={handleInputChange}
                  placeholder="Telefon veya E-posta"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

        </form>
      </div>

      {/* ⭐ Sabit Footer */}
      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.formSummary}>
            <span>
              Toplam {Object.keys(formData).filter(key => {
                const value = formData[key];
                return value !== '' && value !== false && !(Array.isArray(value) && value.length === 0);
              }).length} alan dolduruldu
              {formData.images.length > 0 && ` • ${formData.images.length} fotoğraf`}
            </span>
          </div>
          
          <button 
            type="submit" 
            onClick={handleSubmit}
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className={styles.spinner}></div>
                İlan Kaydediliyor...
              </>
            ) : (
              <>
                <Save size={20} />
                İlanı Kaydet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddListing;