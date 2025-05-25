// src/components/AddListing/AddListing.js
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react';
import styles from './AddListing.module.css';

const AddListing = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    imageUrl: '',
    imageFile: null,
    type: 'rent',
    bedrooms: '1',
    bathrooms: '1',
    area: '',
    location: '',
    city: '',
    district: '',
    neighborhood: '',
    floor: '',
    totalFloors: '',
    buildingAge: '',
    heatingType: 'central',
    furnished: 'unfurnished',
    parkingSpot: false,
    balcony: false,
    features: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          imageFile: 'Dosya boyutu 5MB\'dan küçük olmalı'
        }));
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          imageFile: 'Sadece resim dosyaları yüklenebilir'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        imageFile: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.imageFile) {
        setErrors(prev => ({
          ...prev,
          imageFile: ''
        }));
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      imageFile: null,
      imageUrl: ''
    }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Başlık gerekli';
    if (!formData.description.trim()) newErrors.description = 'Açıklama gerekli';
    if (!formData.price.trim()) newErrors.price = 'Fiyat gerekli';
    if (!formData.location.trim()) newErrors.location = 'Adres gerekli';
    if (!formData.city.trim()) newErrors.city = 'Şehir gerekli';
    if (!formData.district.trim()) newErrors.district = 'İlçe gerekli';
    if (!formData.area.trim()) newErrors.area = 'Alan bilgisi gerekli';
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to first error
      const firstErrorElement = document.querySelector(`.${styles.error}`);
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call with FormData for file upload
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'features') {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'imageFile' && formData[key]) {
          submitData.append('image', formData[key]);
        } else {
          submitData.append(key, formData[key]);
        }
      });

      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('New listing created with data:', Object.fromEntries(submitData));
      
      // Redirect back to main page
      navigate('/');
      
    } catch (error) {
      console.error('Error creating listing:', error);
      setErrors({ submit: 'İlan eklenirken bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableFeatures = [
    'Havuz', 'Sauna', 'Spor Salonu', 'Güvenlik', 'Asansör', 
    'Jeneratör', 'Kamerali Güvenlik', 'Kapıcı', 'Otopark',
    'Kapalı Otopark', 'Bahçe', 'Teras', 'Balkon', 'Jakuzi'
  ];

  const heatingTypes = [
    { value: 'central', label: 'Merkezi' },
    { value: 'individual', label: 'Bireysel' },
    { value: 'floor', label: 'Yerden Isıtma' },
    { value: 'electric', label: 'Elektrikli' },
    { value: 'gas', label: 'Doğalgaz' },
    { value: 'none', label: 'Yok' }
  ];

  const furnishedOptions = [
    { value: 'unfurnished', label: 'Boş' },
    { value: 'semi-furnished', label: 'Yarı Eşyalı' },
    { value: 'furnished', label: 'Eşyalı' }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <button 
            className={styles.backBtn}
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={20} />
            Geri Dön
          </button>
          <h1 className={styles.title}>Yeni İlan Ekle</h1>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.scrollContainer}>
            
            {/* Image Upload Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Fotoğraf</h3>
              
              <div className={styles.imageUploadSection}>
                {imagePreview ? (
                  <div className={styles.imagePreview}>
                    <img src={imagePreview} alt="Preview" className={styles.previewImage} />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className={styles.removeImageBtn}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div 
                    className={styles.uploadArea}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon size={48} className={styles.uploadIcon} />
                    <p className={styles.uploadText}>Fotoğraf Yükle</p>
                    <p className={styles.uploadSubtext}>veya buraya sürükleyin</p>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className={styles.hiddenInput}
                />
                
                {errors.imageFile && <span className={styles.errorText}>{errors.imageFile}</span>}
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>veya Resim URL'si</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="https://example.com/image.jpg"
                    disabled={!!formData.imageFile}
                  />
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Temel Bilgiler</h3>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>İlan Başlığı *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`${styles.input} ${errors.title ? styles.error : ''}`}
                  placeholder="Örn: Şişli'de Lüks 3+1 Daire"
                />
                {errors.title && <span className={styles.errorText}>{errors.title}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Açıklama *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`${styles.textarea} ${errors.description ? styles.error : ''}`}
                  placeholder="İlan detaylarını yazın... (Konum, özellikler, çevre bilgileri vb.)"
                  rows="5"
                />
                {errors.description && <span className={styles.errorText}>{errors.description}</span>}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Fiyat *</label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.price ? styles.error : ''}`}
                    placeholder="Örn: 15.000 ₺"
                  />
                  {errors.price && <span className={styles.errorText}>{errors.price}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>İlan Tipi</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="rent">Kiralık</option>
                    <option value="sale">Satılık</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Konum Bilgileri</h3>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Şehir *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.city ? styles.error : ''}`}
                    placeholder="Örn: İstanbul"
                  />
                  {errors.city && <span className={styles.errorText}>{errors.city}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>İlçe *</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.district ? styles.error : ''}`}
                    placeholder="Örn: Beşiktaş"
                  />
                  {errors.district && <span className={styles.errorText}>{errors.district}</span>}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Mahalle</label>
                <input
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="Örn: Etiler Mahallesi"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Adres *</label>
                <textarea
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`${styles.textarea} ${errors.location ? styles.error : ''}`}
                  placeholder="Detaylı adres bilgisi..."
                  rows="3"
                />
                {errors.location && <span className={styles.errorText}>{errors.location}</span>}
              </div>
            </div>

            {/* Property Details */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Emlak Detayları</h3>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Oda Sayısı</label>
                  <select
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    <option value="1">1+0</option>
                    <option value="2">1+1</option>
                    <option value="3">2+1</option>
                    <option value="4">3+1</option>
                    <option value="5">4+1</option>
                    <option value="6">5+1 ve üzeri</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Banyo Sayısı</label>
                  <select
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    {[1,2,3,4,5].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Net Alan (m²) *</label>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    className={`${styles.input} ${errors.area ? styles.error : ''}`}
                    placeholder="120"
                  />
                  {errors.area && <span className={styles.errorText}>{errors.area}</span>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Kat</label>
                  <input
                    type="number"
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="3"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Toplam Kat</label>
                  <input
                    type="number"
                    name="totalFloors"
                    value={formData.totalFloors}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="8"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Bina Yaşı</label>
                  <input
                    type="number"
                    name="buildingAge"
                    value={formData.buildingAge}
                    onChange={handleInputChange}
                    className={styles.input}
                    placeholder="5"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Isıtma Tipi</label>
                  <select
                    name="heatingType"
                    value={formData.heatingType}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    {heatingTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Eşya Durumu</label>
                  <select
                    name="furnished"
                    value={formData.furnished}
                    onChange={handleInputChange}
                    className={styles.select}
                  >
                    {furnishedOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Features */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Ek Özellikler</h3>
              
              <div className={styles.checkboxRow}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="parkingSpot"
                    checked={formData.parkingSpot}
                    onChange={handleInputChange}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>Otopark</span>
                </label>

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="balcony"
                    checked={formData.balcony}
                    onChange={handleInputChange}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxText}>Balkon</span>
                </label>
              </div>
            </div>

            {/* Building Features */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Site/Bina Özellikleri</h3>
              <div className={styles.featuresGrid}>
                {availableFeatures.map(feature => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => handleFeatureToggle(feature)}
                    className={`${styles.featureBtn} ${
                      formData.features.includes(feature) ? styles.active : ''
                    }`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {errors.submit && (
            <div className={styles.submitError}>
              {errors.submit}
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => navigate('/')}
              className={styles.cancelBtn}
              disabled={isSubmitting}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitBtn}
            >
              {isSubmitting ? 'Ekleniyor...' : 'İlan Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddListing;