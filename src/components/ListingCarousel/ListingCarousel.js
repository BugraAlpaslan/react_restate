import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
// ...existing code...
import listings from '../../data/listings.js';
// ...existing code...
import './ListingCarousel.module.css';

const ListingCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
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

  const ListingCard = ({ listing }) => (
    <div className="listing-card">
      <div className="listing-image-container">
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="listing-image"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop';
          }}
        />
      </div>
      <div className="listing-content">
        <h3 className="listing-title">
          {listing.title}
        </h3>
        <p className="listing-description">
          {listing.description}
        </p>
        <div className="listing-footer">
          <span className="listing-price">
            {listing.price}
          </span>
          <button className="listing-btn">
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="carousel-container">
      <div className="carousel-wrapper">
        {/* Header */}
        <div className="carousel-header">
          <h1 className="carousel-title">Property Listings</h1>
          <div className="carousel-controls">
            <span className="slide-counter">
              Slide {currentSlide + 1} of {totalSlides}
            </span>
            <div className="nav-buttons">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className={`nav-btn ${currentSlide === 0 ? 'disabled' : ''}`}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextSlide}
                disabled={currentSlide === totalSlides - 1}
                className={`nav-btn ${currentSlide === totalSlides - 1 ? 'disabled' : ''}`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Content */}
        <div className="carousel-content">
          <div className="listings-grid">
            {getCurrentSlideItems().map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="slide-indicators">
          {Array.from({ length: totalSlides }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
            />
          ))}
        </div>

        {/* Summary */}
        <div className="carousel-summary">
          <p className="summary-text">
            Showing {getCurrentSlideItems().length} of {listings.length} properties
          </p>
        </div>
      </div>
    </div>
  );
};

export default ListingCarousel;