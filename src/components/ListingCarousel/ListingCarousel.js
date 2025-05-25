import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ⭐ SADECE BU EKLENDİ
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { listings } from '../../data/listings.js';
import styles from './ListingCarousel.module.css';

const ListingCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate(); // ⭐ SADECE BU EKLENDİ
  const itemsPerSlide = 9;
  const totalSlides = Math.ceil(listings.length / itemsPerSlide);

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const getCurrentSlideItems = () => {
    const startIndex = currentSlide * itemsPerSlide;
    const endIndex = startIndex + itemsPerSlide;
    return listings.slice(startIndex, endIndex);
  };

  // ⭐ SADECE BU FONKSİYON EKLENDİ
  const handleViewDetails = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  const ListingCard = ({ listing }) => (
    <div className={styles.listingCard}>
      <div className={styles.listingImageContainer}>
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className={styles.listingImage}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop';
          }}
        />
      </div>
      <div className={styles.listingContent}>
        <h3 className={styles.listingTitle}>
          {listing.title}
        </h3>
        <p className={styles.listingDescription}>
          {listing.description}
        </p>
        <div className={styles.listingFooter}>
          <span className={styles.listingPrice}>
            {listing.price}
          </span>
          {/* ⭐ SADECE BU BUTON DEĞİŞTİ */}
          <button 
            className={styles.listingBtn}
            onClick={() => handleViewDetails(listing.id)}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.carouselWrapper}>
        {/* Header */}
        <div className={styles.carouselHeader}>
          <h1 className={styles.carouselTitle}>Property Listings</h1>
          <div className={styles.carouselInfo}>
            <span className={styles.slideCounter}>
              {currentSlide + 1} / {totalSlides}
            </span>
          </div>
        </div>

        {/* Carousel Content with Side Arrows */}
        <div className={styles.carouselContent}>
          {/* Sol Ok */}
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`${styles.sideArrow} ${styles.leftArrow} ${currentSlide === 0 ? styles.disabled : ''}`}
          >
            <ChevronLeft size={32} />
          </button>
          
          {/* Grid */}
          <div className={styles.listingsGrid}>
            {getCurrentSlideItems().map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          
          {/* Sağ Ok */}
          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className={`${styles.sideArrow} ${styles.rightArrow} ${currentSlide === totalSlides - 1 ? styles.disabled : ''}`}
          >
            <ChevronRight size={32} />
          </button>
        </div>

        {/* Slide Indicators */}
        <div className={styles.slideIndicators}>
          {Array.from({ length: totalSlides }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`${styles.indicator} ${index === currentSlide ? styles.active : ''}`}
            />
          ))}
        </div>

        {/* Summary */}
        <div className={styles.carouselSummary}>
          <p className={styles.summaryText}>
            Showing {getCurrentSlideItems().length} of {listings.length} properties
          </p>
        </div>
      </div>
    </div>
  );
};

export default ListingCarousel;