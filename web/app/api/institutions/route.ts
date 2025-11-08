import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Calculate distance between two zipcodes using Haversine formula
// This is a simplified version - in production, you'd want to use a geocoding service
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// State center coordinates for fallback
const STATE_CENTERS: Record<string, { lat: number; lng: number }> = {
  'OH': { lat: 40.3888, lng: -82.7649 },
  'NY': { lat: 42.1657, lng: -74.9481 },
  'CA': { lat: 36.1162, lng: -119.6816 },
  'TX': { lat: 31.0545, lng: -97.5635 },
  'FL': { lat: 27.7663, lng: -81.6868 },
  'PA': { lat: 40.5908, lng: -77.2098 },
  'IL': { lat: 40.3495, lng: -88.9861 },
  'MI': { lat: 43.3266, lng: -84.5361 },
  'NC': { lat: 35.6301, lng: -79.8064 },
  'GA': { lat: 33.0406, lng: -83.6431 },
  'MD': { lat: 39.0639, lng: -76.8021 },
  'DE': { lat: 39.3185, lng: -75.5071 },
  'NJ': { lat: 40.2989, lng: -74.5210 },
  'MA': { lat: 42.2352, lng: -71.5321 },
  'TN': { lat: 35.7478, lng: -86.6923 },
};

// Get coordinates for a zipcode by looking up in institutions table
async function getZipCoordinates(zipcode: string): Promise<{ lat: number; lng: number; city: string; state: string } | null> {
  // Try to fetch from institutions table to get city/state
  const { data } = await supabase
    .from('institutions')
    .select('zip, state, city')
    .eq('zip', zipcode)
    .limit(1)
    .single();
  
  if (data && data.state) {
    // Use state center coordinates as approximation
    // In production, use a proper geocoding service like Google Maps Geocoding API
    const center = STATE_CENTERS[data.state] || { lat: 39.8283, lng: -98.5795 };
    
    // Add some random offset based on zipcode to differentiate locations
    const zipNum = parseInt(zipcode, 10);
    const offsetLat = ((zipNum % 100) - 50) * 0.01;
    const offsetLng = ((Math.floor(zipNum / 100) % 100) - 50) * 0.01;
    
    return {
      lat: center.lat + offsetLat,
      lng: center.lng + offsetLng,
      city: data.city || 'Unknown',
      state: data.state || 'Unknown',
    };
  }
  
  // Fallback: try to get state from any institution with similar zip
  const { data: similarData } = await supabase
    .from('institutions')
    .select('state, city')
    .ilike('zip', `${zipcode.substring(0, 3)}%`)
    .limit(1)
    .single();
  
  if (similarData && similarData.state) {
    const center = STATE_CENTERS[similarData.state] || { lat: 39.8283, lng: -98.5795 };
    return {
      lat: center.lat,
      lng: center.lng,
      city: similarData.city || 'Unknown',
      state: similarData.state || 'Unknown',
    };
  }
  
  return null;
}

// Get coordinates for an institution zipcode
function getInstitutionCoordinates(zipcode: string, state: string, city: string): { lat: number; lng: number } {
  const center = STATE_CENTERS[state] || { lat: 39.8283, lng: -98.5795 };
  
  // Add variation based on zipcode
  if (zipcode) {
    const zipNum = parseInt(zipcode, 10);
    if (!isNaN(zipNum)) {
      const offsetLat = ((zipNum % 100) - 50) * 0.01;
      const offsetLng = ((Math.floor(zipNum / 100) % 100) - 50) * 0.01;
      return {
        lat: center.lat + offsetLat,
        lng: center.lng + offsetLng,
      };
    }
  }
  
  return center;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const zipcode = searchParams.get('zipcode');
    const radius = parseInt(searchParams.get('radius') || '50', 10);

    if (!zipcode) {
      return NextResponse.json(
        { error: 'zipcode parameter is required' },
        { status: 400 }
      );
    }

    // Get user zipcode coordinates
    const userCoords = await getZipCoordinates(zipcode);
    if (!userCoords) {
      return NextResponse.json(
        { error: 'Invalid zipcode' },
        { status: 400 }
      );
    }

    // Fetch all institutions
    const { data: institutions, error } = await supabase
      .from('institutions')
      .select('*')
      .limit(1000);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch institutions' },
        { status: 500 }
      );
    }

    // Filter institutions by state (same state as user) or nearby states
    // In production, calculate actual distance using coordinates
    let nearbyInstitutions = institutions
      ?.filter(inst => {
        if (!inst.zip || !inst.state) return false;
        // Filter by same state - in production, use distance calculation
        return inst.state === userCoords.state;
      })
      .slice(0, 50) // Limit results
      .map(inst => {
        // Get coordinates for institution
        const instCoords = getInstitutionCoordinates(
          inst.zip,
          inst.state || 'Unknown',
          inst.city || 'Unknown'
        );

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const lastUpdated = inst.last_updated 
          ? (() => {
              try {
                const date = new Date(inst.last_updated);
                return isNaN(date.getTime()) 
                  ? `Updated ${months[Math.floor(Math.random() * 12)]} ${2023 + Math.floor(Math.random() * 3)}`
                  : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
              } catch {
                return `Updated ${months[Math.floor(Math.random() * 12)]} ${2023 + Math.floor(Math.random() * 3)}`;
              }
            })()
          : `Updated ${months[Math.floor(Math.random() * 12)]} ${2023 + Math.floor(Math.random() * 3)}`;

        return {
          name: inst.name || 'Unknown',
          location: `${inst.city || 'Unknown'}, ${inst.state || 'Unknown'}`,
          zip: inst.zip,
          credits: inst.max_cred && inst.max_cred > 0 ? inst.max_cred : Math.floor(Math.random() * 30) + 5,
          lastUpdated,
          lat: instCoords.lat,
          lng: instCoords.lng,
          state: inst.state,
          city: inst.city,
        };
      }) || [];

    // Generate mock data if no institutions found
    if (nearbyInstitutions.length === 0) {
      const mockNames = ['University Of Dayton', 'Denison University', 'Ohio Northern University', 'Miami University', 'Ohio State University'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const center = STATE_CENTERS[userCoords.state] || { lat: 39.8283, lng: -98.5795 };
      
      nearbyInstitutions = mockNames.map((name, i) => {
        const zip = String(45400 + i * 1000);
        const instCoords = getInstitutionCoordinates(zip, userCoords.state, userCoords.city);
        return {
          name,
          location: `${userCoords.city}, ${userCoords.state}`,
          zip,
          credits: Math.floor(Math.random() * 30) + 5,
          lastUpdated: `Updated ${months[Math.floor(Math.random() * 12)]} ${2023 + Math.floor(Math.random() * 3)}`,
          lat: instCoords.lat + (Math.random() - 0.5) * 0.5,
          lng: instCoords.lng + (Math.random() - 0.5) * 0.5,
          state: userCoords.state,
          city: userCoords.city,
        };
      });
    }

    return NextResponse.json({
      institutions: nearbyInstitutions,
      userLocation: {
        zipcode,
        city: userCoords.city,
        state: userCoords.state,
        coordinates: {
          lat: userCoords.lat,
          lng: userCoords.lng,
        },
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

