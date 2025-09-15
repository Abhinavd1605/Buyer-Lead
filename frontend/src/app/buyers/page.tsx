"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { buyersAPI, type Buyer, type BuyerFilters } from "@/lib/api";
import { 
  getDisplayValue, 
  CITY_DISPLAY, 
  PROPERTY_TYPE_DISPLAY, 
  STATUS_DISPLAY, 
  BHK_DISPLAY, 
  PURPOSE_DISPLAY,
  formatCurrency,
  formatDate,
  debounce 
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Users, 
  Building2, 
  LogOut,
  Eye,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  X
} from "lucide-react";
import toast from "react-hot-toast";
import ImportModal from "@/components/import-modal";

export default function BuyersPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const [filters, setFilters] = useState<BuyerFilters>({
    page: 1,
    limit: 10,
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      setFilters(prev => ({ ...prev, search: term, page: 1 }));
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['buyers', filters],
    queryFn: () => buyersAPI.getList(filters),
  });

  const handleFilterChange = (key: keyof BuyerFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
      page: 1
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleExport = async () => {
    try {
      toast.loading('Preparing export...');
      
      // Try the API export first
      try {
        const blob = await buyersAPI.exportCSV(filters);
        
        if (blob && blob.size > 0) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `buyers-export-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          toast.dismiss();
          toast.success('📊 Export completed successfully!');
          return;
        }
      } catch (apiError) {
        console.warn('API export failed, using client-side export:', apiError);
      }
      
      // Fallback to client-side export
      if (!data?.data.length) {
        toast.dismiss();
        toast.error('No data to export');
        return;
      }
      
      const csvHeader = 'fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status,updatedAt\n';
      const csvRows = data.data.map((buyer: any) => {
        const row = [
          `"${buyer.fullName || ''}"`,
          `"${buyer.email || ''}"`,
          `"${buyer.phone || ''}"`,
          `"${buyer.city || ''}"`,
          `"${buyer.propertyType || ''}"`,
          `"${buyer.bhk || ''}"`,
          `"${buyer.purpose || ''}"`,
          `"${buyer.budgetMin || ''}"`,
          `"${buyer.budgetMax || ''}"`,
          `"${buyer.timeline || ''}"`,
          `"${buyer.source || ''}"`,
          `"${(buyer.notes || '').replace(/"/g, '""')}"`,
          `"${buyer.tags ? buyer.tags.join(', ') : ''}"`,
          `"${buyer.status || ''}"`,
          `"${buyer.updatedAt ? new Date(buyer.updatedAt).toISOString() : ''}"`
        ];
        return row.join(',');
      }).join('\n');
      
      const csvContent = csvHeader + csvRows;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `buyers-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.dismiss();
      toast.success('📊 Export completed successfully!');
      
    } catch (error) {
      toast.dismiss();
      console.error('Export error:', error);
      toast.error('Export failed. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this buyer?')) return;
    
    try {
      await buyersAPI.delete(id);
      toast.success('Buyer deleted successfully');
      refetch();
    } catch {
      toast.error('Failed to delete buyer');
    }
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 10, sortBy: 'updatedAt', sortOrder: 'desc' });
    setSearchTerm('');
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Clean Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">LeadFlow Pro</h1>
                  <p className="text-xs text-gray-500">Real Estate CRM</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">{user.role}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Buyer Leads</h2>
            <p className="text-gray-600">Manage and track your real estate prospects</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="secondary" onClick={() => setShowImportModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button variant="primary" onClick={() => router.push('/buyers/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Add New Lead
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border p-6 mb-8">
          <div className="flex flex-col gap-6">
            {/* Search Bar */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by name, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="w-5 h-5" />}
                />
              </div>
              <Button 
                variant="secondary" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="border-t border-gray-100 pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="input-label">City</label>
                    <select 
                      className="input"
                      value={filters.city || ''}
                      onChange={(e) => handleFilterChange('city', e.target.value)}
                    >
                      <option value="">All Cities</option>
                      {Object.entries(CITY_DISPLAY).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="input-label">Property Type</label>
                    <select 
                      className="input"
                      value={filters.propertyType || ''}
                      onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                    >
                      <option value="">All Types</option>
                      {Object.entries(PROPERTY_TYPE_DISPLAY).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="input-label">Status</label>
                    <select 
                      className="input"
                      value={filters.status || ''}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      {Object.entries(STATUS_DISPLAY).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="input-label">Timeline</label>
                    <select 
                      className="input"
                      value={filters.timeline || ''}
                      onChange={(e) => handleFilterChange('timeline', e.target.value)}
                    >
                      <option value="">All Timelines</option>
                      <option value="ZERO_TO_THREE_MONTHS">0-3 months</option>
                      <option value="THREE_TO_SIX_MONTHS">3-6 months</option>
                      <option value="MORE_THAN_SIX_MONTHS">6+ months</option>
                      <option value="EXPLORING">Exploring</option>
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button 
                      variant="secondary"
                      className="w-full"
                      onClick={clearFilters}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="bg-white rounded-lg border p-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading buyers...</p>
            </div>
          </div>
        ) : !data ? (
          <div className="bg-white rounded-lg border p-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">Failed to load buyers</p>
              <Button onClick={() => refetch()}>Try Again</Button>
            </div>
          </div>
        ) : !data?.data.length ? (
          <div className="bg-white rounded-lg border p-12">
            <div className="text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No buyers found</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first buyer lead or adjust your filters.</p>
              <Button variant="primary" onClick={() => router.push('/buyers/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Lead
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Modern Data Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {data.data.map((buyer: Buyer) => (
                <div key={buyer.id} className="bg-white rounded-lg border hover:shadow-lg transition-all duration-300">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{buyer.fullName}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          {getDisplayValue(buyer.city, CITY_DISPLAY)}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        buyer.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                        buyer.status === 'QUALIFIED' ? 'bg-green-100 text-green-800' :
                        buyer.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-800' :
                        buyer.status === 'VISITED' ? 'bg-purple-100 text-purple-800' :
                        buyer.status === 'NEGOTIATION' ? 'bg-orange-100 text-orange-800' :
                        buyer.status === 'CONVERTED' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getDisplayValue(buyer.status, STATUS_DISPLAY)}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a href={`tel:${buyer.phone}`} className="text-blue-600 hover:underline">
                          {buyer.phone}
                        </a>
                      </div>
                      {buyer.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a href={`mailto:${buyer.email}`} className="text-blue-600 hover:underline">
                            {buyer.email}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Property Details */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Property:</span>
                          <div className="font-medium text-gray-900">
                            {getDisplayValue(buyer.propertyType, PROPERTY_TYPE_DISPLAY)}
                            {buyer.bhk && ` - ${getDisplayValue(buyer.bhk, BHK_DISPLAY)}`}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Purpose:</span>
                          <div className="font-medium text-gray-900">
                            {getDisplayValue(buyer.purpose, PURPOSE_DISPLAY)}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Budget:</span>
                          <div className="font-medium text-gray-900">
                            {buyer.budgetMin && buyer.budgetMax 
                              ? `${formatCurrency(buyer.budgetMin)} - ${formatCurrency(buyer.budgetMax)}`
                              : buyer.budgetMin 
                                ? `${formatCurrency(buyer.budgetMin)}+`
                                : buyer.budgetMax
                                  ? `Up to ${formatCurrency(buyer.budgetMax)}`
                                  : 'Budget not specified'
                            }
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    {buyer.tags && buyer.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {buyer.tags.slice(0, 3).map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                        {buyer.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                            +{buyer.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        Updated {formatDate(buyer.updatedAt)}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="default"
                          onClick={() => router.push(`/buyers/${buyer.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="default"
                          onClick={() => router.push(`/buyers/${buyer.id}/edit`)}
                        >
                          <Edit3 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        {(user.id === buyer.ownerId || user.role === 'ADMIN') && (
                          <Button 
                            variant="ghost" 
                            size="default"
                            onClick={() => handleDelete(buyer.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <div className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
                    {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
                    {data.pagination.total} results
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="default"
                      onClick={() => handlePageChange(data.pagination.page - 1)}
                      disabled={data.pagination.page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    
                    {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={page === data.pagination.page ? "primary" : "secondary"}
                          size="default"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="secondary"
                      size="default"
                      onClick={() => handlePageChange(data.pagination.page + 1)}
                      disabled={data.pagination.page === data.pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportComplete={() => {
          setShowImportModal(false);
          refetch();
        }}
      />
    </div>
  );
}