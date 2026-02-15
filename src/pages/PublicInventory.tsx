import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Car, Phone, Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface DealerInfo {
  name: string;
  phone: string;
  settings: {
    logo_url?: string;
    primary_color?: string;
    contact_phone?: string;
    show_phone?: boolean;
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
  description: string;
  image_url: string | null;
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
  
  // Filter state
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

      const { data, error } = await supabase.functions.invoke('get-public-inventory', {
        body: null,
        headers: {},
      });

      // Use fetch directly for GET request with query params
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-public-inventory?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
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

  // Get primary color from settings or use default
  const primaryColor = dealer?.settings?.primary_color || '#3b82f6';

  if (loading && !dealer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">טוען מלאי...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Car className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">דף המלאי לא נמצא</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header 
        className="sticky top-0 z-50 bg-white shadow-sm border-b"
        style={{ borderBottomColor: primaryColor }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {dealer?.settings?.logo_url ? (
                <img 
                  src={dealer.settings.logo_url} 
                  alt={dealer.name} 
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <div 
                  className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: primaryColor }}
                >
                  {dealer?.name?.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{dealer?.name}</h1>
                <p className="text-sm text-muted-foreground">{pagination?.total || 0} רכבים במלאי</p>
              </div>
            </div>
            
            {dealer?.phone && dealer.settings?.show_phone !== false && (
              <Button 
                onClick={() => handleWhatsAppClick()} 
                className="gap-2"
                style={{ backgroundColor: '#25D366' }}
              >
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">צור קשר</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Search and Filters Bar */}
      <div className="bg-white border-b sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש לפי יצרן או דגם..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            
            {/* Desktop Filters */}
            <div className="hidden md:flex gap-2 items-center">
              <Select value={selectedMake} onValueChange={setSelectedMake}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="יצרן" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">הכל</SelectItem>
                  {availableFilters.makes.map(make => (
                    <SelectItem key={make} value={make}>{make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                type="number"
                placeholder="מחיר מינימום"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-[130px]"
              />
              
              <Input
                type="number"
                placeholder="מחיר מקסימום"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-[130px]"
              />

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 ml-1" />
                  נקה
                </Button>
              )}
            </div>

            {/* Mobile Filter Button */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden relative">
                  <Filter className="h-4 w-4" />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>סינון רכבים</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">יצרן</label>
                    <Select value={selectedMake} onValueChange={setSelectedMake}>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר יצרן" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">הכל</SelectItem>
                        {availableFilters.makes.map(make => (
                          <SelectItem key={make} value={make}>{make}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">טווח מחירים</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="מינימום"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="מקסימום"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">טווח שנים</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="משנה"
                        value={minYear}
                        onChange={(e) => setMinYear(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="עד שנה"
                        value={maxYear}
                        onChange={(e) => setMaxYear(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => setFiltersOpen(false)} className="flex-1">
                      הצג תוצאות
                    </Button>
                    {hasActiveFilters && (
                      <Button variant="outline" onClick={clearFilters}>
                        נקה
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Cars Grid */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="text-center py-12">
            <Car className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">לא נמצאו רכבים</h2>
            <p className="text-muted-foreground mt-2">נסה לשנות את הסינון או החיפוש</p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                נקה סינון
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCars.map(car => (
                <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="aspect-[4/3] relative bg-gray-100">
                    {car.image_url ? (
                      <img
                        src={car.image_url}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    <Badge 
                      className="absolute top-2 right-2"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {car.year}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg text-gray-900">
                      {car.make} {car.model}
                    </h3>
                    <p className="text-2xl font-bold mt-1" style={{ color: primaryColor }}>
                      {formatPrice(car.price)}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3 text-sm text-muted-foreground">
                      <span>{formatKilometers(car.kilometers)} ק״מ</span>
                      {car.fuel_type && <span>• {car.fuel_type}</span>}
                      {car.transmission && <span>• {car.transmission}</span>}
                    </div>
                    <Button 
                      className="w-full mt-4 gap-2" 
                      onClick={() => handleWhatsAppClick(car)}
                      style={{ backgroundColor: '#25D366' }}
                    >
                      <Phone className="h-4 w-4" />
                      התעניינות
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  הקודם
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  עמוד {currentPage} מתוך {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage === pagination.totalPages}
                >
                  הבא
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Floating WhatsApp Button */}
      <button
        onClick={() => handleWhatsAppClick()}
        className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform z-50"
        style={{ backgroundColor: '#25D366' }}
        aria-label="צור קשר בוואטסאפ"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </button>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {dealer?.name}. כל הזכויות שמורות.</p>
          <p className="mt-1">
            מופעל על ידי <a href="https://carsleadapp.com" className="text-primary hover:underline">CarsLead</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
