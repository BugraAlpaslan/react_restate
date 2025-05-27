// src/components/EditListing/EditListing.js - İlan Düzenleme Komponenti
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Upload, X, Plus, Home, MapPin, DollarSign, 
  Ruler, Calendar, Thermometer, Sofa, Car, Image, Save, 
  RefreshCw, AlertCircle 
} from 'lucide-react';
import styles from './EditListing.module.css';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [imageUrl, setImageUrl] = useState('');
  const [originalData, setOriginalData] = useState(null);
  
  // Form data - AddListing ile aynı yapı
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    area: '',
    bedrooms: '1',
    bathrooms: '1',
    buildingAge: '',
    city: '',
    district: '',
    neighborhood: '',
    location: '',
    floor: '',
    totalFloors: '',
    type: 'rent',
    heatingType: 'central',
    furnished: 'unfurnished',
    parkingSpot: false,
    balcony: false,
    features: [],
    images: [],
    ownerContact: '',
    ownerName: ''
  });

  // Mevcut özellikler listesi
  const availableFeatures = [
    'Asansör', 'Güvenlik', 'Otopark', 'Balkon', 'Teras', 'Bahçe',
    'Havuz', 'Sauna', 'Spor Salonu', 'Jeneratör', 'Merkezi Sistem',
    'Klima', 'Şömine', 'Jakuzi', 'Bulaşık Makinesi', 'Çamaşır Makinesi'
  ];

  // ⭐ İlan verilerini backend'den yükle
  const loadListingData = async () => {
    try {
      setLoading(true);
      console.log('📝 İlan düzenleme verileri yükleniyor, ID:', id);

      const response = await fetch(`http://localhost:8080/api/listings/${id}/edit`);
      const result = await response.json();

      if (result.success && result.data) {
        const data = result.data;
        
        // Form verilerini set et
        setFormData({
          title: data.title || '',
          description: data.description || '',
          price: data.price?.toString() || '',
          area: data.area?.toString() || '',
          bedrooms: data.bedrooms?.toString() || '1',
          bathrooms: data.bathrooms?.toString() || '1',
          buildingAge: data.buildingAge?.toString() || '',
          city: data.city || '',
          district: data.district || '',
          neighborhood: data.neighborhood || '',
          location: data.location || '',
          floor: data.floor?.toString() || '',
          totalFloors: data.totalFloors?.toString() || '',
          type: data.type || 'rent',
          heatingType: data.heatingType || 'central',
          furnished: data.furnished || 'unfurnished',
          parkingSpot: data.parkingSpot || false,
          balcony: data.balcony || false,
          features: data.features || [],
          images: data.images ? data.images.map(url => ({ url, name: 'Mevcut Resim', size: 0 })) : [],
          ownerContact: '',
          ownerName: ''
        });

        setOriginalData(data);
        console.log('✅ İlan verileri yüklendi:', data.title);
        
      } else {
        console.error('❌ İlan bulunamadı:', result.message);
        alert('İlan bulunamadı!');
        navigate('/my-listings');
      }
      
    } catch (error) {
      console.error('❌ İlan yükleme hatası:', error);
      alert('İlan yüklenirken hata oluştu: ' + error.message);
      navigate('/my-listings');
    } finally {
      setLoading(false);
    }
  };

  // Component mount'ta verileri yükle
  useEffect(() => {
    if (id) {
      loadListingData();
    } else {
      navigate('/my-listings');
    }
  }, [id]);

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

  // ⭐ Fotoğraf yükleme (AddListing'den kopyalandı)
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (formData.images.length + files.length > 5) {
      alert('Maksimum 5 fotoğraf yükleyebilirsiniz');
      return;
    }

    setSaving(true);
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
    
    setSaving(false);
    e.target.value = '';
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddImageUrl = () => {
    if (imageUrl && formData.images.length < 5) {
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Başlık gerekli';
    if (!formData.description.trim()) newErrors.description = 'Açıklama gerekli';
    if (!formData.price || parseInt(formData.price) <= 0) newErrors.price = 'Geçerli fiyat gerekli';
    if (!formData.area || parseInt(formData.area) <= 0) newErrors.area = 'Geçerli alan gerekli';
    if (!formData.city.trim()) newErrors.city = 'Şehir gerekli';
    if (!formData.district.trim()) newErrors.district = 'İlçe gerekli';

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

  // ⭐ Form submit - güncelleme
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('❌ Form validasyon hatası:', errors);
      return;
    }

    setSaving(true);

    try {
      // Backend için veriyi hazırla
      const submitData = {
        ...formData,
        location: `${formData.neighborhood}, ${formData.district}, ${formData.city}`.replace(/^,\s*/, ''),
        price: parseInt(formData.price),
        area: parseInt(formData.area),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        buildingAge: formData.buildingAge ? parseInt(formData.buildingAge) : 0,
        floor: formData.floor ? parseInt(formData.floor) : null,
        totalFloors: formData.totalFloors ? parseInt(formData.totalFloors) : null,
        imageUrl: formData.images.length > 0 
          ? formData.images[0].url 
          : 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop'
      };

      console.log('✏️ İlan güncelleniyor:', submitData);

      const response = await fetch(`http://localhost:8080/api/listings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ İlan başarıyla güncellendi:', result.data);
        alert('İlan başarıyla güncellendi!');
        navigate('/my-listings');
      } else {
        console.error('❌ İlan güncelleme hatası:', result.message);
        alert('İlan güncellenemedi: ' + (result.message || 'Bilinmeyen hata'));
      }
      
    } catch (error) {
      console.error('❌ API hatası:', error);
      alert('Sunucu hatası: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

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
      const fakeEvent = {
        target: {
          files: files,
          value: ''
        }
      };
      handleImageUpload(fakeEvent);
    }
  };

  // Loading durumu
  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: '20px',
          color: 'rgba(201, 169, 110, 0.8)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(201, 169, 110, 0.2)',
            borderTop: '3px solid rgba(201, 169, 110, 0.8)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <h2>İlan düzenleme verileri yükleniyor...</h2>
          <p>Backend'den veriler getiriliyor</p>
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
          onClick={() => navigate('/my-listings')}
          disabled={saving}
        >
          <ArrowLeft size={20} />
          İlanlarıma Dön
        </button>
        
        <h1 className={styles.title}>
          <Plus size={24} />
          İlan Düzenle
        </h1>
        
        <div className={styles.headerInfo}>
          <span className={styles.backendBadge}>
            ✏️ ID: {id} Güncelleniyor
          </span>
        </div>
      </div>

      {/* Scrollable Content */}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                  disabled={saving}
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
                    disabled={saving}
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
                    disabled={saving}
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
                    disabled={saving}
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
                    disabled={saving}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Fotoğraflar */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Image size={20} />
              <h2>Fotoğraflar ({formData.images.length}/5)</h2>
            </div>
            
            {/* Drag & Drop Alan */}
            <div 
              className={styles.uploadArea}
              onClick={() => document.getElementById('editFileInput').click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Upload size={48} className={styles.uploadIcon} />
              <div className={styles.uploadText}>Fotoğrafları yüklemek için tıklayın</div>
              <div className={styles.uploadSubtext}>
                veya dosyaları buraya sürükleyin (Maksimum 5 fotoğraf, her biri 5MB'dan küçük)
              </div>
              <input
                id="editFileInput"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className={styles.hiddenInput}
                disabled={saving}
              />
            </div>

            {/* Mevcut Fotoğrafların Önizlemesi */}
            {formData.images && formData.images.length > 0 && (
              <div className={styles.imagePreviewContainer}>
                <h4>Mevcut Fotoğraflar ({formData.images.length}/5)</h4>
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
                        disabled={saving}
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

            {/* URL ile Ekleme */}
            <div className={styles.urlUpload}>
              <label>Veya URL ile ekleyin:</label>
              <div className={styles.urlInputContainer}>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  disabled={saving || !imageUrl || formData.images.length >= 5}
                  className={styles.addUrlBtn}
                >
                  <Plus size={16} />
                  Ekle
                </button>
              </div>
            </div>
          </div>

        </form>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.formSummary}>
            <span>
              {originalData ? `"${originalData.title}" düzenleniyor` : 'İlan düzenleniyor'}
              {formData.images.length > 0 && ` • ${formData.images.length} fotoğraf`}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="button"
              onClick={() => navigate('/my-listings')}
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 24px',
                background: 'rgba(156, 163, 175, 0.1)',
                border: '1px solid rgba(156, 163, 175, 0.3)',
                borderRadius: '12px',
                color: 'rgba(156, 163, 175, 0.9)',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <X size={16} />
              İptal
            </button>
            
            <button 
              type="submit" 
              onClick={handleSubmit}
              className={styles.submitBtn}
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className={styles.spinner}></div>
                  Güncellemeler Kaydediliyor...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Değişiklikleri Kaydet
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditListing;