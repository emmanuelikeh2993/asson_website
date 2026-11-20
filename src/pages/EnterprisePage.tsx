import React, { useState, useEffect } from 'react';
import { EnterpriseListing, EnterpriseCategory, AcademicLevel } from '../types';
import { fetchEnterpriseListings, submitEnterpriseListing } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';
import {
  Briefcase,
  PlusCircle,
  MessageCircle,
  ExternalLink,
  Search,
  CheckCircle2,
  X,
  Image as ImageIcon,
  Sparkles,
  ShieldCheck,
  User,
  Clock,
  Phone
} from 'lucide-react';

export const EnterprisePage: React.FC = () => {
  const [listings, setListings] = useState<EnterpriseListing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<EnterpriseCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<EnterpriseListing | null>(null);
  const [pendingApprovalModal, setPendingApprovalModal] = useState<{
    isOpen: boolean;
    businessName: string;
    ownerName: string;
  }>({ isOpen: false, businessName: '', ownerName: '' });

  const toast = useToast();

  // Submission Form State
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerLevel, setOwnerLevel] = useState<AcademicLevel>('300');
  const [category, setCategory] = useState<EnterpriseCategory>('Data & Tech');
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchEnterpriseListings().then((data) => {
      setListings(data);
      setIsLoading(false);
    });
  }, []);

  const categories: (EnterpriseCategory | 'All')[] = [
    'All',
    'Data & Tech',
    'Academic & Tutorials',
    'Design & Creative',
    'Campus Goods & Food',
    'Fashion & Lifestyle',
  ];

  const filteredListings = listings.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.businessName.toLowerCase().includes(q);
      const matchOwner = item.ownerName.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      if (!matchName && !matchOwner && !matchDesc) return false;
    }
    return true;
  });

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !ownerName.trim() || !description.trim() || !whatsapp.trim()) {
      toast.error('Missing details', 'Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    const cleanPhone = whatsapp.replace(/\D/g, '');
    const res = await submitEnterpriseListing({
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      ownerLevel,
      category,
      description: description.trim(),
      whatsapp: cleanPhone,
      instagram: instagram.trim() || undefined,
      imageUrl: imageUrl.trim() || imagePreview || undefined,
    });
    setIsSubmitting(false);

    if (res.success) {
      // Close form and open informative approval dialog
      setIsSubmitOpen(false);
      setPendingApprovalModal({
        isOpen: true,
        businessName: businessName.trim(),
        ownerName: ownerName.trim(),
      });

      // Reset form
      setBusinessName('');
      setOwnerName('');
      setDescription('');
      setWhatsapp('');
      setInstagram('');
      setImageUrl('');
      setImagePreview(null);
    } else {
      toast.error('Submission Error', res.error || 'Could not submit your listing.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-24 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-light">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-brand-green text-[11px] font-bold border border-emerald-200/80 dark:border-emerald-800/80 mb-1.5">
            <Briefcase className="w-3.5 h-3.5" /> ASSON UI Enterprise Hub
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
            Student Enterprise & Services Showcase
          </h1>
          <p className="text-xs text-text-muted mt-0.5 max-w-2xl leading-relaxed">
            Support businesses, freelance data consultants, peer tutors, and creative ventures by fellow statistics scholars.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsSubmitOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-green hover:bg-brand-deep text-white text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 self-start sm:self-auto active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Showcase Your Business</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-brand-green absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search business name, student name, or services (e.g. data analysis, tutorials)..."
            className="w-full h-11 rounded-2xl border border-border-light bg-surface-card pl-10 pr-4 text-xs sm:text-sm text-text-main placeholder:text-text-subtle focus:border-brand-green focus:outline-none shadow-2xs"
          />
        </div>

        {/* Categories Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-brand-green text-white shadow-2xs'
                    : 'bg-surface-card border border-border-light text-text-muted hover:text-text-main hover:bg-surface-bg'
                }`}
              >
                {cat === 'All' ? 'All Services' : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Listings Grid (Image 1 & Image 3 inspired) */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-text-muted">
          Loading student enterprise showcase...
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="py-16 text-center bg-surface-card rounded-3xl border border-border-light p-6 space-y-3">
          <Briefcase className="w-10 h-10 text-text-muted mx-auto opacity-40" />
          <h3 className="text-sm sm:text-base font-bold text-text-main">
            No businesses found in this category
          </h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Are you offering services or running a business in the department? All statistics students can freely submit their profile!
          </p>
          <button
            type="button"
            onClick={() => setIsSubmitOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-green text-white text-xs font-bold hover:bg-brand-deep cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Showcase Your Business
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredListings.map((item) => {
            const whatsappUrl = `https://wa.me/${item.whatsapp}?text=${encodeURIComponent(
              `Hello ${item.ownerName}, I saw your business "${item.businessName}" on the ASSON UI Portal.`
            )}`;

            return (
              <div
                key={item.id}
                className="group flex flex-col justify-between rounded-3xl border border-border-light bg-surface-card hover:border-brand-green/60 hover:shadow-md transition-all overflow-hidden"
              >
                {/* Photo / Portrait Header (Image 1 & Image 3 Inspired) */}
                <div 
                  onClick={() => setSelectedListing(item)}
                  className="relative h-44 sm:h-48 bg-zinc-100 dark:bg-zinc-800 overflow-hidden cursor-pointer"
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.businessName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-zinc-900 text-brand-green p-4">
                      <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-xl font-black shadow-xs">
                        {item.businessName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[11px] font-bold text-brand-deep dark:text-emerald-300 mt-2">
                        {item.category}
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Badges on Photo */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/20">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand-green text-white shadow-xs">
                      {item.ownerLevel}L
                    </span>
                  </div>

                  {/* Business Name overlay on bottom of photo */}
                  <div className="absolute bottom-2.5 left-3 right-3 text-white pointer-events-none">
                    <h3 className="text-sm font-extrabold truncate drop-shadow-md">
                      {item.businessName}
                    </h3>
                    <p className="text-[11px] text-zinc-200 truncate drop-shadow-xs">
                      by {item.ownerName}
                    </p>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <p className="text-xs text-text-muted line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Actions & WhatsApp button */}
                  <div className="pt-3 border-t border-border-light/60 flex items-center justify-between gap-2 mt-auto">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] dark:text-[#25D366] text-xs font-bold transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setSelectedListing(item)}
                      className="text-xs font-bold text-brand-green hover:text-brand-deep cursor-pointer"
                    >
                      View Profile →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STUDENT PROFILE VIEW MODAL (IMAGE 1 INSPIRED) */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-surface-card border border-border-light p-6 shadow-2xl space-y-4 relative overflow-hidden">
            {/* Top Close */}
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-surface-bg text-text-muted hover:text-text-main transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Profile Avatar / Portrait & Name (Image 1 Style) */}
            <div className="flex items-center gap-3.5 pt-2">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border-2 border-brand-green/30 shadow-xs">
                {selectedListing.imageUrl ? (
                  <img
                    src={selectedListing.imageUrl}
                    alt={selectedListing.ownerName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-xl text-brand-green bg-emerald-50 dark:bg-emerald-950/40">
                    {selectedListing.ownerName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-extrabold text-text-main truncate">
                  {selectedListing.ownerName}
                </h3>
                <p className="text-xs font-semibold text-brand-green">
                  {selectedListing.ownerLevel} Level Scholar • Statistics
                </p>
                <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded-md bg-surface-bg text-text-muted border border-border-light">
                  {selectedListing.businessName}
                </span>
              </div>
            </div>

            {/* Badges strip (Image 1 Style: Achievements / Notes / Category) */}
            <div className="flex items-center gap-2 pt-1">
              <span className="flex-1 text-center py-1.5 px-2 rounded-xl bg-surface-bg border border-border-light text-[11px] font-bold text-text-main">
                {selectedListing.category}
              </span>
              <span className="flex-1 text-center py-1.5 px-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 text-[11px] font-bold text-brand-green flex items-center justify-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified Student
              </span>
            </div>

            {/* About / Description (Image 1 Style) */}
            <div className="space-y-1.5 pt-1">
              <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">About Service</h4>
              <p className="text-xs text-text-muted leading-relaxed p-3 rounded-2xl bg-surface-bg/50 border border-border-light/60">
                {selectedListing.description}
              </p>
            </div>

            {/* Contact Actions */}
            <div className="pt-2 space-y-2">
              <a
                href={`https://wa.me/${selectedListing.whatsapp}?text=${encodeURIComponent(
                  `Hello ${selectedListing.ownerName}, I saw your business "${selectedListing.businessName}" on the ASSON UI Portal.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-10 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp ({selectedListing.whatsapp})</span>
              </a>

              {selectedListing.instagram && (
                <a
                  href={`https://instagram.com/${selectedListing.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-9 rounded-xl border border-border-light bg-surface-bg hover:bg-surface-card text-text-main font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
                  <span>@{selectedListing.instagram.replace('@', '')} on Instagram</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PENDING ADMIN APPROVAL CONFIRMATION MODAL */}
      {pendingApprovalModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-surface-card border border-border-light p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-brand-green flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-extrabold text-text-main">
                Submission Received for Review
              </h3>
              <p className="text-xs text-text-muted leading-relaxed max-w-sm mx-auto">
                Thank you, <strong className="text-text-main">{pendingApprovalModal.ownerName}</strong>! Your business <strong className="text-brand-green">"{pendingApprovalModal.businessName}"</strong> has been logged into the moderation queue.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 text-left flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
              <Clock className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong className="block font-bold">Admin Verification Required</strong>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                  To maintain academic safety and verify departmental standing, an ASSON UI Administrator will review your details and picture before it goes live on the public showcase.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPendingApprovalModal({ isOpen: false, businessName: '', ownerName: '' })}
              className="w-full h-11 rounded-xl bg-brand-green hover:bg-brand-deep text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              Understood, Back to Showcase
            </button>
          </div>
        </div>
      )}

      {/* SUBMISSION MODAL WITH IMAGE UPLOAD & PREVIEW */}
      {isSubmitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-surface-card border border-border-light p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-light/60">
              <div>
                <h3 className="text-base font-bold text-text-main">
                  Showcase Your Student Venture
                </h3>
                <p className="text-xs text-text-muted">
                  All statistics students can freely submit their services & business
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitOpen(false)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-main transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-text-main block mb-1">
                  Business / Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Data Consultants or UI LensCraft"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border-light bg-surface-bg px-3 text-text-main focus:border-brand-green focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-text-main block mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ayomide Babatunde"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full h-10 rounded-xl border border-border-light bg-surface-bg px-3 text-text-main focus:border-brand-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-text-main block mb-1">
                    Your Academic Level *
                  </label>
                  <select
                    value={ownerLevel}
                    onChange={(e) => setOwnerLevel(e.target.value as AcademicLevel)}
                    className="w-full h-10 rounded-xl border border-border-light bg-surface-bg px-3 text-text-main focus:border-brand-green focus:outline-none"
                  >
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-text-main block mb-1">
                  Service Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EnterpriseCategory)}
                  className="w-full h-10 rounded-xl border border-border-light bg-surface-bg px-3 text-text-main focus:border-brand-green focus:outline-none"
                >
                  <option value="Data & Tech">Data & Tech (R, Python, SPSS, Tech Repairs)</option>
                  <option value="Academic & Tutorials">Academic Tutorials & Peer Coaching</option>
                  <option value="Design & Creative">Design, Media & Photography</option>
                  <option value="Campus Goods & Food">Food, Pastries & Campus Goods</option>
                  <option value="Fashion & Lifestyle">Fashion, Tailoring & Lifestyle</option>
                </select>
              </div>

              {/* Photo Input & Preview (Profile or Sample of Work) */}
              <div className="p-3.5 rounded-2xl bg-surface-bg/50 border border-border-light/80 space-y-2">
                <label className="font-bold text-text-main flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-brand-green" /> Profile Picture / Work Sample
                  </span>
                  <span className="text-[10px] text-text-subtle font-normal">Optional but Recommended</span>
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="url"
                    placeholder="Paste image URL (e.g. https://...)"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImagePreview(e.target.value || null);
                    }}
                    className="w-full h-9 rounded-xl border border-border-light bg-surface-card px-2.5 text-xs text-text-main focus:border-brand-green focus:outline-none"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      id="enterprise-photo-file"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="enterprise-photo-file"
                      className="w-full h-9 rounded-xl border border-border-light bg-surface-card hover:bg-surface-bg text-text-muted hover:text-text-main text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <ImageIcon className="w-3 h-3 text-brand-green" /> Upload Photo File
                    </label>
                  </div>
                </div>

                {imagePreview && (
                  <div className="flex items-center gap-3 pt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-14 h-14 rounded-xl object-cover border border-border-light shrink-0"
                    />
                    <span className="text-[11px] text-text-muted truncate">
                      Photo preview ready for showcase card
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setImageUrl('');
                      }}
                      className="text-[11px] text-red-500 hover:underline shrink-0 ml-auto"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-text-main block mb-1">
                  Services Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe what services, tutoring, or products you offer to fellow scholars..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-border-light bg-surface-bg p-3 text-text-main focus:border-brand-green focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-text-main block mb-1">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 08012345678"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full h-10 rounded-xl border border-border-light bg-surface-bg px-3 text-text-main focus:border-brand-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-text-main block mb-1">
                    Instagram Handle (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="@yourhandle"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full h-10 rounded-xl border border-border-light bg-surface-bg px-3 text-text-main focus:border-brand-green focus:outline-none"
                  />
                </div>
              </div>

              {/* Informative note */}
              <div className="p-2.5 rounded-xl bg-surface-bg text-[11px] text-text-muted flex items-center gap-2 border border-border-light/60">
                <ShieldCheck className="w-4 h-4 text-brand-green shrink-0" />
                <span>Submitted listings are reviewed by ASSON admin before appearing publicly.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 rounded-xl bg-brand-green hover:bg-brand-deep text-white font-bold text-xs transition-colors cursor-pointer mt-2 active:scale-98 shadow-sm"
              >
                {isSubmitting ? 'Submitting for Review...' : 'Submit Profile for Admin Verification'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
