import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');
    
    // Filters
    const make = url.searchParams.get('make');
    const minYear = url.searchParams.get('minYear');
    const maxYear = url.searchParams.get('maxYear');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const fuelType = url.searchParams.get('fuelType');
    const transmission = url.searchParams.get('transmission');
    
    // Pagination
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📦 Fetching public inventory for slug: ${slug}`);

    // Create Supabase client with anon key for public access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get dealer profile by slug
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, company_name, phone, inventory_slug, inventory_enabled, inventory_settings')
      .eq('inventory_slug', slug)
      .eq('inventory_enabled', true)
      .single();

    if (profileError || !profile) {
      console.log(`❌ Profile not found for slug: ${slug}`, profileError);
      return new Response(
        JSON.stringify({ error: 'Inventory not found or not enabled' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Found dealer: ${profile.company_name || profile.full_name}`);

    // Build cars query with filters
    let carsQuery = supabase
      .from('cars')
      .select('id, make, model, year, price, kilometers, fuel_type, transmission, exterior_color, interior_color, engine_size, description, status, created_at, trim_level, entry_date, next_test_date, ownership_history, catalog_price', { count: 'exact' })
      .eq('user_id', profile.id)
      .eq('status', 'available')
      .eq('show_in_catalog', true)
      .order('created_at', { ascending: false });

    // Apply filters
    if (make) {
      carsQuery = carsQuery.ilike('make', `%${make}%`);
    }
    if (minYear) {
      carsQuery = carsQuery.gte('year', parseInt(minYear));
    }
    if (maxYear) {
      carsQuery = carsQuery.lte('year', parseInt(maxYear));
    }
    if (minPrice) {
      carsQuery = carsQuery.gte('price', parseInt(minPrice));
    }
    if (maxPrice) {
      carsQuery = carsQuery.lte('price', parseInt(maxPrice));
    }
    if (fuelType) {
      carsQuery = carsQuery.eq('fuel_type', fuelType);
    }
    if (transmission) {
      carsQuery = carsQuery.eq('transmission', transmission);
    }

    // Apply pagination
    carsQuery = carsQuery.range(offset, offset + limit - 1);

    const { data: cars, error: carsError, count } = await carsQuery;

    if (carsError) {
      console.log(`❌ Error fetching cars:`, carsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch cars' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get unique makes for filter options
    const { data: makes } = await supabase
      .from('cars')
      .select('make')
      .eq('user_id', profile.id)
      .eq('status', 'available');

    const uniqueMakes = [...new Set(makes?.map(c => c.make).filter(Boolean))];

    // Get car images for each car - return ALL images
    const carsWithImages = await Promise.all(
      (cars || []).map(async (car) => {
        const { data: files } = await supabase.storage
          .from('cars')
          .list(`${car.id}`);

        const imageUrls: string[] = [];
        if (files && files.length > 0) {
          const imageFiles = files
            .filter(f => 
              !f.id?.startsWith('.') && f.name.match(/\.(jpeg|jpg|png|gif|webp|avif)$/i)
            )
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

          for (const file of imageFiles) {
            const { data: urlData } = supabase.storage
              .from('cars')
              .getPublicUrl(`${car.id}/${file.name}`);
            if (urlData?.publicUrl) {
              imageUrls.push(`${urlData.publicUrl}?v=${encodeURIComponent(file.name)}`);
            }
          }
        }

        return {
          ...car,
          image_url: imageUrls[0] || null,
          image_urls: imageUrls,
        };
      })
    );

    console.log(`📊 Found ${carsWithImages.length} cars (total: ${count})`);

    const response = {
      dealer: {
        name: profile.company_name || profile.full_name,
        phone: profile.phone,
        settings: profile.inventory_settings || {}
      },
      cars: carsWithImages,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      filters: {
        makes: uniqueMakes
      }
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in get-public-inventory:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
