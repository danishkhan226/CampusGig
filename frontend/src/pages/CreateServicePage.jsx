import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as serviceService from '../services/serviceService';
import * as uploadService from '../services/uploadService';
import * as aiService from '../services/aiService';
 import { 
  Sparkles, 
  ArrowLeft, 
  Plus, 
  X, 
  Clock, 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Image as ImageIcon,
  Upload
} from 'lucide-react';

const CATEGORIES = [
  'Development',
  'Design',
  'Writing',
  'Video',
  'Marketing',
  'Academic Projects',
  'Data',
  'Other'
];

const PRESET_GIG_IMAGES = [
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
];

export default function CreateServicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Development',
    description: '',
    price: '',
    deliveryDays: '3',
    requirements: '',
    images: []
  });

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImage(true);
      setError('');
      const res = await uploadService.uploadServiceImages(files);
      const uploadedUrls = res.data.data.urls;
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image to ImageKit.');
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    if (isEditing) {
      loadExistingService(id);
    }
  }, [id, isEditing]);

  const loadExistingService = async (serviceId) => {
    try {
      setLoading(true);
      const res = await serviceService.getServiceById(serviceId);
      const s = res.data.service;
      setFormData({
        title: s.title || '',
        category: s.category || 'Development',
        description: s.description || '',
        price: s.price?.toString() || '',
        deliveryDays: s.deliveryDays?.toString() || '3',
        requirements: s.requirements || '',
        images: s.images || []
      });
      setSkills(s.skills || []);
    } catch (err) {
      setError(err.message || 'Failed to load gig for editing');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (e) => {
    e?.preventDefault();
    const clean = newSkill.trim();
    if (clean && !skills.includes(clean)) {
      setSkills([...skills, clean]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddImage = (e) => {
    e?.preventDefault();
    const clean = imageUrlInput.trim();
    if (clean && !formData.images.includes(clean)) {
      setFormData({
        ...formData,
        images: [...formData.images, clean]
      });
      setImageUrlInput('');
    }
  };

  const handleRemoveImage = (imgToRemove) => {
    setFormData({
      ...formData,
      images: formData.images.filter((img) => img !== imgToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.title.trim() || formData.title.trim().length < 5) {
      setError('Title must be at least 5 characters long.');
      return;
    }

    if (!formData.description.trim() || formData.description.trim().length < 20) {
      setError('Description must be at least 20 characters long.');
      return;
    }

    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum < 50) {
      setError('Price must be a valid amount of at least ₹50.');
      return;
    }

    const deliveryNum = Number(formData.deliveryDays);
    if (isNaN(deliveryNum) || deliveryNum < 1) {
      setError('Delivery time must be at least 1 day.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        skills,
        price: priceNum,
        deliveryDays: deliveryNum,
        requirements: formData.requirements.trim(),
        images: formData.images
      };

      let result;
      if (isEditing) {
        result = await serviceService.updateService(id, payload);
      } else {
        result = await serviceService.createService(payload);
      }

      const serviceId = result.data.service._id;
      navigate(`/services/${serviceId}`);
    } catch (err) {
      setError(err.message || 'Failed to save gig. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-500">Loading gig details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>

        {/* Page Title */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {isEditing ? 'Edit Your Service Listing' : 'Publish a New Service on CampusGig'}
              </h1>
              <p className="text-xs text-slate-500">
                Offer your development, design, video, or writing expertise to fellow university students.
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Gig Title *
              </label>
              <span className="text-[11px] text-slate-400">
                {formData.title.length}/120 characters
              </span>
            </div>
            <input
              type="text"
              maxLength={120}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Modern Responsive React & Tailwind Website Development"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Category & Pricing & Delivery */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Starting Price (₹ INR) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                  ₹
                </div>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="999"
                  required
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Delivery Days */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Delivery Duration (Days) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={formData.deliveryDays}
                  onChange={(e) => setFormData({ ...formData, deliveryDays: e.target.value })}
                  placeholder="3"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Detailed Service Description *
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={generatingAI || !formData.title.trim()}
                  onClick={async () => {
                    try {
                      setGeneratingAI(true);
                      const res = await aiService.generateGigDescription({
                        title: formData.title,
                        category: formData.category,
                        skills: formData.skills,
                        targetPrice: formData.price
                      });
                      if (res.data?.description) {
                        setFormData((prev) => ({
                          ...prev,
                          description: res.data.description,
                          requirements: prev.requirements || res.data.suggestedRequirements || ''
                        }));
                      }
                    } catch (err) {
                      alert('AI generation failed: ' + (err.message || 'Error'));
                    } finally {
                      setGeneratingAI(false);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Generate high-converting description using Gemini AI"
                >
                  {generatingAI ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                  <span>{generatingAI ? 'Writing with Gemini AI...' : 'Generate with Gemini AI'}</span>
                </button>
                <span className="text-[11px] text-slate-400">
                  {formData.description.length}/2500
                </span>
              </div>
            </div>
            <textarea
              rows={5}
              maxLength={2500}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what you will provide, your workflow, what tools you use, and why students should hire you..."
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Skills Management */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Skills & Tags
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddSkill(e); }}
                placeholder="Type skill tag (e.g. React.js, Tailwind, SEO) and press Enter"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-600 transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {skills.length === 0 && (
                <span className="text-xs text-slate-400 italic">No skill tags added yet. Add at least 1-3 tags.</span>
              )}
            </div>
          </div>

          {/* Requirements for Client */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Requirements from Client (Optional)
            </label>
            <textarea
              rows={2}
              maxLength={1000}
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="What files, instructions, or credentials does the student client need to provide after placing the order?"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Gig Images / Banner Preview
            </label>

            {/* Direct File Upload button */}
            <div className="mb-3">
              <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-xl bg-indigo-50/40 hover:bg-indigo-50/80 transition cursor-pointer text-indigo-700 font-semibold text-xs">
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Uploading directly to ImageKit CDN...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span>Upload gig images from your device (PNG, JPG, WEBP)</span>
                  </>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Or paste direct image URL (Unsplash, etc.)"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add URL</span>
              </button>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] text-slate-500">Or pick preset image:</span>
              <div className="flex items-center gap-2">
                {PRESET_GIG_IMAGES.map((url, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => {
                      if (!formData.images.includes(url)) {
                        setFormData({ ...formData, images: [...formData.images, url] });
                      }
                    }}
                    className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 hover:border-indigo-500 transition"
                  >
                    <img src={url} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Current Images */}
            <div className="flex flex-wrap gap-3">
              {formData.images.map((img, index) => (
                <div key={index} className="relative w-24 h-20 rounded-xl overflow-hidden border border-slate-200 group">
                  <img src={img} alt="Gig banner" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img)}
                    className="absolute top-1 right-1 p-1 bg-slate-900/80 hover:bg-rose-600 text-white rounded-md transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {formData.images.length === 0 && (
                <span className="text-xs text-slate-400 italic">No custom image added. Category default banner will be assigned automatically.</span>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/explore"
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-100 transition flex items-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isEditing ? 'Updating Gig...' : 'Publishing Gig...'}</span>
                </>
              ) : (
                <span>{isEditing ? 'Save Changes' : 'Publish Gig to Marketplace'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
