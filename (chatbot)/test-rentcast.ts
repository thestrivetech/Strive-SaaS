// test-rentcast.ts - Simple RentCast API test
import { config } from 'dotenv';

// Load .env.local file explicitly
config({ path: '.env.local' });

const RENTCAST_API_KEY = process.env.RENTCAST_API_KEY;
const RENTCAST_BASE_URL = 'https://api.rentcast.io/v1';

async function testRentCastAPI() {
  console.log('🔑 API Key:', RENTCAST_API_KEY ? `${RENTCAST_API_KEY.slice(0, 8)}...` : 'MISSING');

  try {
    const url = new URL(`${RENTCAST_BASE_URL}/listings/sale`);
    url.searchParams.append('city', 'Nashville');
    url.searchParams.append('state', 'TN');
    url.searchParams.append('maxPrice', '500000');
    url.searchParams.append('bedrooms', '3');
    url.searchParams.append('status', 'Active');
    url.searchParams.append('limit', '5');

    console.log('🔍 Fetching from:', url.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'X-Api-Key': RENTCAST_API_KEY!,
        'Accept': 'application/json',
      },
    });

    console.log('📡 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Success! Got', Array.isArray(data) ? data.length : 'unknown', 'properties');

    if (Array.isArray(data) && data.length > 0) {
      console.log('\n📍 First property:');
      console.log('  Address:', data[0].addressLine1 || data[0].address);
      console.log('  City:', data[0].city);
      console.log('  Price:', data[0].price);
      console.log('  Beds:', data[0].bedrooms);
      console.log('  MLS ID:', data[0].mlsId);
    } else {
      console.log('⚠️  No properties returned');
      console.log('Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

testRentCastAPI();
