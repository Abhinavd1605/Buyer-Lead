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
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
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
                  size="lg"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="secondary" onClick={handleDelete} size="lg">
                  <Trash2 className="w-4 h-4 mr-2 text-error" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Status & Last Updated */}
          <div className="flex items-center justify-between">
            <span className={`badge badge-${buyer.status.toLowerCase()}`}>
              {getDisplayValue(buyer.status, STATUS_DISPLAY)}
            </span>
            <div className="text-sm text-gray-500">
              Last updated: {formatDateTime(buyer.updatedAt)}
            </div>
          </div>

          {/* Contact Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-3 text-primary" />
                Contact Information
              </h3>
            </div>
            
            <div className="card-content">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-1">Full Name</dt>
                      <dd className="text-base font-semibold text-gray-900">{buyer.fullName}</dd>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-1">Phone Number</dt>
                      <dd className="text-base font-semibold text-gray-900">
                        <a href={`tel:${buyer.phone}`} className="text-primary hover:underline">
                          {buyer.phone}
                        </a>
                      </dd>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {buyer.email && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Mail className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500 mb-1">Email Address</dt>
                        <dd className="text-base font-semibold text-gray-900">
                          <a href={`mailto:${buyer.email}`} className="text-primary hover:underline">
                            {buyer.email}
                          </a>
                        </dd>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-1">Location</dt>
                      <dd className="text-base font-semibold text-gray-900">
                        {getDisplayValue(buyer.city, CITY_DISPLAY)}
                      </dd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Property Requirements */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Home className="w-5 h-5 mr-3 text-primary" />
                Property Requirements
              </h3>
            </div>
            
            <div className="card-content">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 mb-1">Property Type</dt>
                    <dd className="text-base font-semibold text-gray-900">
                      {getDisplayValue(buyer.propertyType, PROPERTY_TYPE_DISPLAY)}
                    </dd>
                  </div>
                </div>
                
                {buyer.bhk && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                      <Home className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-1">Configuration</dt>
                      <dd className="text-base font-semibold text-gray-900">
                        {getDisplayValue(buyer.bhk, BHK_DISPLAY)}
                      </dd>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 mb-1">Purpose</dt>
                    <dd className="text-base font-semibold text-gray-900">
                      {getDisplayValue(buyer.purpose, PURPOSE_DISPLAY)}
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Budget & Timeline */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <DollarSign className="w-5 h-5 mr-3 text-primary" />
                Budget & Timeline
              </h3>
            </div>
            
            <div className="card-content">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 mb-1">Budget Range</dt>
                    <dd className="text-lg font-bold text-gray-900">
                      {buyer.budgetMin && buyer.budgetMax 
                        ? `${formatCurrency(buyer.budgetMin)} - ${formatCurrency(buyer.budgetMax)}`
                        : buyer.budgetMin 
                          ? `${formatCurrency(buyer.budgetMin)}+`
                          : buyer.budgetMax
                            ? `Up to ${formatCurrency(buyer.budgetMax)}`
                            : 'Budget not specified'
                      }
                    </dd>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 mb-1">Purchase Timeline</dt>
                    <dd className="text-lg font-bold text-gray-900">
                      {getDisplayValue(buyer.timeline, TIMELINE_DISPLAY)}
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="w-5 h-5 mr-3 text-primary" />
                Additional Details
              </h3>
            </div>
            
            <div className="card-content">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 mb-1">Lead Source</dt>
                    <dd className="text-base font-semibold text-gray-900">
                      {getDisplayValue(buyer.source, SOURCE_DISPLAY)}
                    </dd>
                  </div>
                </div>
                
                {buyer.tags && buyer.tags.length > 0 && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Tag className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-2">Tags</dt>
                      <dd>
                        <div className="flex flex-wrap gap-2">
                          {buyer.tags.map((tag, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-lg"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </dd>
                    </div>
                  </div>
                )}
                
                {buyer.notes && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-2">Notes & Comments</dt>
                      <dd className="text-base text-gray-900 leading-relaxed bg-gray-50 rounded-xl p-4">
                        {buyer.notes}
                      </dd>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lead Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-3 text-primary" />
                Lead Management
              </h3>
            </div>
            
            <div className="card-content">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div>
                  <dt className="text-sm font-medium text-gray-500 mb-1">Assigned To</dt>
                  <dd className="text-base font-semibold text-gray-900">
                    {buyer.owner?.fullName || 'Unassigned'}
                  </dd>
                  {buyer.owner?.email && (
                    <dd className="text-sm text-gray-500">{buyer.owner.email}</dd>
                  )}
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 mb-1">Created</dt>
                  <dd className="text-base font-semibold text-gray-900">
                    {formatDateTime(buyer.createdAt)}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 mb-1">Last Updated</dt>
                  <dd className="text-base font-semibold text-gray-900">
                    {formatDateTime(buyer.updatedAt)}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6">
            <Button variant="secondary" onClick={() => router.push('/buyers')} size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Buyers
            </Button>
            
            {canEdit && (
              <Button 
                variant="primary"
                onClick={() => router.push(`/buyers/${buyer.id}/edit`)}
                size="lg"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit This Buyer
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}