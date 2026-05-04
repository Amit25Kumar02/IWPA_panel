import { useState, useEffect } from 'react';
import {
  Shield,
  Building2,
  Users,
  MapPin,
  Briefcase,
  Plus,
  Search,
  Save,
  FileText,
  Upload,
  Phone,
  Mail,
  Globe,
  X,
  ChevronRight,
  Eye,
  Bell,
  MessageSquare,
  CheckSquare,
  Trash2,
  Loader2,
  Calculator,
  FolderOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import './RolesPage.css';

// ===== UI Theme Configuration =====
const theme = {
  colors: {
    primary: '#1F7A4D',      // Main brand color
    primaryDark: '#176939',  // Hover/darker shade
    secondary: '#155DFC',    // National council accent
    accent: '#a855f7',       // State council accent
    warning: '#f59e0b',      // Vendors accent
    success: '#10b981',
    danger: '#ef4444',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    }
  },
  categories: [
    { id: 'headquarters', name: 'Headquarters', icon: Building2, color: '#1F7A4D', bgColor: '#D0FAE5', borderColor: '#A4F4CF' },
    { id: 'national_council', name: 'National Council', icon: Shield, color: '#155DFC', bgColor: '#DBEAFE', borderColor: '#BEDBFF' },
    { id: 'state_council', name: 'State Council', icon: MapPin, color: '#9810FA', bgColor: '#F3E8FF', borderColor: '#E9D4FF' },
    { id: 'general', name: 'General', icon: Briefcase, color: '#E17100', bgColor: '#FEF3C6', borderColor: '#FEE685' },
    { id: 'vendors', name: 'Vendors', icon: Users, color: '#1F7A4D', bgColor: '#D0FAE5', borderColor: '#A4F4CF'  },
  ],
  getCategoryById: (id: string) => theme.categories.find(c => c.id === id)
};

// =================================

type RoleCategory = 'headquarters' | 'national_council' | 'state_council' | 'general' | 'vendors';

interface RoleInstance {
  id: string;
  templateId: string;
  title: string;
  category: RoleCategory;
  state?: string;
  council?: string;
  designation: string;
  companyName?: string;
  companyDescription?: string;
  photo?: File | null;
  photoPreview?: string;
  companyLogo?: File | null;
  logoPreview?: string;
  mobile: string;
  landline?: string;
  email: string;
  address: string;
  website?: string;
  isDraft: boolean;
  permissions: {
    iwpaDirectory: string;
    noticeBoard: string;
    reports: string;
    approvals: string;
    chat: string;
    email: string;
    messaging: string;
    accounting: string;
  };
}

interface ApiRole {
  _id: string;
  title: string;
  category: RoleCategory;
  state?: string;
  council?: string;
  designation: string;
  companyName?: string;
  companyDescription?: string;
  photo?: string;
  logo?: string;
  mobile: string;
  landline?: string;
  email: string;
  address: string;
  website?: string;
  isDraft: boolean;
  permissions: {
    iwpaDirectory: string;
    noticeBoard: string;
    reports: string;
    approvals: string;
    chat: string;
    email: string;
    messaging: string;
    accounting: string;
  };
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const indianStates = [
  'Andhra Pradesh', 'Gujarat', 'Karnataka', 'Madhya Pradesh', 'Maharashtra',
  'Rajasthan', 'Tamil Nadu', 'Telangana', 'West Bengal', 'Other States'
];

const councils = [
  'Executive Council', 'Technical Council', 'Policy Council', 'Finance Council'
];

export default function RolesPermissions() {
  const [selectedCategory, setSelectedCategory] = useState<RoleCategory>('headquarters');
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const [selectedCouncil, setSelectedCouncil] = useState<string>('Executive Council');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [mobileView, setMobileView] = useState<'categories' | 'roles' | 'form'>('categories');
  const [apiRoles, setApiRoles] = useState<ApiRole[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string | null; title: string }>
    ({ show: false, id: null, title: '' });
  const [deleting, setDeleting] = useState(false);

  // Returns smart permission defaults based on category
  const defaultPermissions = (category: RoleCategory) => ({
    iwpaDirectory: 'View All',
    noticeBoard: 'View All',
    reports: (category === 'headquarters' || category === 'national_council' || category === 'state_council') ? 'Edit' : 'View All',
    approvals: 'View All',
    chat: 'Edit',
    email: 'Edit',
    messaging: 'Edit',
    accounting: category === 'state_council' ? 'Edit' : 'None',
  });

  // Form state
  const [formData, setFormData] = useState<Partial<RoleInstance>>({
    title: '',
    designation: '',
    companyName: '',
    companyDescription: '',
    mobile: '',
    landline: '',
    email: '',
    address: '',
    website: '',
    isDraft: false,
    permissions: defaultPermissions('headquarters'),
  });

  // GET roles
  useEffect(() => { fetchRoles(); }, []);

  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const { data } = await api.get('/api/v1/roles/get-roles');
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setApiRoles(list);
    } catch {
      toast.error('Failed to load roles');
    } finally {
      setLoadingRoles(false);
    }
  };

  // DELETE role
  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/roles/delete-role/${deleteConfirm.id}`);
      setApiRoles(prev => prev.filter(r => r._id !== deleteConfirm.id));
      toast.success('Role deleted successfully');
      setDeleteConfirm({ show: false, id: null, title: '' });
    } catch {
      toast.error('Failed to delete role');
    } finally {
      setDeleting(false);
    }
  };

  // Filter db roles based on category, state and search
  const filteredDbRoles = apiRoles.filter(r =>
    r.category === selectedCategory &&
    (selectedCategory !== 'state_council' || r.state === selectedState) &&
    (r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.designation.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleApiRoleSelect = (role: ApiRole) => {
    setShowForm(true);
    setMobileView('form');
    setFormData({
      id: role._id,
      title: role.title,
      category: role.category,
      state: role.state,
      council: role.council,
      designation: role.designation,
      companyName: role.companyName || '',
      companyDescription: role.companyDescription || '',
      photoPreview: role.photo ? `${BASE_URL}${role.photo}` : undefined,
      logoPreview: role.logo ? `${BASE_URL}${role.logo}` : undefined,
      mobile: role.mobile,
      landline: role.landline || '',
      email: role.email,
      address: role.address,
      website: role.website || '',
      isDraft: role.isDraft,
      permissions: role.permissions,
    });
  };

  const handleCreateNew = () => {
    setShowForm(true);
    setFormData({
      title: '',
      category: selectedCategory,
      state: selectedCategory === 'state_council' ? selectedState : undefined,
      council: selectedCategory === 'national_council' ? selectedCouncil : undefined,
      designation: '',
      companyName: '',
      mobile: '',
      landline: '',
      email: '',
      address: '',
      website: '',
      isDraft: false,
      permissions: defaultPermissions(selectedCategory),
    });
    setMobileView('form');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: file, photoPreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, companyLogo: file, logoPreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!formData.title?.trim() || !formData.designation?.trim() || !formData.mobile?.trim() || !formData.email?.trim() || !formData.address?.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      const { photo, companyLogo, photoPreview, logoPreview, id, ...rest } = formData as RoleInstance & { id?: string };
      Object.entries({ ...rest, isDraft }).forEach(([k, v]) => {
        if (k === 'permissions') fd.append(k, JSON.stringify(v));
        else if (v !== undefined && v !== null) fd.append(k, String(v));
      });
      if (photo instanceof File) fd.append('photo', photo);
      if (companyLogo instanceof File) fd.append('logo', companyLogo);

      const isEdit = !!(formData as any).id;
      const { data } = isEdit
        ? await api.patch(`/api/v1/roles/update-role/${(formData as any).id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        : await api.post('/api/v1/roles/create-role', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      const saved = data?.data ?? data;
      setApiRoles(prev =>
        isEdit ? prev.map(r => r._id === saved._id ? saved : r) : [saved, ...prev]
      );
      toast.success(`Role ${isEdit ? 'updated' : 'submitted'} successfully`);
      setShowForm(false);
      setMobileView('categories');
    } catch {
      toast.error('Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryColor = (category: RoleCategory) => {
    const cat = theme.categories.find(c => c.id === category);
    return cat?.color || theme.colors.gray[500];
  };

  return (
    <div className="p-6 h-[calc(100vh-180px)]">
      {/* Desktop View */}
      <div className="grid md:grid-cols-6 xl:grid-cols-12 gap-8 h-full">
        {/* Left Panel - Categories */}
        <div className="md:col-span-3">
          <Card className="h-fit flex flex-col">
            <div className="p-6 border-b-[0.76px] border-[#E5E7EB]">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5" style={{ color: theme.colors.primary }} />
                <h2 className="font-semibold text-[#242424] text-[18.96px]">Role Categories</h2>
              </div>
              <p className="text-[13.27px] text-[#6A7282]">Manage position-based roles</p>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {theme.categories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id as RoleCategory);
                        setShowForm(false);
                      }}
                      style={{
                        backgroundColor: isSelected ? `${category.bgColor}70` : 'white',
                        borderColor: isSelected ? category.borderColor : theme.colors.gray[200],
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all border-2 hover:border-[#E5E7EB] cursor-pointer`}
                    >
                      <div
                        style={{ backgroundColor: category.bgColor }}
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                      >
                        <Icon style={{ color: category.color }} className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {category.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {apiRoles.filter(r => r.category === category.id).length} roles
                        </p>
                      </div>
                      {isSelected && <ChevronRight style={{ color: category.color }} className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Middle Panel - Roles List */}
        <div className="md:col-span-3">
          <Card className="h-fit flex flex-col">
            <div className="p-6 border-b-[0.76px] border-[#E5E7EB]">
              {/* Council/State Selector */}
              {selectedCategory === 'state_council' && (
                <div className="mb-4">
                  <Label className="text-[13.27px] font-medium text-[#6A7282] mb-2 block">Select State</Label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none "
                    // style={{ focusRingColor: theme.colors.primary }}
                  >
                    {indianStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedCategory === 'national_council' && (
                <div className="mb-4">
                  <Label className="text-[13.27px] font-medium text-[#6A7282] mb-2 block">Select Council</Label>
                  <select
                    value={selectedCouncil}
                    onChange={(e) => setSelectedCouncil(e.target.value)}
                    className="w-full px-3 py-2 border-[0.76px] border-[#E5E7EB] rounded-lg text-sm outline-none"
                    // style={{ focusRingColor: theme.colors.primary }}
                  >
                    {councils.map(council => (
                      <option key={council} value={council}>{council}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#99A1AF]" />
                <Input
                  placeholder="Search roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                <Button
                  onClick={handleCreateNew}
                  className="w-full text-white"
                  style={{ backgroundColor: theme.colors.primary }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.colors.primaryDark)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.colors.primary)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Role
                </Button>

                <Separator className="my-4" />

                {loadingRoles ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-[#1F7A4D]" />
                  </div>
                ) : filteredDbRoles.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-[#99A1AF] mx-auto mb-3" />
                    <p className="text-sm text-[#6A7282]">No roles found</p>
                  </div>
                ) : (
                  filteredDbRoles.map(role => (
                    <button key={role._id}
                      onClick={() => handleApiRoleSelect(role)}
                      className={`w-full text-left p-4 rounded-lg border transition-all cursor-pointer ${
                        (formData as any).id === role._id
                          ? 'border-[#1F7A4D]/40 bg-[#1F7A4D]/5'
                          : 'border-[#E5E7EB] bg-white hover:border-[#1F7A4D]/30'
                      }`}>
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-medium text-[#242424] text-sm">{role.title}</h3>
                        <span
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ show: true, id: role._id, title: role.title }); }}
                          className="p-1 hover:bg-red-50 rounded text-[#FB2C36] transition-colors cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <p className="text-xs text-[#6A7282] mb-2">{role.designation}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {role.photo && (
                          <img src={`${BASE_URL}${role.photo}`} alt={role.title}
                            className="w-6 h-6 rounded-full object-cover border border-[#e5e7eb]" />
                        )}
                        {role.state && (
                          <Badge variant="outline" className="text-xs">
                            <MapPin className="w-3 h-3 mr-1" />{role.state}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs bg-[#ecfdf5] text-[#1F7A4D]">Saved</Badge>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Right Panel - Form */}
        <div className="md:col-span-6">
          {showForm ? (
            <Card className="h-full flex flex-col">
              <div className="p-6 border-b-[0.8px] border-[#E5E7EB]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#101828]">
                      {(formData as any).id ? `Edit Role: ${formData.title}` : 'Create New Role'}
                    </h2>
                    <p className="text-sm text-[#6A7282]">Define role details and permissions</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowForm(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-sm font-semibold text-[#101828] mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4" style={{ color: theme.colors.primary }} />
                      Basic Information
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Role Title <span className="text-[#FB2C36]">*</span></Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., State President"
                          className='bg-[#F9FAFB] border-[0.8px] border-[#000000]/0% rounded-lg'
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Category</Label>
                          <div className="mt-2">
                            <Badge style={{ backgroundColor: `${getCategoryColor(formData.category!)}20`, color: getCategoryColor(formData.category!) }}>
                              {theme.getCategoryById(formData.category!)?.name}
                            </Badge>
                          </div>
                        </div>

                        {formData.state && (
                          <div>
                            <Label>State</Label>
                            <div className="mt-2">
                              <Badge variant="outline">
                                <MapPin className="w-3 h-3 mr-1" />
                                {formData.state}
                              </Badge>
                            </div>
                          </div>
                        )}

                        {formData.council && (
                          <div>
                            <Label>Council</Label>
                            <div className="mt-2">
                              <Badge variant="outline">{formData.council}</Badge>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="designation">Designation <span className="text-[#FB2C36]">*</span></Label>
                        <Input
                          id="designation"
                          value={formData.designation}
                          onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                          placeholder="e.g., Chief Executive Officer"
                          className='bg-[#F9FAFB] border-[0.8px] border-[#000000]/0% rounded-lg'
                        />
                      </div>

                      <div>
                        <Label htmlFor="company">Company Name</Label>
                        <Input
                          id="company"
                          value={formData.companyName}
                          onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                          placeholder="Optional"
                          className='bg-[#F9FAFB] border-[0.8px] border-[#000000]/0% rounded-lg'
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Photos & Logos */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Upload className="w-4 h-4" style={{ color: theme.colors.primary }} />
                      Photos & Logos
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Profile Photo</Label>
                        <div className="mt-2">
                          {formData.photoPreview ? (
                            <div className="relative">
                              <img src={formData.photoPreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => setFormData(prev => ({ ...prev, photo: null, photoPreview: undefined }))}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2  border-[#D1D5DC] rounded-lg cursor-pointer transition-colors"
                              style={{ hover: { borderColor: theme.colors.primary } }}>
                              <Upload className="w-6 h-6 text-[#99A1AF]" />
                              <span className="text-xs text-[#6A7282] mt-2">Upload Photo</span>
                              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                            </label>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label>Company Logo</Label>
                        <div className="mt-2">
                          {formData.logoPreview ? (
                            <div className="relative">
                              <img src={formData.logoPreview} alt="Preview" className="w-full h-32 object-contain rounded-lg bg-gray-50 p-2" />
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => setFormData(prev => ({ ...prev, companyLogo: null, logoPreview: undefined }))}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2  border-[#D1D5DC] rounded-lg cursor-pointer transition-colors"
                              style={{ hover: { borderColor: theme.colors.primary } }}>
                              <Upload className="w-6 h-6 text-[#99A1AF]" />
                              <span className="text-xs text-[#6A7282] mt-2">Upload Logo</span>
                              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                            </label>
                          )}
                        </div>
                      </div>

                    </div>
                    <div className='mt-3'>
                      <Label htmlFor="companyDescription">Company Description </Label>
                      <Textarea
                        id="companyDescription"
                        value={formData.companyDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, companyDescription: e.target.value }))}
                        placeholder="Enter company description (if applicable)"
                        className='bg-[#F9FAFB] border-[0.8px] border-[#000000]/0% rounded-lg'
                        rows={3}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Contact Details */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Phone className="w-4 h-4" style={{ color: theme.colors.primary }} />
                      Contact Details
                    </h3>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="mobile">Mobile Number <span className="text-[#FB2C36]">*</span></Label>
                          <Input
                            id="mobile"
                            value={formData.mobile}
                            onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                            placeholder="+91 XXXXX XXXXX"
                            className='bg-[#F9FAFB] border-[0.8px] border-[#000000]/0% rounded-lg'
                          />
                        </div>

                        <div>
                          <Label htmlFor="landline">Landline</Label>
                          <Input
                            id="landline"
                            value={formData.landline}
                            onChange={(e) => setFormData(prev => ({ ...prev, landline: e.target.value }))}
                            placeholder="Optional"
                            className='bg-[#F9FAFB] border-[0.8px] border-[#000000]/0% rounded-lg'
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email Address <span className="text-[#FB2C36]">*</span></Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="email@example.com"
                            className="pl-10 bg-[#F9FAFB] border-[0.8px] border-[#000000]/0% rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="website">Website</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="website"
                            value={formData.website}
                            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                            placeholder="https://example.com"
                            className="pl-10 bg-[#F9FAFB] border-[0.8px] border-[#000000]/0% rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address">Address <span className="text-[#FB2C36]">*</span></Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="Complete address"
                          rows={3}
                          className='bg-[#F9FAFB] border-[0.8px] border-[#000000]/0% rounded-lg'
                        />
                      </div>
                    </div>

                  </div>

                  <Separator />

                  {/* Permissions Preview */}
                  <div>
                    <h3 className="text-sm font-semibold text-[#101828] mb-4 flex items-center gap-2">
                      <Eye className="w-4 h-4" style={{ color: theme.colors.primary }} />
                      Permissions
                    </h3>

                    <div className="space-y-4">

                      {/* IWPA Directory */}
                      <Card className="p-4" style={{ backgroundColor: '#F0FDF4', borderColor: '#A4F4CF' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <FolderOpen className="w-4 h-4 text-[#1F7A4D]" />
                          <span className="text-sm font-medium text-[#0D3D26]">IWPA Directory</span>
                          <span className="ml-auto text-xs text-[#6A7282] bg-[#D0FAE5] px-2 py-0.5 rounded-full">All roles</span>
                        </div>
                        <div className="flex gap-4">
                          {['View All', 'Download'].map(v => (
                            <label key={v} className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name="iwpaDirectory" value={v}
                                checked={formData.permissions?.iwpaDirectory === v}
                                onChange={(e) => setFormData(prev => ({ ...prev, permissions: { ...prev.permissions!, iwpaDirectory: e.target.value } }))}
                                className="w-4 h-4" />
                              <span className="text-xs text-[#030213] bg-[#FFFFFF] rounded-[3px] py-0.5 px-2">{v}</span>
                            </label>
                          ))}
                        </div>
                      </Card>

                      <Card className="p-4" style={{ backgroundColor: '#EFF6FF', borderColor: '#BEDBFF' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <Bell className="w-4 h-4 text-[#155DFC]" />
                          <span className="text-sm font-medium text-[#1C398E]">Notice Board</span>
                        </div>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="noticeBoard"
                              value="View All"
                              checked={formData.permissions?.noticeBoard === 'View All'}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                permissions: { ...prev.permissions!, noticeBoard: e.target.value }
                              }))}
                              className="w-4 h-4 text-[#155DFC] bg-[#ffffff] border border-[#E5E5E5]"
                            />
                            <span className="text-xs text-[#030213] bg-[#FFFFFF] rounded-[3px] py-0.5 px-2">View All</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="noticeBoard"
                              value="Modify"
                              checked={formData.permissions?.noticeBoard === 'Modify'}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                permissions: { ...prev.permissions!, noticeBoard: e.target.value }
                              }))}
                              className="w-4 h-4 text-[#155DFC] bg-[#ffffff] border border-[#E5E5E5]"
                            />
                            <span className="text-xs text-[#030213] bg-[#FFFFFF] rounded-[3px] py-0.5 px-2">Modify</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="noticeBoard"
                              value="Edit"
                              checked={formData.permissions?.noticeBoard === 'Edit'}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                permissions: { ...prev.permissions!, noticeBoard: e.target.value }
                              }))}
                              className="w-4 h-4 text-[#155DFC] bg-[#ffffff] border border-[#E5E5E5]"
                            />
                            <span className="text-xs text-[#030213] bg-[#FFFFFF] rounded-[3px] py-0.5 px-2">Edit</span>
                          </label>
                        </div>
                      </Card>

                      <Card className="p-4" style={{ backgroundColor: '#FAF5FF', borderColor: '#E9D4FF' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="w-4 h-4 text-[#9810FA]" />
                          <span className="text-sm font-medium text-[#59168B]">Reports</span>
                        </div>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="reports"
                              value="View All"
                              checked={formData.permissions?.reports === 'View All'}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                permissions: { ...prev.permissions!, reports: e.target.value }
                              }))}
                              className="w-4 h-4 text-[#155DFC] bg-[#ffffff] border border-[#E5E5E5]"
                            />
                            <span className="text-xs text-[#030213] bg-[#FFFFFF] rounded-[3px] py-0.5 px-2">View All</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="reports"
                              value="Modify"
                              checked={formData.permissions?.reports === 'Modify'}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                permissions: { ...prev.permissions!, reports: e.target.value }
                              }))}
                              className="w-4 h-4 text-[#155DFC] bg-[#ffffff] border border-[#E5E5E5]"
                            />
                            <span className="text-xs text-[#030213] bg-[#FFFFFF] rounded-[3px] py-0.5 px-2">Modify</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="reports"
                              value="Edit"
                              checked={formData.permissions?.reports === 'Edit'}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                permissions: { ...prev.permissions!, reports: e.target.value }
                              }))}
                              className="w-4 h-4 text-[#155DFC] bg-[#ffffff] border border-[#E5E5E5]"
                            />
                            <span className="text-xs text-[#030213] bg-[#FFFFFF] rounded-[3px] py-0.5 px-2">Edit</span>
                          </label>
                        </div>
                      </Card>

                      <Card className="p-4" style={{ backgroundColor: '#FFFBEB', borderColor: '#FEE685' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <CheckSquare className="w-4 h-4 text-[#E17100]" />
                          <span className="text-sm font-medium text-[#7B3306]">Approvals</span>
                        </div>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="approvals"
                              value="View All"
                              checked={formData.permissions?.approvals === 'View All'}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                permissions: { ...prev.permissions!, approvals: e.target.value }
                              }))}
                              className="w-4 h-4 text-[#155DFC] bg-[#ffffff] border border-[#E5E5E5]"
                            />
                            <span className="text-xs text-[#030213] bg-[#FFFFFF] rounded-[3px] py-0.5 px-2">View All</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="approvals"
                              value="Modify"
                              checked={formData.permissions?.approvals === 'Modify'}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                permissions: { ...prev.permissions!, approvals: e.target.value }
                              }))}
                              className="w-4 h-4 text-[#155DFC] bg-[#ffffff] border border-[#E5E5E5]"
                            />
                            <span className="text-xs text-[#030213] bg-[#FFFFFF] rounded-[3px] py-0.5 px-2">Modify</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="approvals"
                              value="Edit"
                              checked={formData.permissions?.approvals === 'Edit'}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                permissions: { ...prev.permissions!, approvals: e.target.value }
                              }))}
                              className="w-4 h-4 text-[#155DFC] bg-[#ffffff] border border-[#E5E5E5]"
                            />
                            <span className="text-xs text-[#030213] bg-[#FFFFFF] rounded-[3px] py-0.5 px-2">Edit</span>
                          </label>
                        </div>
                      </Card>

                      <Card className="p-4" style={{ backgroundColor: '#1F7A4D1A', borderColor: '#1F7A4D4D' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <Mail className="w-4 h-4 text-[#1F7A4D]" />
                          <span className="text-sm font-medium text-[#0D3D26]">E-mail</span>
                        </div>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="email"
                              value="View All"
                              checked={formData.permissions?.email === 'View All'}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                permissions: { ...prev.permissions!, email: e.target.value }
                              }))}
                              className="w-4 h-4 text-[#157DFC] bg-[#ffffff] border border-[#E5E5E5]"
                            />
                            <span className="text-xs text-[#030213] bg-[#FFFFFF] rounded-[3px] py-0.5 px-2">View All</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="email"
                              value="Modify"
                              checked={formData.permissions?.email === 'Modify'}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                permissions: { ...prev.permissions!, email: e.target.value }
                              }))}
                              className="w-4 h-4 text-[#157DFC] bg-[#ffffff] border border-[#E5E5E5]"
                            />
                            <span className="text-xs text-[#030213] bg-[#FFFFFF] rounded-[3px] py-0.5 px-2">Modify</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="email"
                              value="Edit"
                              checked={formData.permissions?.email === 'Edit'}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                permissions: { ...prev.permissions!, email: e.target.value }
                              }))}
                              className="w-4 h-4 text-[#157DFC] bg-[#ffffff] border border-[#E5E5E5]"
                            />
                            <span className="text-xs text-[#030213] bg-[#FFFFFF] rounded-[3px] py-0.5 px-2">Edit</span>
                          </label>
                        </div>
                      </Card>

                      <Card className="p-4" style={{ backgroundColor: "#FFFBEB", borderColor: "#FEE685" }}>
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="w-4 h-4" style={{ color: theme.colors.primary }} />
                          <span className="text-sm font-medium" style={{ color: '#0D3D26' }}>Team Chat</span>
                        </div>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="chat"
                              value="View All"
                              checked={formData.permissions?.chat === 'View All'}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                permissions: { ...prev.permissions!, chat: e.target.value }
                              }))}
                              className="w-4 h-4 text-[#157DFC] bg-[#ffffff] border border-[#E5E5E5]"
                              
                            />
                            <span className="text-xs text-[#030213] bg-[#FFFFFF] rounded-[3px] py-0.5 px-2">View All</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="chat"
                              value="Modify"
                              checked={formData.permissions?.chat === 'Modify'}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                permissions: { ...prev.permissions!, chat: e.target.value }
                              }))}
                              className="w-4 h-4 text-[#157DFC] bg-[#ffffff] border border-[#E5E5E5]"
                           
                            />
                            <span className="text-xs text-[#030213] bg-[#FFFFFF] rounded-[3px] py-0.5 px-2">Modify</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="chat"
                              value="Edit"
                              checked={formData.permissions?.chat === 'Edit'}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                permissions: { ...prev.permissions!, chat: e.target.value }
                              }))}
                              className="w-4 h-4 text-[#157DFC] bg-[#ffffff] border border-[#E5E5E5]"
                             
                            />
                            <span className="text-xs text-[#030213] bg-[#FFFFFF] rounded-[3px] py-0.5 px-2">Edit</span>
                          </label>
                        </div>
                      </Card>

                      

                      <Card className="p-4" style={{ backgroundColor: '#FAF5FF', borderColor: '#E9D4FF' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <MessageSquare className="w-4 h-4 text-[#9810FA]" />
                          <span className="text-sm font-medium text-[#59168B]">Messaging</span>
                        </div>
                        <div className="flex gap-4">
                          {['View All', 'Modify', 'Edit'].map(v => (
                            <label key={v} className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name="messaging" value={v}
                                checked={formData.permissions?.messaging === v}
                                onChange={(e) => setFormData(prev => ({ ...prev, permissions: { ...prev.permissions!, messaging: e.target.value } }))}
                                className="w-4 h-4 text-[#155DFC] bg-[#ffffff] border border-[#E5E5E5]" />
                              <span className="text-xs text-[#030213] bg-[#FFFFFF] rounded-[3px] py-0.5 px-2">{v}</span>
                            </label>
                          ))}
                        </div>
                      </Card>

                      {/* Accounting — State Coordinators only */}
                      <Card className="p-4" style={{ backgroundColor: '#FFFBEB', borderColor: '#FEE685' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <Calculator className="w-4 h-4 text-[#E17100]" />
                          <span className="text-sm font-medium text-[#7B3306]">Accounting</span>
                          <span className="ml-auto text-xs text-[#6A7282] bg-[#FEF3C6] px-2 py-0.5 rounded-full">State Coordinators</span>
                        </div>
                        <div className="flex gap-4">
                          {['None', 'View All', 'Edit'].map(v => (
                            <label key={v} className="flex items-center gap-2 cursor-pointer">
                              <input type="radio" name="accounting" value={v}
                                checked={formData.permissions?.accounting === v}
                                onChange={(e) => setFormData(prev => ({ ...prev, permissions: { ...prev.permissions!, accounting: e.target.value } }))}
                                className="w-4 h-4 text-[#E17100] bg-[#ffffff] border border-[#E5E5E5]" />
                              <span className="text-xs text-[#030213] bg-[#FFFFFF] rounded-[3px] py-0.5 px-2">{v}</span>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-[#6A7282] mt-2">Edit allows feeding expenses, uploading bills, receipts & bank statements</p>
                      </Card>

                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Form Actions */}
              <div>
                <div className="flex items-center justify-end px-5 pb-5">
                  {/* <Button variant="outline" onClick={() => handleSubmit(true)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Save as Draft
                  </Button> */}
                  <Button
                    style={{ backgroundColor: theme.colors.primary }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.colors.primaryDark)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.colors.primary)}
                    onClick={() => handleSubmit(false)}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {(formData as any).id ? 'Save Changes' : 'Submit & Activate'}
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center px-8 py-12">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Role Selected</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Select a role from the list or create a new one to begin
                </p>
                <Button
                  onClick={handleCreateNew}
                  style={{ backgroundColor: theme.colors.primary }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.colors.primaryDark)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.colors.primary)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Role
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-[#FB2C36]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#242424] mb-2">Delete Role</h3>
                <p className="text-sm text-[#6a7282] mb-4">
                  Are you sure you want to delete <strong>{deleteConfirm.title}</strong>? This action cannot be undone.
                </p>
                <div className="flex items-center gap-3 justify-end">
                  <button onClick={() => setDeleteConfirm({ show: false, id: null, title: '' })}
                    disabled={deleting}
                    className="px-4 py-2 border border-[#e5e7eb] text-[#242424] rounded-lg hover:bg-[#f9fafb] transition-colors font-medium cursor-pointer disabled:opacity-50">
                    Cancel
                  </button>
                  <button onClick={confirmDelete} disabled={deleting}
                    className="px-4 py-2 bg-[#FB2C36] text-white rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50 inline-flex items-center gap-2">
                    {deleting && <Loader2 className="w-4 h-4 animate-spin" />} Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}