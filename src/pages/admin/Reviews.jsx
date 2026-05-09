import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiStar, FiTrash2, FiShield, FiSearch, FiExternalLink } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import { PageLoader } from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';
import clsx from 'clsx';

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <FiStar key={i} className={clsx('text-xs', i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300')} />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState('');
  const queryClient = useQueryClient();

  const params = new URLSearchParams({ page, limit: 20, ...(ratingFilter && { rating: ratingFilter }) }).toString();

  const { data, isLoading } = useQuery({
    queryKey: ['adminReviews', params],
    queryFn: () => api.get(`/admin/reviews?${params}`),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ productId, reviewId }) => api.delete(`/admin/reviews/${productId}/${reviewId}`),
    onSuccess: () => { queryClient.invalidateQueries(['adminReviews']); toast.success('Review deleted'); },
    onError: (err) => toast.error(err.message),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ productId, reviewId }) => api.put(`/admin/reviews/${productId}/${reviewId}/verify`),
    onSuccess: () => { queryClient.invalidateQueries(['adminReviews']); toast.success('Review updated'); },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 text-sm mt-1">Manage customer product reviews</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-1.5 text-sm font-semibold text-gray-700">
          <FiStar className="text-amber-400" />
          {data?.total || 0} Total Reviews
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter by Rating:</span>
          {['', '5', '4', '3', '2', '1'].map(r => (
            <button key={r}
              onClick={() => { setRatingFilter(r); setPage(1); }}
              className={clsx('px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors',
                ratingFilter === r ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')}>
              {r ? `${r}★` : 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <PageLoader /> : (
        <div className="space-y-3">
          {!data?.reviews?.length ? (
            <div className="bg-white border border-gray-200 rounded-xl p-16 text-center text-gray-400">
              No reviews found
            </div>
          ) : (
            data.reviews.map((review) => (
              <div key={review._id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  {/* Product thumbnail */}
                  <div className="flex-shrink-0">
                    <img
                      src={review.productImage || 'https://placehold.co/48x48/f5f5f5/999?text=V'}
                      alt={review.productName}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                    />
                  </div>

                  {/* Review content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Stars rating={review.rating} />
                          <span className="text-xs font-bold text-gray-900">{review.name}</span>
                          {review.isVerifiedPurchase && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full font-semibold">
                              <FiShield className="text-[10px]" /> Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Link to={`/products/${review.productSlug}`} target="_blank"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                            {review.productName} <FiExternalLink className="text-[10px]" />
                          </Link>
                          <span className="text-gray-300">·</span>
                          <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => verifyMutation.mutate({ productId: review.productId, reviewId: review._id })}
                          disabled={verifyMutation.isPending}
                          className={clsx('flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors',
                            review.isVerifiedPurchase
                              ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          )}>
                          <FiShield className="text-xs" />
                          {review.isVerifiedPurchase ? 'Verified' : 'Mark Verified'}
                        </button>
                        <button
                          onClick={() => { if (confirm('Delete this review?')) deleteMutation.mutate({ productId: review.productId, reviewId: review._id }); }}
                          disabled={deleteMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors">
                          <FiTrash2 className="text-xs" /> Delete
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-800 mt-2 leading-relaxed">{review.comment}</p>

                    {review.images?.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {review.images.map((img, i) => (
                          <img key={i} src={img} alt="" className="w-14 h-14 rounded-lg object-cover border border-gray-100" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Pagination currentPage={page} totalPages={data?.pages} onPageChange={setPage} />
    </div>
  );
}
