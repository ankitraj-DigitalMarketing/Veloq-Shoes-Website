import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiSearch, FiUser } from 'react-icons/fi';
import api from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import { PageLoader } from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function AdminCustomers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminCustomers', search, page],
    queryFn: () => api.get(`/admin/customers?search=${search}&page=${page}&limit=20`),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => api.put(`/admin/customers/${id}/toggle-block`),
    onSuccess: () => { queryClient.invalidateQueries(['adminCustomers']); toast.success('Customer updated'); },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customers</h1>

      <div className="card p-4 flex gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..." className="input-field pl-9 py-2 text-sm" />
        </div>
      </div>

      {isLoading ? <PageLoader /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-500">Customer</th>
                <th className="p-4 text-left font-semibold text-gray-500 hidden md:table-cell">Phone</th>
                <th className="p-4 text-left font-semibold text-gray-500 hidden lg:table-cell">Joined</th>
                <th className="p-4 text-center font-semibold text-gray-500">Status</th>
                <th className="p-4 text-right font-semibold text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.customers?.map((customer) => (
                <tr key={customer._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold">
                        {customer.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{customer.name}</p>
                        <p className="text-xs text-gray-400">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-500 hidden md:table-cell">{customer.phone || '-'}</td>
                  <td className="p-4 text-gray-500 hidden lg:table-cell">{formatDate(customer.createdAt)}</td>
                  <td className="p-4 text-center">
                    <span className={clsx('badge text-xs px-2 py-1', customer.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700')}>
                      {customer.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleMutation.mutate(customer._id)}
                      className={clsx('text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
                        customer.isBlocked
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-600 hover:bg-red-200')}>
                      {customer.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data?.customers?.length === 0 && (
            <div className="text-center py-16 text-gray-400">No customers found</div>
          )}
        </div>
      )}
    </div>
  );
}
