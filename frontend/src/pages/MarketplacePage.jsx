import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import * as serviceService from '../services/serviceService';
import ServiceCard from '../components/ServiceCard';
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal, 
  Sparkles, 
  GraduationCap, 
  Loader2, 
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'All',
  'Development',
  'Design',
  'Writing',
  'Video',
  'Marketing',
  'Academic Projects',
  'Data',
  'Other'
];

const PRICE_RANGES = [
  { label: 'All Prices', min: '', max: '' },
  { label: 'Under ₹500', min: '0', max: '500' },
  { label: '₹500 – ₹1,000', min: '500', max: '1000' },
  { label: '₹1,000 – ₹5,000', min: '1000', max: '5000' },
  { label: '₹5,000+', min: '5000', max: '' }
];

const DELIVERY_OPTIONS = [
  { label: 'Any Delivery Time', days: '' },
  { label: 'Up to 1 day', days: '1' },
  { label: 'Up to 3 days', days: '3' },
  { label: 'Up to 7 days', days: '7' }
];

export default function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  // URL query params as initial state
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [category, setCategory] = useState(initialCategory);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [minRating, setMinRating] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const [services, setServices] = useState([]);
  const [totalServices, setTotalServices] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Debounce search input (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Sync category param if changed outside
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat && cat !== category) {
      setCategory(cat);
      setPage(1);
    }
  }, [searchParams]);

  // Fetch services when filters change
  useEffect(() => {
    fetchServices();
  }, [category, debouncedSearch, priceRange, minRating, deliveryDays, verifiedOnly, sort, page]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        sort
      };

      if (category && category !== 'All') params.category = category;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (priceRange.min !== '') params.minPrice = priceRange.min;
      if (priceRange.max !== '') params.maxPrice = priceRange.max;
      if (minRating) params.minRating = minRating;
      if (deliveryDays) params.maxDeliveryDays = deliveryDays;
      if (verifiedOnly) params.verifiedOnly = true;

      const res = await serviceService.getServices(params);
      setServices(res.data.services || []);
      setTotalServices(res.data.totalServices || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (cat) => {
    setCategory(cat);
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setCategory('All');
    setPriceRange({ min: '', max: '' });
    setMinRating('');
    setDeliveryDays('');
    setVerifiedOnly(false);
    setSort('newest');
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = 
    category !== 'All' || 
    debouncedSearch !== '' || 
    priceRange.min !== '' || 
    priceRange.max !== '' || 
    minRating !== '' || 
    deliveryDays !== '' || 
    verifiedOnly;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore Campus Marketplace
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Hire verified college peers for development, design, writing, and academic projects.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={isAuthenticated ? "/services/new" : "/login"}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center gap-2 shadow-md shadow-indigo-100 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create a Gig</span>
            </Link>
          </div>
        </div>

        {/* Search Bar & Primary Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by gig title, skills (e.g. React, Figma), or student name..."
              className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 bg-white shadow-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm placeholder:text-slate-400"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Sort Selector */}
            <div className="relative flex-1 sm:w-48">
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="w-full appearance-none px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer pr-10"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="popular">Sort: Most Popular</option>
                <option value="rating_desc">Sort: Highest Rated</option>
                <option value="price_asc">Sort: Price (Low to High)</option>
                <option value="price_desc">Sort: Price (High to Low)</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-4 pointer-events-none" />
            </div>

            {/* Mobile Filter Trigger */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                category.toLowerCase() === cat.toLowerCase()
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main Content Layout (Sidebar Filters + Service Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <div className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} space-y-6`}>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  <span>Filter Services</span>
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Verified Student Toggle */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => { setVerifiedOnly(e.target.checked); setPage(1); }}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-1 group-hover:text-indigo-600 transition">
                      🎓 Verified Students Only
                    </span>
                    <span className="text-slate-400 block text-[11px]">Validated college peers</span>
                  </div>
                </label>
              </div>

              {/* Price Filter */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Budget Range
                </label>
                <div className="space-y-1.5">
                  {PRICE_RANGES.map((pr, idx) => {
                    const isSelected = priceRange.min === pr.min && priceRange.max === pr.max;
                    return (
                      <button
                        key={idx}
                        onClick={() => { setPriceRange({ min: pr.min, max: pr.max }); setPage(1); }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 text-indigo-700 font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {pr.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Duration */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Delivery Speed
                </label>
                <div className="space-y-1.5">
                  {DELIVERY_OPTIONS.map((opt, idx) => {
                    const isSelected = deliveryDays === opt.days;
                    return (
                      <button
                        key={idx}
                        onClick={() => { setDeliveryDays(opt.days); setPage(1); }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 text-indigo-700 font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="border-t border-slate-100 pt-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Minimum Rating
                </label>
                <div className="space-y-1.5">
                  <button
                    onClick={() => { setMinRating(''); setPage(1); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      minRating === '' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Any Rating
                  </button>
                  <button
                    onClick={() => { setMinRating('4'); setPage(1); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      minRating === '4' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ★ 4.0 and higher
                  </button>
                  <button
                    onClick={() => { setMinRating('4.5'); setPage(1); }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      minRating === '4.5' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    ★ 4.5 and higher
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Service Cards Grid (3 Columns on desktop) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Showing <strong>{services.length}</strong> of <strong>{totalServices}</strong> available gigs</span>
              {hasActiveFilters && (
                <span className="text-indigo-600 font-medium">Filtered results</span>
              )}
            </div>

            {loading ? (
              <div className="min-h-[40vh] flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
                <p className="text-xs font-medium text-slate-400">Loading student gigs...</p>
              </div>
            ) : services.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center shadow-sm space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No Services Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We couldn't find any gigs matching your current filters. Try resetting your search terms or relaxing price and delivery requirements.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {services.map((service) => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 flex items-center gap-1.5 transition shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="text-xs font-semibold text-slate-600">
                  Page {page} of {totalPages}
                </div>

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 flex items-center gap-1.5 transition shadow-xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
