"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { buyersAPI } from "@/lib/api";
import { 
  getDisplayValue, 
  CITY_DISPLAY, 
  PROPERTY_TYPE_DISPLAY, 
  STATUS_DISPLAY, 
  BHK_DISPLAY, 
  PURPOSE_DISPLAY,
  TIMELINE_DISPLAY,
  SOURCE_DISPLAY,
  formatCurrency,
  formatDateTime
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Edit3, 
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  Home,
  Calendar,
  DollarSign,
  FileText,
  Tag,
  Clock,
  Building2
} from "lucide-react";
import toast from "react-hot-toast";

export default function BuyerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const buyerId = params.id as string;

  const { data: buyer, isLoading } = useQuery({
    queryKey: ['buyer', buyerId],
    queryFn: () => buyersAPI.getById(buyerId),
  });

  const handleDelete = async () => {
    if (!buyer || !confirm('Are you sure you want to delete this buyer?')) return;
    
    try {
      await buyersAPI.delete(buyer.id);
      toast.success('Buyer deleted successfully');
      router.push('/buyers');
    } catch {
      toast.error('Failed to delete buyer');
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="app-layout">
        <div className="loading-container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p className="text-gray-500">Loading buyer details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!buyer) {
    return (
      <div className="app-layout">
        <div className="app-main">
          <div className="card text-center max-w-lg mx-auto">
            <div className="empty-state">
              <User className="empty-state-icon" />
              <h3 className="empty-state-title">Buyer Not Found</h3>
              <p className="empty-state-description">The buyer you&apos;re looking for doesn&apos;t exist or has been removed.</p>
              <Button onClick={() => router.push('/buyers')} variant="primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Buyers
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canEdit = user.id === buyer.ownerId || user.role === 'ADMIN';

  return (
    <div className="app-layout bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{buyer.fullName}</h1>
                <p className="text-sm text-gray-500">Buyer Lead Profile</p>
              </div>
            </div>
            
            {canEdit && (
              <div className="flex items-center gap-3">
                <Button 
                  variant="secondary" 
                  onClick={() => router.push(`/buyers/${buyer.id}/edit`)}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="secondary" onClick={handleDelete}>
                  <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Status & ID Row */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <span className={`badge badge-${buyer.status.toLowerCase()} px-3 py-1 rounded-full text-sm font-medium`}>
              {getDisplayValue(buyer.status, STATUS_DISPLAY)}
            </span>
            <span className="text-sm text-gray-500">ID: #{buyer.id.slice(-8).toUpperCase()}</span>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {formatDateTime(buyer.updatedAt)}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Contact Information Card */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Full Name</div>
                <div className="font-medium text-gray-900">{buyer.fullName}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Phone Number</div>
                <div className="font-medium">
                  <a href={`tel:${buyer.phone}`} className="text-blue-600 hover:underline">
                    {buyer.phone}
                  </a>
                </div>
              </div>
              
              {buyer.email && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Email Address</div>
                  <div className="font-medium">
                    <a href={`mailto:${buyer.email}`} className="text-blue-600 hover:underline break-all">
                      {buyer.email}
                    </a>
                  </div>
                </div>
              )}
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Location</div>
                <div className="font-medium text-gray-900">
                  {getDisplayValue(buyer.city, CITY_DISPLAY)}
                </div>
              </div>
            </div>
          </div>

          {/* Budget Card */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Budget</h3>
            </div>
            
            <div className="text-center py-8">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {buyer.budgetMin && buyer.budgetMax 
                  ? `${formatCurrency(buyer.budgetMin)} - ${formatCurrency(buyer.budgetMax)}`
                  : buyer.budgetMin 
                    ? `${formatCurrency(buyer.budgetMin)}+`
                    : buyer.budgetMax
                      ? `Up to ${formatCurrency(buyer.budgetMax)}`
                      : 'Not specified'
                }
              </div>
              <div className="text-sm text-gray-500">Budget Range</div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Timeline</span>
              </div>
              <div className="font-medium text-gray-900">
                {getDisplayValue(buyer.timeline, TIMELINE_DISPLAY)}
              </div>
              <div className="text-sm text-gray-500">Purchase Timeline</div>
            </div>
          </div>

          {/* Property Requirements Card */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-6">
              <Home className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Property Requirements</h3>
            </div>
            
            <div className="text-center py-4">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">Property Type</div>
                  <div className="font-semibold text-gray-900">
                    {getDisplayValue(buyer.propertyType, PROPERTY_TYPE_DISPLAY)}
                  </div>
                </div>
                
                {buyer.bhk && (
                  <div>
                    <div className="text-sm text-gray-500">Configuration</div>
                    <div className="font-semibold text-gray-900">
                      {getDisplayValue(buyer.bhk, BHK_DISPLAY)}
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="text-sm text-gray-500">Purpose</div>
                  <div className="font-semibold text-gray-900">
                    {getDisplayValue(buyer.purpose, PURPOSE_DISPLAY)}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Second Row - Additional Details & Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Additional Details Card */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Additional Details</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Lead Source</div>
                <div className="font-medium text-gray-900">
                  {getDisplayValue(buyer.source, SOURCE_DISPLAY)}
                </div>
              </div>
              
              {buyer.tags && buyer.tags.length > 0 && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {buyer.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {buyer.notes && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Notes & Comments</div>
                  <div className="text-sm text-gray-700 bg-gray-50 rounded p-3 leading-relaxed">
                    {buyer.notes}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Management Card */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Management</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Assigned To</div>
                <div className="font-medium text-gray-900">
                  {buyer.owner?.fullName || 'Unassigned'}
                </div>
                {buyer.owner?.email && (
                  <div className="text-sm text-gray-500">{buyer.owner.email}</div>
                )}
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Created</div>
                <div className="text-sm text-gray-900">
                  {formatDateTime(buyer.createdAt)}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-8 border-t mt-8">
          <Button variant="secondary" onClick={() => router.push('/buyers')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Buyers
          </Button>
          
          {canEdit && (
            <Button 
              variant="primary"
              onClick={() => router.push(`/buyers/${buyer.id}/edit`)}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit This Buyer
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}