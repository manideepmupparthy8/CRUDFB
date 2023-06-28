import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

export const Pagination = ({ itemsPerPage, totalItems, currentPage, paginate }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getPageRange = () => {
    const rangeSize = 3; // Number of page buttons to display
    const range = [];
    let start = Math.max(1, currentPage - Math.floor(rangeSize / 2));
    let end = start + rangeSize - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - rangeSize + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  };

  const renderPageButtons = () => {
    const pageRange = getPageRange();

    return pageRange.map((pageNumber) => (
      <li
        key={pageNumber}
        className={pageNumber === currentPage ? 'active' : ''}
      >
        <button onClick={() => paginate(pageNumber)}>{pageNumber}</button>
      </li>
    ));
  };

  return (
    <ul className="pagination">
      <li>
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
      </li>
      {renderPageButtons()}
      {totalPages > 7 && currentPage < totalPages - 3 && (
        <li className="ellipsis">
          <span>...</span>
        </li>
      )}
      {totalPages > 1 && currentPage < totalPages - 1 && (
        <li>
          <button onClick={() => paginate(totalPages)}>{totalPages}</button>
        </li>
      )}
      <li>
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </li>
    </ul>
  );
};