import React, { useState } from "react";
import styles from "./ListingGrid.module.css";

const dummyListings = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  title: `İlan ${i + 1}`,
  price: `${1000 + i * 100}₺`,
}));

const ListingGrid = () => {
  const [page, setPage] = useState(0);
  const itemsPerPage = 9;

  const startIndex = page * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedListings = dummyListings.slice(startIndex, endIndex);

  const totalPages = Math.ceil(dummyListings.length / itemsPerPage);

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {paginatedListings.map((listing) => (
          <div key={listing.id} className={styles.card}>
            <h3>{listing.title}</h3>
            <p>{listing.price}</p>
          </div>
        ))}
      </div>

      <div className={styles.pagination}>
        <button onClick={() => setPage((p) => Math.max(p - 1, 0))} disabled={page === 0}>
          ← Geri
        </button>
        <span>
          Sayfa {page + 1} / {totalPages}
        </span>
        <button onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))} disabled={page === totalPages - 1}>
          İleri →
        </button>
      </div>
    </div>
  );
};

export default ListingGrid;
