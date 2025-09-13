"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { Buyer, buyersAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Save, 
  User,
  Phone,
  Mail,
  Home,
  DollarSign,
  FileText,
  Tag
} from "lucide-react";
import toast from "react-hot-toast";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  propertyType: string;
  bhk: string;
  purpose: string;
  budgetMin: string;
  budgetMax: string;
  timeline: string;
  source: string;
  notes: string;
  tags: string;
}

const FORM_OPTIONS = {
  cities: [
    { value: 'CHANDIGARH', label: 'Chandigarh' },
    { value: 'MOHALI', label: 'Mohali' },
    { value: 'ZIRAKPUR', label: 'Zirakpur' },
    { value: 'PANCHKULA', label: 'Panchkula' },
    { value: 'OTHER', label: 'Other' },
  ],
  propertyTypes: [
    { value: 'APARTMENT', label: 'Apartment' },
    { value: 'VILLA', label: 'Villa' },
    { value: 'PLOT', label: 'Plot' },
    { value: 'OFFICE', label: 'Office' },
    { value: 'RETAIL', label: 'Retail' },
  ],
  bhkOptions: [
    { value: 'STUDIO', label: 'Studio' },
    { value: 'ONE', label: '1 BHK' },
    { value: 'TWO', label: '2 BHK' },
    { value: 'THREE', label: '3 BHK' },
    { value: 'FOUR', label: '4 BHK' },
  ],
  purposes: [
    { value: 'BUY', label: 'Buy' },
    { value: 'RENT', label: 'Rent' },
  ],
  timelines: [
    { value: 'ZERO_TO_THREE_MONTHS', label: '0-3 months' },
    { value: 'THREE_TO_SIX_MONTHS', label: '3-6 months' },
    { value: 'MORE_THAN_SIX_MONTHS', label: '6+ months' },
    { value: 'EXPLORING', label: 'Exploring' },
  ],
  sources: [
    { value: 'WEBSITE', label: 'Website' },
    { value: 'REFERRAL', label: 'Referral' },
    { value: 'WALK_IN', label: 'Walk-in' },
    { value: 'CALL', label: 'Call' },
    { value: 'OTHER', label: 'Other' },
  ]
};

export default function NewBuyerPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    propertyType: '',
    bhk: '',
    purpose: '',
    budgetMin: '',
    budgetMax: '',
    timeline: '',
    source: '',
    notes: '',
    tags: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const createMutation = useMutation({
    mutationFn: buyersAPI.create,
    onSuccess: () => {
      toast.success('🎉 Buyer lead created successfully!');
      router.push('/buyers');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create buyer lead');
    },
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.fullName.trim() || formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone must be 10-15 digits';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.propertyType) newErrors.propertyType = 'Property type is required';
    if (!formData.purpose) newErrors.purpose = 'Purpose is required';
    if (!formData.timeline) newErrors.timeline = 'Timeline is required';
    if (!formData.source) newErrors.source = 'Source is required';

    if (['APARTMENT', 'VILLA'].includes(formData.propertyType) && !formData.bhk) {
      newErrors.bhk = 'BHK is required for apartments and villas';
    }

    if (formData.budgetMin && formData.budgetMax) {
      const min = parseInt(formData.budgetMin);
      const max = parseInt(formData.budgetMax);
      if (max < min) {
        newErrors.budgetMax = 'Maximum budget must be greater than minimum';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const submitData: Record<string, unknown> = {
      fullName: formData.fullName.trim(),
      phone: formData.phone.replace(/\D/g, ''),
      city: formData.city,
      propertyType: formData.propertyType,
      purpose: formData.purpose,
      timeline: formData.timeline,
      source: formData.source,
    };

    if (formData.email) submitData.email = formData.email.trim();
    if (formData.bhk) submitData.bhk = formData.bhk;
    if (formData.budgetMin) submitData.budgetMin = parseInt(formData.budgetMin);
    if (formData.budgetMax) submitData.budgetMax = parseInt(formData.budgetMax);
    if (formData.notes) submitData.notes = formData.notes.trim();
    if (formData.tags) {
      submitData.tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }

    createMutation.mutate(submitData as Omit<Buyer, "id" | "ownerId" | "createdAt" | "updatedAt" | "status">);
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
                <h1 className="text-xl font-semibold text-gray-900">Add New Buyer Lead</h1>
                <p className="text-sm text-gray-500">Create a comprehensive buyer profile</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSubmit}
                loading={createMutation.isPending}
                size="lg"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Lead
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="app-main">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-3 text-primary" />
                  Personal Information
                </h3>
                <p className="text-sm text-gray-500 mt-1">Basic contact details and identification</p>
              </div>
              
              <div className="card-content">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="input-label">Full Name *</label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Enter full name"
                      error={errors.fullName}
                    />
                  </div>
                  
                  <div>
                    <label className="input-label">Phone Number *</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                      icon={<Phone className="w-4 h-4" />}
                      error={errors.phone}
                    />
                  </div>
                  
                  <div>
                    <label className="input-label">Email Address</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address (optional)"
                      icon={<Mail className="w-4 h-4" />}
                      error={errors.email}
                    />
                  </div>
                  
                  <div>
                    <label className="input-label">City *</label>
                    <select
                      className={`input ${errors.city ? 'input-error' : ''}`}
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    >
                      <option value="">Select city</option>
                      {FORM_OPTIONS.cities.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.city && <div className="input-error-text">{errors.city}</div>}
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
                <p className="text-sm text-gray-500 mt-1">Specify property preferences and requirements</p>
              </div>
              
              <div className="card-content">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="input-label">Property Type *</label>
                    <select
                      className={`input ${errors.propertyType ? 'input-error' : ''}`}
                      value={formData.propertyType}
                      onChange={(e) => handleInputChange('propertyType', e.target.value)}
                    >
                      <option value="">Select type</option>
                      {FORM_OPTIONS.propertyTypes.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.propertyType && <div className="input-error-text">{errors.propertyType}</div>}
                  </div>
                  
                  {['APARTMENT', 'VILLA'].includes(formData.propertyType) && (
                    <div>
                      <label className="input-label">BHK Configuration *</label>
                      <select
                        className={`input ${errors.bhk ? 'input-error' : ''}`}
                        value={formData.bhk}
                        onChange={(e) => handleInputChange('bhk', e.target.value)}
                      >
                        <option value="">Select BHK</option>
                        {FORM_OPTIONS.bhkOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {errors.bhk && <div className="input-error-text">{errors.bhk}</div>}
                    </div>
                  )}
                  
                  <div>
                    <label className="input-label">Purpose *</label>
                    <select
                      className={`input ${errors.purpose ? 'input-error' : ''}`}
                      value={formData.purpose}
                      onChange={(e) => handleInputChange('purpose', e.target.value)}
                    >
                      <option value="">Select purpose</option>
                      {FORM_OPTIONS.purposes.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.purpose && <div className="input-error-text">{errors.purpose}</div>}
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
                <p className="text-sm text-gray-500 mt-1">Financial capacity and purchase timeline</p>
              </div>
              
              <div className="card-content">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="input-label">Minimum Budget (₹)</label>
                    <Input
                      type="number"
                      value={formData.budgetMin}
                      onChange={(e) => handleInputChange('budgetMin', e.target.value)}
                      placeholder="e.g., 5000000"
                    />
                    <div className="input-help">Leave blank if no minimum</div>
                  </div>
                  
                  <div>
                    <label className="input-label">Maximum Budget (₹)</label>
                    <Input
                      type="number"
                      value={formData.budgetMax}
                      onChange={(e) => handleInputChange('budgetMax', e.target.value)}
                      placeholder="e.g., 10000000"
                      error={errors.budgetMax}
                    />
                    <div className="input-help">Leave blank if no maximum</div>
                  </div>
                  
                  <div>
                    <label className="input-label">Purchase Timeline *</label>
                    <select
                      className={`input ${errors.timeline ? 'input-error' : ''}`}
                      value={formData.timeline}
                      onChange={(e) => handleInputChange('timeline', e.target.value)}
                    >
                      <option value="">Select timeline</option>
                      {FORM_OPTIONS.timelines.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.timeline && <div className="input-error-text">{errors.timeline}</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-3 text-primary" />
                  Additional Information
                </h3>
                <p className="text-sm text-gray-500 mt-1">Lead source, tags, and additional notes</p>
              </div>
              
              <div className="card-content">
                <div className="space-y-6">
                  <div>
                    <label className="input-label">Lead Source *</label>
                    <select
                      className={`input ${errors.source ? 'input-error' : ''}`}
                      value={formData.source}
                      onChange={(e) => handleInputChange('source', e.target.value)}
                    >
                      <option value="">Select source</option>
                      {FORM_OPTIONS.sources.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.source && <div className="input-error-text">{errors.source}</div>}
                  </div>
                  
                  <div>
                    <label className="input-label">Tags</label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="premium, urgent, referral"
                      icon={<Tag className="w-4 h-4" />}
                    />
                    <div className="input-help">Separate multiple tags with commas for better organization</div>
                  </div>
                  
                  <div>
                    <label className="input-label">Notes & Comments</label>
                    <textarea
                      className="input"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Enter any additional notes, preferences, or special requirements..."
                      rows={4}
                    />
                    <div className="input-help">Maximum 1000 characters • Include specific preferences, requirements, or important details</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6">
              <Button variant="secondary" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                loading={createMutation.isPending}
                size="lg"
              >
                <Save className="w-4 h-4 mr-2" />
                Create Buyer Lead
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}