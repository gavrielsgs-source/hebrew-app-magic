import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Phone, Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { translateTransmission, translateFuelType, translateColor } from "@/lib/car-translations";

interface DealerInfo {
  name: string;
  phone: string;
  settings: {
    logo_url?: string;
    primary_color?: string;
    contact_phone?: string;
    show_phone?: boolean;
    show_prices?: boolean;
  };
}

interface PublicCar {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  kilometers: number;
  fuel_type: string;
  transmission: string;
  exterior_color: string;
  interior_color: string | null;
  engine_size: string | null;
  description: string;
  image_url: string | null;
  trim_level: string | null;
  entry_date: string | null;
  next_test_date: string | null;
  ownership_history: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Filters {
  makes: string[];
}

export default function PublicInventory() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dealer, setDealer] = useState<DealerInfo | null>(null);
  const [cars, setCars] = useState<PublicCar[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [availableFilters, setAvailableFilters] = useState<Filters>({ makes: [] });
  
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minYear, setMinYear] = useState<string>("");
  const [maxYear, setMaxYear] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchInventory = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ slug: slug!, page: page.toString() });
      
      if (selectedMake) params.append('make', selectedMake);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minYear) params.append('minYear', minYear);
      if (maxYear) params.append('maxYear', maxYear);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/get-public-inventory?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch inventory');
      }

      const result = await response.json();
      
      setDealer(result.dealer);
      setCars(result.cars);
      setPagination(result.pagination);
      setAvailableFilters(result.filters);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      setError(err.message || 'שגיאה בטעינת המלאי');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchInventory(currentPage);
    }
  }, [slug, currentPage, selectedMake, minPrice, maxPrice, minYear, maxYear]);

  const handleWhatsAppClick = (car?: PublicCar) => {
    const phone = dealer?.settings?.contact_phone || dealer?.phone;
    if (!phone) return;
    
    const formattedPhone = phone.replace(/\D/g, '');
    const israelPhone = formattedPhone.startsWith('0') 
      ? '972' + formattedPhone.substring(1) 
      : formattedPhone;
    
    let message = `שלום, אני מתעניין ברכב`;
    if (car) {
      message = `שלום, אני מתעניין ברכב ${car.make} ${car.model} ${car.year}`;
    }
    
    window.open(`https://wa.me/${israelPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const clearFilters = () => {
    setSelectedMake("");
    setMinPrice("");
    setMaxPrice("");
    setMinYear("");
    setMaxYear("");
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedMake || minPrice || maxPrice || minYear || maxYear;
  const showPrices = dealer?.settings?.show_prices !== false;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(price);
  };

  const formatKilometers = (km: number) => {
    return new Intl.NumberFormat('he-IL').format(km);
  };

  const filteredCars = cars.filter(car => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      car.make.toLowerCase().includes(query) ||
      car.model.toLowerCase().includes(query) ||
      car.description?.toLowerCase().includes(query)
    );
  });

  // Loading state
  if (loading && !dealer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfbfd]">
        <div className="text-center">
          <div className="h-10 w-10 mx-auto mb-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#1d1d1f]/30" />
          </div>
          <p className="text-[#86868b] text-sm font-medium tracking-tight">טוען מלאי...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfbfd]">
        <div className="text-center px-6 max-w-sm">
          <div className="h-16 w-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-5">
            <svg className="h-8 w-8 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mb-2">דף המלאי לא נמצא</h1>
          <p className="text-[#86868b] text-base leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbfd]" dir="rtl">
      
      {/* ── Apple-style Nav Bar ── */}
      <nav className="sticky top-0 z-50 bg-[rgba(251,251,253,0.8)] backdrop-blur-2xl backdrop-saturate-[1.8] border-b border-[#d2d2d7]/60">
        <div className="max-w-[1120px] mx-auto px-5 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {dealer?.settings?.logo_url ? (
              <img 
                src={dealer.settings.logo_url} 
                alt={dealer.name} 
                className="h-7 w-auto object-contain"
              />
            ) : (
              <span className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight">
                {dealer?.name}
              </span>
            )}
          </div>
          
          {dealer?.phone && dealer.settings?.show_phone !== false && (
            <button 
              onClick={() => handleWhatsAppClick()} 
              className="text-[#0071e3] text-sm font-medium hover:underline underline-offset-2 transition-all"
            >
              צור קשר
            </button>
          )}
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="pt-12 pb-6 sm:pt-20 sm:pb-10 text-center px-5">
        <h1 className="text-[32px] sm:text-[48px] lg:text-[56px] font-semibold text-[#1d1d1f] tracking-[-0.003em] leading-[1.08] max-w-3xl mx-auto">
          {dealer?.name}
        </h1>
        <p className="mt-3 sm:mt-4 text-[17px] sm:text-[21px] text-[#86868b] font-normal leading-relaxed max-w-xl mx-auto">
          {pagination?.total || 0} רכבים זמינים במלאי
        </p>
      </section>

      {/* ── Search & Filter Bar ── */}
      <div className="sticky top-12 z-40 bg-[rgba(251,251,253,0.72)] backdrop-blur-2xl backdrop-saturate-[1.8]">
        <div className="max-w-[1120px] mx-auto px-5 py-3">
          <div className="flex gap-2 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b]" />
              <input
                type="text"
                placeholder="חיפוש..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pr-10 pl-4 rounded-lg bg-[#e8e8ed]/60 border-0 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40 transition-all"
              />
            </div>

            {/* Desktop filters */}
            <div className="hidden md:flex gap-2 items-center">
              <Select value={selectedMake || "all"} onValueChange={(val) => setSelectedMake(val === "all" ? "" : val)}>
                <SelectTrigger className="w-[130px] h-9 rounded-lg border-0 bg-[#e8e8ed]/60 text-[14px] text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3]/40">
                  <SelectValue placeholder="יצרן" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל היצרנים</SelectItem>
                  {availableFilters.makes.map(make => (
                    <SelectItem key={make} value={make}>{make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {showPrices && (
                <>
                  <input
                    type="number"
                    placeholder="מחיר מ-"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-[100px] h-9 px-3 rounded-lg bg-[#e8e8ed]/60 border-0 text-[14px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40"
                  />
                  <input
                    type="number"
                    placeholder="מחיר עד"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-[100px] h-9 px-3 rounded-lg bg-[#e8e8ed]/60 border-0 text-[14px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40"
                  />
                </>
              )}

              {hasActiveFilters && (
                <button 
                  onClick={clearFilters} 
                  className="h-9 px-3 rounded-lg text-[14px] text-[#0071e3] hover:bg-[#0071e3]/10 transition-colors flex items-center gap-1"
                >
                  <X className="h-3.5 w-3.5" />
                  נקה
                </button>
              )}
            </div>

            {/* Mobile filter trigger */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <button className="md:hidden h-9 w-9 rounded-lg bg-[#e8e8ed]/60 flex items-center justify-center relative">
                  <SlidersHorizontal className="h-4 w-4 text-[#1d1d1f]" />
                  {hasActiveFilters && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#0071e3]" />
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-[20px] pb-8 border-0">
                <div className="w-9 h-1 rounded-full bg-[#d2d2d7] mx-auto mb-4 mt-2" />
                <SheetHeader>
                  <SheetTitle className="text-[20px] font-semibold text-[#1d1d1f] tracking-tight text-center">סינון</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-5 px-1">
                  <div>
                    <label className="text-[13px] font-medium text-[#86868b] uppercase tracking-wide mb-2 block">יצרן</label>
                    <Select value={selectedMake || "all"} onValueChange={(val) => setSelectedMake(val === "all" ? "" : val)}>
                      <SelectTrigger className="rounded-xl h-11 bg-[#f5f5f7] border-0 text-[15px]">
                        <SelectValue placeholder="בחר יצרן" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">הכל</SelectItem>
                        {availableFilters.makes.map(make => (
                          <SelectItem key={make} value={make}>{make}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {showPrices && (
                    <div>
                      <label className="text-[13px] font-medium text-[#86868b] uppercase tracking-wide mb-2 block">טווח מחירים</label>
                      <div className="flex gap-2">
                        <input type="number" placeholder="מינימום" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} 
                          className="flex-1 h-11 px-4 rounded-xl bg-[#f5f5f7] border-0 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40" />
                        <input type="number" placeholder="מקסימום" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} 
                          className="flex-1 h-11 px-4 rounded-xl bg-[#f5f5f7] border-0 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40" />
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-[13px] font-medium text-[#86868b] uppercase tracking-wide mb-2 block">טווח שנים</label>
                    <div className="flex gap-2">
                      <input type="number" placeholder="משנה" value={minYear} onChange={(e) => setMinYear(e.target.value)} 
                        className="flex-1 h-11 px-4 rounded-xl bg-[#f5f5f7] border-0 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40" />
                      <input type="number" placeholder="עד שנה" value={maxYear} onChange={(e) => setMaxYear(e.target.value)} 
                        className="flex-1 h-11 px-4 rounded-xl bg-[#f5f5f7] border-0 text-[15px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40" />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => setFiltersOpen(false)} 
                      className="flex-1 h-12 rounded-full bg-[#0071e3] text-white text-[15px] font-medium hover:bg-[#0077ed] active:scale-[0.98] transition-all"
                    >
                      הצג תוצאות
                    </button>
                    {hasActiveFilters && (
                      <button 
                        onClick={clearFilters} 
                        className="h-12 px-6 rounded-full bg-[#f5f5f7] text-[#1d1d1f] text-[15px] font-medium hover:bg-[#e8e8ed] active:scale-[0.98] transition-all"
                      >
                        נקה
                      </button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* ── Cars Grid ── */}
      <main className="max-w-[1120px] mx-auto px-5 pt-6 pb-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#86868b]" />
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-20 px-6">
            <div className="h-16 w-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-4">
              <Search className="h-7 w-7 text-[#86868b]" />
            </div>
            <h2 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">לא נמצאו רכבים</h2>
            <p className="text-[#86868b] text-[15px] mt-2">נסה לשנות את הסינון או החיפוש</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-4 text-[#0071e3] text-[15px] font-medium hover:underline">
                נקה סינון
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
              {filteredCars.map((car, index) => (
                <article 
                  key={car.id} 
                  className="group flex flex-col rounded-[20px] bg-white overflow-hidden transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  {/* Image */}
                  <div className="aspect-[4/3] relative bg-[#f5f5f7] overflow-hidden">
                    {car.image_url ? (
                      <img
                        src={car.image_url}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="h-12 w-12 text-[#d2d2d7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 00-.621-1.828l-2.073-2.592A4.5 4.5 0 0015.862 8.5H6.638a4.5 4.5 0 00-3.516 1.679L1.049 12.77A2.999 2.999 0 00.428 14.6v2.776C.428 17.996.932 18.5 1.553 18.5H3" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight leading-tight truncate">
                          {car.make} {car.model}
                        </h3>
                        <p className="text-[13px] text-[#86868b] mt-0.5">
                          {car.year}{car.trim_level ? ` · ${car.trim_level}` : ''}
                        </p>
                      </div>
                      {showPrices && (
                        <span className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight whitespace-nowrap">
                          {formatPrice(car.price)}
                        </span>
                      )}
                    </div>

                    {/* Specs — clean pill tags */}
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      <span className="inline-flex items-center h-7 px-3 rounded-full bg-[#f5f5f7] text-[12px] text-[#1d1d1f] font-medium">
                        {formatKilometers(car.kilometers)} ק״מ
                      </span>
                      {car.fuel_type && (
                        <span className="inline-flex items-center h-7 px-3 rounded-full bg-[#f5f5f7] text-[12px] text-[#1d1d1f] font-medium">
                          {translateFuelType(car.fuel_type)}
                        </span>
                      )}
                      {car.transmission && (
                        <span className="inline-flex items-center h-7 px-3 rounded-full bg-[#f5f5f7] text-[12px] text-[#1d1d1f] font-medium">
                          {translateTransmission(car.transmission)}
                        </span>
                      )}
                      {car.engine_size && (
                        <span className="inline-flex items-center h-7 px-3 rounded-full bg-[#f5f5f7] text-[12px] text-[#1d1d1f] font-medium">
                          {car.engine_size} סמ״ק
                        </span>
                      )}
                      {car.exterior_color && (
                        <span className="inline-flex items-center h-7 px-3 rounded-full bg-[#f5f5f7] text-[12px] text-[#1d1d1f] font-medium">
                          {translateColor(car.exterior_color)}
                        </span>
                      )}
                      {car.ownership_history && (
                        <span className="inline-flex items-center h-7 px-3 rounded-full bg-[#f5f5f7] text-[12px] text-[#1d1d1f] font-medium">
                          יד {car.ownership_history}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {car.description && (
                      <p className="text-[13px] text-[#86868b] mt-3 leading-relaxed line-clamp-2">
                        {car.description}
                      </p>
                    )}
                    
                    {/* CTA — pushed to bottom */}
                    <div className="mt-auto pt-4">
                      <button 
                        className="w-full h-10 rounded-full bg-[#1d1d1f] text-white text-[14px] font-medium flex items-center justify-center gap-2 hover:bg-[#000] active:scale-[0.98] transition-all duration-200"
                        onClick={() => handleWhatsAppClick(car)}
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {showPrices ? 'שלח הודעה' : 'לפרטים ומחיר'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-12">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-9 w-9 rounded-full flex items-center justify-center text-[#1d1d1f] hover:bg-[#f5f5f7] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 w-9 rounded-full text-[14px] font-medium transition-all ${
                      page === currentPage 
                        ? 'bg-[#1d1d1f] text-white' 
                        : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="h-9 w-9 rounded-full flex items-center justify-center text-[#1d1d1f] hover:bg-[#f5f5f7] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Floating WhatsApp ── */}
      <button
        onClick={() => handleWhatsAppClick()}
        className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.4)] flex items-center justify-center text-white bg-[#25D366] hover:bg-[#22c55e] hover:scale-110 active:scale-95 transition-all duration-300 z-50"
        aria-label="צור קשר בוואטסאפ"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </button>

      {/* ── Footer ── */}
      <footer className="border-t border-[#d2d2d7]/40 bg-[#f5f5f7]">
        <div className="max-w-[1120px] mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[12px] text-[#86868b]">© {new Date().getFullYear()} {dealer?.name}</p>
          <p className="text-[12px] text-[#86868b]">
            מופעל על ידי{' '}
            <a href="https://carsleadapp.com" className="text-[#0071e3] hover:underline underline-offset-2">
              CarsLead
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
