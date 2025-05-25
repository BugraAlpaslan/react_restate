import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // ⭐ Navigation için eklendi
import styles from "./ListingGrid.module.css";

const dummyListings = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  title: `İlan ${i + 1}`,
  price: `${1000 + i * 100}₺`,
}));

const ListingGrid = () => {
  const [page, setPage] = useState(0);
  const navigate = useNavigate(); // ⭐ Navigation hook'u eklendi
  const itemsPerPage = 9;

  const startIndex = page * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedListings = dummyListings.slice(startIndex, endIndex);

  const totalPages = Math.ceil(dummyListings.length / itemsPerPage);

  // ⭐ Kart tıklama fonksiyonu eklendi
  const handleCardClick = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  // ⭐ Klavye erişilebilirliği için keydown handler
  const handleCardKeyDown = (event, listingId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick(listingId);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {paginatedListings.map((listing) => (
          <div 
            key={listing.id} 
            className={styles.card}
            onClick={() => handleCardClick(listing.id)} // ⭐ Tıklama eventi eklendi
            onKeyDown={(e) => handleCardKeyDown(e, listing.id)} // ⭐ Klavye erişilebilirliği
            style={{ cursor: 'pointer' }} // ⭐ Cursor pointer eklendi
            tabIndex={0} // ⭐ Klavye erişilebilirliği için
            role="button" // ⭐ Accessibility için
            aria-label={`${listing.title} ilanını görüntüle`} // ⭐ Screen reader için
          >
            <h3>{listing.title}</h3>
            <p>{listing.price}</p>
            
            {/* ⭐ Görsel geri bildirim için hover efekti eklenebilir */}
            <div className={styles.cardOverlay}>
              <span className={styles.viewDetailsText}>Detayları Gör</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.pagination}>
        <button 
          onClick={() => setPage((p) => Math.max(p - 1, 0))} 
          disabled={page === 0}
          aria-label="Önceki sayfa"
        >
          ← Geri
        </button>
        <span>
          Sayfa {page + 1} / {totalPages}
        </span>
        <button 
          onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))} 
          disabled={page === totalPages - 1}
          aria-label="Sonraki sayfa"
        >
          İleri →
        </button>
      </div>
    </div>
  );
};

export default ListingGrid;