import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2
  );
  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 text-xs font-semibold border border-gray-200 rounded-lg text-mid disabled:opacity-30 hover:border-gray-400 hover:text-ink transition-all"
      >
        ← Prev
      </button>
      {pages.map((page, i) => (
        <span key={page}>
          {i > 0 && pages[i - 1] !== page - 1 && (
            <span className="px-2 text-mid text-xs">...</span>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onPageChange(page)}
            className={clsx('w-9 h-9 text-xs font-bold rounded-lg transition-all',
              currentPage === page
                ? 'bg-ink text-white'
                : 'border border-gray-200 text-mid hover:border-gray-400 hover:text-ink'
            )}
          >
            {page}
          </motion.button>
        </span>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 text-xs font-semibold border border-gray-200 rounded-lg text-mid disabled:opacity-30 hover:border-gray-400 hover:text-ink transition-all"
      >
        Next →
      </button>
    </div>
  );
}
