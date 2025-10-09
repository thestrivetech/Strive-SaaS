/**
 * Mock REID (Real Estate Intelligence Dashboard) Data
 *
 * Generate mock data for REID module (market data, trends, demographics, ROI, alerts, schools, reports)
 */

import {
  generateId,
  randomFromArray,
  randomName,
  randomCurrency,
  randomPastDate,
  randomFutureDate,
  randomBoolean,
  randomInt,
  randomDate,
  CITIES,
  STATES,
} from './generators';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type MockMarketData = {
  id: string;
  zip_code: string;
  city: string;
  state: string;
  county: string;
  median_price: number;
  price_change_1mo: number; // percentage
  price_change_3mo: number; // percentage
  price_change_1yr: number; // percentage
  avg_days_on_market: number;
  inventory_count: number;
  sales_volume: number;
  price_per_sqft: number;
  market_temperature: 'HOT' | 'WARM' | 'MODERATE' | 'COOL' | 'COLD';
  demand_score: number; // 0-100
  supply_score: number; // 0-100
  investment_score: number; // 0-100
  last_updated: Date;
};

export type MockTrendPoint = {
  date: Date;
  median_price: number;
  avg_price: number;
  sales_count: number;
  inventory: number;
  prediction?: boolean; // true for future predictions
};

export type MockDemographics = {
  id: string;
  zip_code: string;
  city: string;
  state: string;
  population: number;
  median_age: number;
  median_income: number;
  unemployment_rate: number;
  education_level: 'HIGH_SCHOOL' | 'SOME_COLLEGE' | 'BACHELORS' | 'GRADUATE';
  homeownership_rate: number; // percentage
  avg_household_size: number;
  growth_rate_1yr: number; // percentage
  growth_rate_5yr: number; // percentage
};

export type MockROISimulation = {
  id: string;
  property_price: number;
  down_payment: number;
  loan_amount: number;
  interest_rate: number;
  loan_term: number; // years
  monthly_payment: number;
  property_tax: number;
  insurance: number;
  hoa_fees: number;
  maintenance: number;
  monthly_expenses: number;
  rental_income: number;
  monthly_cash_flow: number;
  annual_cash_flow: number;
  cash_on_cash_return: number; // percentage
  cap_rate: number; // percentage
  total_roi_5yr: number; // percentage
  total_roi_10yr: number; // percentage
  appreciation_rate: number; // percentage
  equity_5yr: number;
  equity_10yr: number;
  created_at: Date;
};

export type MockAlert = {
  id: string;
  title: string;
  description: string;
  alert_type: 'PRICE_DROP' | 'HOT_MARKET' | 'NEW_LISTING' | 'INVESTMENT_OPPORTUNITY' | 'MARKET_SHIFT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  zip_code: string;
  city: string;
  state: string;
  metadata: {
    current_value?: number;
    previous_value?: number;
    change_percentage?: number;
    listing_count?: number;
    demand_score?: number;
  };
  is_read: boolean;
  is_dismissed: boolean;
  created_at: Date;
  expires_at: Date | null;
};

export type MockSchool = {
  id: string;
  name: string;
  type: 'ELEMENTARY' | 'MIDDLE' | 'HIGH' | 'PRIVATE' | 'CHARTER';
  address: string;
  city: string;
  state: string;
  zip_code: string;
  rating: number; // 1-10
  test_scores: number; // 0-100
  student_count: number;
  teacher_ratio: number;
  distance_miles: number; // from reference point
  grade_levels: string;
  district: string;
};

export type MockAIProfile = {
  id: string;
  property_address: string;
  profile_name: string;
  analysis_date: Date;
  ai_score: number; // 0-100
  score_breakdown: {
    location: number;
    financials: number;
    appreciation: number;
    cash_flow: number;
    risk: number;
  };
  insights: string[];
  market_comparison: {
    average_roi: number;
    average_cash_flow: number;
    appreciation_rate: number;
  };
  recommendation: 'strong-buy' | 'buy' | 'hold' | 'pass';
  estimated_roi: number;
  estimated_cash_flow: number;
  status: 'active' | 'archived';
  zip_code: string;
  city: string;
  state: string;
};

export type MockREIDReport = {
  id: string;
  title: string;
  report_type: 'MARKET_ANALYSIS' | 'INVESTMENT_OPPORTUNITY' | 'COMPARATIVE_ANALYSIS' | 'TREND_FORECAST';
  zip_codes: string[];
  cities: string[];
  generated_at: Date;
  summary: string;
  key_findings: string[];
  market_data: MockMarketData[];
  trends: MockTrendPoint[];
  recommendations: string[];
};

// ============================================================================
// DATA POOLS
// ============================================================================

export const MAJOR_METROS: Array<{ zip: string; city: string; state: string; county: string; lat: number; lng: number }> = [
  { zip: '90210', city: 'Beverly Hills', state: 'CA', county: 'Los Angeles', lat: 34.0901, lng: -118.4065 },
  { zip: '10001', city: 'Manhattan', state: 'NY', county: 'New York', lat: 40.7506, lng: -73.9971 },
  { zip: '33139', city: 'Miami Beach', state: 'FL', county: 'Miami-Dade', lat: 25.7907, lng: -80.1300 },
  { zip: '60611', city: 'Chicago', state: 'IL', county: 'Cook', lat: 41.8937, lng: -87.6229 },
  { zip: '02108', city: 'Boston', state: 'MA', county: 'Suffolk', lat: 42.3588, lng: -71.0707 },
  { zip: '78701', city: 'Austin', state: 'TX', county: 'Travis', lat: 30.2747, lng: -97.7403 },
  { zip: '98101', city: 'Seattle', state: 'WA', county: 'King', lat: 47.6110, lng: -122.3321 },
  { zip: '94102', city: 'San Francisco', state: 'CA', county: 'San Francisco', lat: 37.7795, lng: -122.4193 },
  { zip: '80202', city: 'Denver', state: 'CO', county: 'Denver', lat: 39.7525, lng: -104.9907 },
  { zip: '30303', city: 'Atlanta', state: 'GA', county: 'Fulton', lat: 33.7537, lng: -84.3863 },
  { zip: '85003', city: 'Phoenix', state: 'AZ', county: 'Maricopa', lat: 33.4500, lng: -112.0667 },
  { zip: '97201', city: 'Portland', state: 'OR', county: 'Multnomah', lat: 45.5152, lng: -122.6784 },
  { zip: '89101', city: 'Las Vegas', state: 'NV', county: 'Clark', lat: 36.1716, lng: -115.1391 },
  { zip: '92101', city: 'San Diego', state: 'CA', county: 'San Diego', lat: 32.7174, lng: -117.1628 },
  { zip: '19102', city: 'Philadelphia', state: 'PA', county: 'Philadelphia', lat: 39.9500, lng: -75.1667 },
  { zip: '20001', city: 'Washington', state: 'DC', county: 'District of Columbia', lat: 38.9072, lng: -77.0369 },
  { zip: '37201', city: 'Nashville', state: 'TN', county: 'Davidson', lat: 36.1622, lng: -86.7744 },
  { zip: '28202', city: 'Charlotte', state: 'NC', county: 'Mecklenburg', lat: 35.2251, lng: -80.8431 },
  { zip: '75201', city: 'Dallas', state: 'TX', county: 'Dallas', lat: 32.7767, lng: -96.7970 },
  { zip: '77002', city: 'Houston', state: 'TX', county: 'Harris', lat: 29.7589, lng: -95.3677 },
  { zip: '55401', city: 'Minneapolis', state: 'MN', county: 'Hennepin', lat: 44.9772, lng: -93.2654 },
  { zip: '48201', city: 'Detroit', state: 'MI', county: 'Wayne', lat: 42.3834, lng: -83.1024 },
  { zip: '63101', city: 'St. Louis', state: 'MO', county: 'St. Louis', lat: 38.6273, lng: -90.1979 },
  { zip: '43215', city: 'Columbus', state: 'OH', county: 'Franklin', lat: 39.9830, lng: -82.9831 },
  { zip: '46204', city: 'Indianapolis', state: 'IN', county: 'Marion', lat: 39.7767, lng: -86.1459 },
  { zip: '64101', city: 'Kansas City', state: 'MO', county: 'Jackson', lat: 39.1000, lng: -94.5786 },
  { zip: '53202', city: 'Milwaukee', state: 'WI', county: 'Milwaukee', lat: 43.0350, lng: -87.9225 },
  { zip: '27601', city: 'Raleigh', state: 'NC', county: 'Wake', lat: 35.7721, lng: -78.6386 },
  { zip: '23219', city: 'Richmond', state: 'VA', county: 'Richmond', lat: 37.5385, lng: -77.4342 },
  { zip: '45202', city: 'Cincinnati', state: 'OH', county: 'Hamilton', lat: 39.1014, lng: -84.5124 },
  { zip: '15222', city: 'Pittsburgh', state: 'PA', county: 'Allegheny', lat: 40.4397, lng: -79.9764 },
  { zip: '21201', city: 'Baltimore', state: 'MD', county: 'Baltimore', lat: 39.2908, lng: -76.6108 },
  { zip: '32801', city: 'Orlando', state: 'FL', county: 'Orange', lat: 28.5421, lng: -81.3782 },
  { zip: '33602', city: 'Tampa', state: 'FL', county: 'Hillsborough', lat: 27.9477, lng: -82.4584 },
  { zip: '87102', city: 'Albuquerque', state: 'NM', county: 'Bernalillo', lat: 35.0841, lng: -106.6511 },
  { zip: '73102', city: 'Oklahoma City', state: 'OK', county: 'Oklahoma', lat: 35.4677, lng: -97.5164 },
  { zip: '40202', city: 'Louisville', state: 'KY', county: 'Jefferson', lat: 38.2542, lng: -85.7594 },
  { zip: '70112', city: 'New Orleans', state: 'LA', county: 'Orleans', lat: 29.9499, lng: -90.0701 },
  { zip: '38103', city: 'Memphis', state: 'TN', county: 'Shelby', lat: 35.1174, lng: -89.9711 },
  { zip: '96813', city: 'Honolulu', state: 'HI', county: 'Honolulu', lat: 21.3045, lng: -157.8557 },
  { zip: '99501', city: 'Anchorage', state: 'AK', county: 'Anchorage', lat: 61.2176, lng: -149.8997 },
  { zip: '84101', city: 'Salt Lake City', state: 'UT', county: 'Salt Lake', lat: 40.7670, lng: -111.8904 },
  { zip: '68102', city: 'Omaha', state: 'NE', county: 'Douglas', lat: 41.2587, lng: -95.9378 },
  { zip: '50309', city: 'Des Moines', state: 'IA', county: 'Polk', lat: 41.5910, lng: -93.6037 },
  { zip: '83702', city: 'Boise', state: 'ID', county: 'Ada', lat: 43.6177, lng: -116.2016 },
  { zip: '59601', city: 'Helena', state: 'MT', county: 'Lewis and Clark', lat: 46.5958, lng: -112.0270 },
  { zip: '82001', city: 'Cheyenne', state: 'WY', county: 'Laramie', lat: 41.1400, lng: -104.8202 },
  { zip: '57104', city: 'Sioux Falls', state: 'SD', county: 'Minnehaha', lat: 43.5499, lng: -96.7003 },
  { zip: '58102', city: 'Fargo', state: 'ND', county: 'Cass', lat: 46.8772, lng: -96.7894 },
  { zip: '05401', city: 'Burlington', state: 'VT', county: 'Chittenden', lat: 44.4759, lng: -73.2121 },
];

const MARKET_TEMPERATURES: MockMarketData['market_temperature'][] = [
  'HOT', 'HOT', // 10% hot
  'WARM', 'WARM', 'WARM', 'WARM', // 20% warm
  'MODERATE', 'MODERATE', 'MODERATE', 'MODERATE', 'MODERATE', 'MODERATE', 'MODERATE', 'MODERATE', // 40% moderate
  'COOL', 'COOL', 'COOL', 'COOL', // 20% cool
  'COLD', 'COLD', // 10% cold
];

const EDUCATION_LEVELS: MockDemographics['education_level'][] = [
  'HIGH_SCHOOL', 'HIGH_SCHOOL', 'HIGH_SCHOOL', // 30%
  'SOME_COLLEGE', 'SOME_COLLEGE', 'SOME_COLLEGE', // 30%
  'BACHELORS', 'BACHELORS', 'BACHELORS', // 30%
  'GRADUATE', // 10%
];

const SCHOOL_NAMES = [
  'Lincoln Elementary School',
  'Washington Elementary School',
  'Jefferson Elementary School',
  'Madison Elementary School',
  'Monroe Elementary School',
  'Roosevelt Middle School',
  'Kennedy Middle School',
  'Jackson Middle School',
  'Wilson Middle School',
  'Adams Middle School',
  'Franklin High School',
  'Jefferson High School',
  'Lincoln High School',
  'Washington High School',
  'Roosevelt High School',
  'King Academy',
  'Summit Preparatory School',
  'Valley Charter School',
  'Mountain View Private School',
  'Riverside Academy',
  'Oak Grove Elementary',
  'Maple Street School',
  'Pine Hill Elementary',
  'Cedar Lane School',
  'Elm Street Academy',
  'Parkside Middle School',
  'Lakeside School',
  'Hillcrest Academy',
  'Valley View School',
  'Riverside High School',
  'Mountain Peak Academy',
  'Sunset High School',
  'Heritage Preparatory',
  'Discovery Charter School',
  'Innovation Academy',
  'Excellence Charter School',
  'Achievement Academy',
  'Pioneer Preparatory',
  'Horizon High School',
  'Skyline Academy',
];

const SCHOOL_DISTRICTS = [
  'Metropolitan School District',
  'City Unified School District',
  'County Public Schools',
  'Regional School District',
  'Valley School District',
  'Mountain School District',
  'Riverside School District',
  'Central School District',
  'North School District',
  'South School District',
  'East School District',
  'West School District',
  'Independent School District',
  'Charter School Network',
  'Academy District',
  'Public Schools System',
  'Educational District',
  'Unified District',
  'Consolidated Schools',
  'Learning District',
];

const ALERT_TITLES: { [K in MockAlert['alert_type']]: string[] } = {
  PRICE_DROP: [
    'Price Drop Alert: Beverly Hills Luxury Market',
    'Median Price Down 8% in Manhattan Downtown',
    'Significant Price Reduction: Miami Beach Condos',
    'Property Values Dropping: Chicago Gold Coast',
    'Price Alert: Austin Tech District Homes',
    'Market Cooling: Seattle Waterfront Properties',
  ],
  HOT_MARKET: [
    'Hot Market Alert: Phoenix Suburbs Heating Up',
    'High Demand: Denver Tech Corridor Properties',
    'Seller\'s Market: Portland East Side',
    'Competitive Market: San Diego Coastal Areas',
    'Hot Zone: Nashville Music District',
    'High Activity: Dallas Uptown District',
  ],
  NEW_LISTING: [
    'New Luxury Listings: Beverly Hills 90210',
    'Fresh Inventory: Manhattan Penthouses',
    'New Developments: Miami Beach Waterfront',
    'Just Listed: Chicago Loop High-Rises',
    'New Construction: Austin Downtown',
    'Latest Listings: Seattle Capitol Hill',
  ],
  INVESTMENT_OPPORTUNITY: [
    'Investment Alert: Undervalued Phoenix Properties',
    'High ROI Potential: Detroit Revival Areas',
    'Investment Opportunity: Memphis Growth Zones',
    'Cash Flow Properties: Cleveland Market',
    'Value Investment: Baltimore Harbor Area',
    'ROI Alert: Cincinnati Urban Core',
  ],
  MARKET_SHIFT: [
    'Market Shift: San Francisco Inventory Rising',
    'Trend Change: Boston Buyer\'s Market Emerging',
    'Market Update: Los Angeles Price Stabilization',
    'Shift Alert: Washington DC Cooling Trend',
    'Market Change: Charlotte Balanced Market',
    'Trend Shift: Raleigh Inventory Increase',
  ],
};

// ============================================================================
// MARKET DATA GENERATORS
// ============================================================================

/**
 * Generate a mock market data entry for a specific zip code
 */
export function generateMockMarketData(
  zipCode: string,
  overrides?: Partial<MockMarketData>
): MockMarketData {
  const metro = MAJOR_METROS.find((m) => m.zip === zipCode) || randomFromArray(MAJOR_METROS);
  const temperature = overrides?.market_temperature || randomFromArray(MARKET_TEMPERATURES);

  // Base median price varies by market temperature
  let basePrice = randomInt(200000, 800000);
  if (temperature === 'HOT') {
    basePrice = randomInt(600000, 2000000);
  } else if (temperature === 'WARM') {
    basePrice = randomInt(400000, 1200000);
  } else if (temperature === 'COOL') {
    basePrice = randomInt(250000, 600000);
  } else if (temperature === 'COLD') {
    basePrice = randomInt(150000, 400000);
  }

  // Price changes correlate with temperature
  const priceChange1mo = temperature === 'HOT' ? randomInt(2, 8) :
                         temperature === 'WARM' ? randomInt(0, 5) :
                         temperature === 'COOL' ? randomInt(-5, 1) :
                         temperature === 'COLD' ? randomInt(-10, -2) :
                         randomInt(-3, 3);

  const priceChange3mo = priceChange1mo * (randomInt(25, 35) / 10);
  const priceChange1yr = priceChange3mo * (randomInt(35, 45) / 10);

  // Market scores
  const demandScore = temperature === 'HOT' ? randomInt(80, 100) :
                      temperature === 'WARM' ? randomInt(60, 85) :
                      temperature === 'COOL' ? randomInt(30, 55) :
                      temperature === 'COLD' ? randomInt(10, 35) :
                      randomInt(40, 70);

  const supplyScore = 100 - demandScore + randomInt(-15, 15);
  const investmentScore = Math.floor((demandScore * 0.6) + (priceChange1yr * 2) + randomInt(-10, 10));

  return {
    id: generateId(),
    zip_code: metro.zip,
    city: metro.city,
    state: metro.state,
    county: metro.county,
    median_price: basePrice,
    price_change_1mo: priceChange1mo,
    price_change_3mo: priceChange3mo,
    price_change_1yr: priceChange1yr,
    avg_days_on_market: temperature === 'HOT' ? randomInt(10, 25) :
                        temperature === 'WARM' ? randomInt(25, 45) :
                        temperature === 'COOL' ? randomInt(45, 75) :
                        temperature === 'COLD' ? randomInt(75, 120) :
                        randomInt(30, 60),
    inventory_count: randomInt(50, 500),
    sales_volume: randomInt(1000000, 50000000),
    price_per_sqft: Math.floor(basePrice / randomInt(1200, 2500)),
    market_temperature: temperature,
    demand_score: Math.min(100, Math.max(0, demandScore)),
    supply_score: Math.min(100, Math.max(0, supplyScore)),
    investment_score: Math.min(100, Math.max(0, investmentScore)),
    last_updated: randomPastDate(7),
    ...overrides,
  };
}

/**
 * Generate multiple market data entries (50 major metros)
 */
export function generateMockMarketDataSet(count: number = 50): MockMarketData[] {
  return MAJOR_METROS.slice(0, count).map((metro) => generateMockMarketData(metro.zip));
}

// ============================================================================
// TREND GENERATORS
// ============================================================================

/**
 * Generate a single trend data point
 */
export function generateMockTrendPoint(
  date: Date,
  basePrice: number,
  variance: number
): MockTrendPoint {
  const priceVariation = randomInt(-variance, variance);
  const medianPrice = Math.floor(basePrice + priceVariation);
  const avgPrice = Math.floor(medianPrice * randomInt(105, 115) / 100);

  return {
    date,
    median_price: medianPrice,
    avg_price: avgPrice,
    sales_count: randomInt(50, 300),
    inventory: randomInt(100, 800),
    prediction: false,
  };
}

/**
 * Generate trend series (historical + predictions)
 */
export function generateMockTrendSeries(
  zipCode: string,
  historicalMonths: number = 24,
  predictionMonths: number = 12
): { historical: MockTrendPoint[]; predictions: MockTrendPoint[] } {
  const marketData = generateMockMarketData(zipCode);
  const basePrice = marketData.median_price;
  const variance = basePrice * 0.05; // 5% variance

  const now = new Date();
  const historical: MockTrendPoint[] = [];
  const predictions: MockTrendPoint[] = [];

  // Generate historical data
  for (let i = historicalMonths - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    historical.push(generateMockTrendPoint(date, basePrice, variance));
  }

  // Generate predictions (with trend based on market temperature)
  const trendMultiplier = marketData.market_temperature === 'HOT' ? 1.02 :
                          marketData.market_temperature === 'WARM' ? 1.01 :
                          marketData.market_temperature === 'COOL' ? 0.99 :
                          marketData.market_temperature === 'COLD' ? 0.98 :
                          1.0;

  let predictedPrice = basePrice;
  for (let i = 1; i <= predictionMonths; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    predictedPrice = predictedPrice * trendMultiplier;
    const point = generateMockTrendPoint(date, predictedPrice, variance * 1.5);
    point.prediction = true;
    predictions.push(point);
  }

  return { historical, predictions };
}

// ============================================================================
// DEMOGRAPHICS GENERATORS
// ============================================================================

/**
 * Generate demographics for a zip code
 */
export function generateMockDemographics(
  zipCode: string,
  overrides?: Partial<MockDemographics>
): MockDemographics {
  const metro = MAJOR_METROS.find((m) => m.zip === zipCode) || randomFromArray(MAJOR_METROS);

  return {
    id: generateId(),
    zip_code: metro.zip,
    city: metro.city,
    state: metro.state,
    population: randomInt(15000, 120000),
    median_age: randomInt(28, 52),
    median_income: randomInt(45000, 150000),
    unemployment_rate: randomInt(2, 10),
    education_level: randomFromArray(EDUCATION_LEVELS),
    homeownership_rate: randomInt(35, 75),
    avg_household_size: randomInt(22, 32) / 10, // 2.2 - 3.2
    growth_rate_1yr: randomInt(-5, 15) / 10, // -0.5% to 1.5%
    growth_rate_5yr: randomInt(-10, 40) / 10, // -1.0% to 4.0%
    ...overrides,
  };
}

/**
 * Generate demographics set for multiple zip codes
 */
export function generateMockDemographicsSet(count: number = 50): MockDemographics[] {
  return MAJOR_METROS.slice(0, count).map((metro) => generateMockDemographics(metro.zip));
}

// ============================================================================
// ROI SIMULATION GENERATORS
// ============================================================================

/**
 * Generate ROI simulation with accurate calculations
 */
export function generateMockROISimulation(
  propertyPrice: number,
  overrides?: Partial<MockROISimulation>
): MockROISimulation {
  const downPaymentPct = overrides?.down_payment ? (overrides.down_payment / propertyPrice) * 100 : randomInt(10, 30);
  const downPayment = Math.floor((propertyPrice * downPaymentPct) / 100);
  const loanAmount = propertyPrice - downPayment;
  const interestRate = overrides?.interest_rate || randomInt(5, 8) + (randomInt(0, 99) / 100);
  const loanTerm = overrides?.loan_term || randomInt(15, 30);

  // Calculate monthly payment (principal + interest)
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  const monthlyPayment = Math.floor(
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  );

  // Monthly expenses
  const propertyTax = Math.floor((propertyPrice * 0.012) / 12); // 1.2% annual
  const insurance = Math.floor((propertyPrice * 0.008) / 12); // 0.8% annual
  const hoaFees = randomBoolean() ? randomInt(100, 500) : 0;
  const maintenance = Math.floor((propertyPrice * 0.01) / 12); // 1% annual
  const monthlyExpenses = monthlyPayment + propertyTax + insurance + hoaFees + maintenance;

  // Rental income
  const rentalIncome = Math.floor((propertyPrice * 0.008)); // 0.8% monthly (9.6% annual)
  const monthlyCashFlow = rentalIncome - monthlyExpenses;
  const annualCashFlow = monthlyCashFlow * 12;

  // Returns
  const cashOnCashReturn = (annualCashFlow / downPayment) * 100;
  const capRate = ((rentalIncome * 12) / propertyPrice) * 100;
  const appreciationRate = randomInt(2, 6) + (randomInt(0, 99) / 100);

  // 5-year projections
  const futureValue5yr = propertyPrice * Math.pow(1 + appreciationRate / 100, 5);
  const remainingLoan5yr = loanAmount * Math.pow(1 + monthlyRate, 60) -
                           monthlyPayment * ((Math.pow(1 + monthlyRate, 60) - 1) / monthlyRate);
  const equity5yr = futureValue5yr - remainingLoan5yr;
  const totalRoi5yr = ((equity5yr - downPayment + annualCashFlow * 5) / downPayment) * 100;

  // 10-year projections
  const futureValue10yr = propertyPrice * Math.pow(1 + appreciationRate / 100, 10);
  const remainingLoan10yr = loanAmount * Math.pow(1 + monthlyRate, 120) -
                            monthlyPayment * ((Math.pow(1 + monthlyRate, 120) - 1) / monthlyRate);
  const equity10yr = futureValue10yr - remainingLoan10yr;
  const totalRoi10yr = ((equity10yr - downPayment + annualCashFlow * 10) / downPayment) * 100;

  return {
    id: generateId(),
    property_price: propertyPrice,
    down_payment: downPayment,
    loan_amount: loanAmount,
    interest_rate: interestRate,
    loan_term: loanTerm,
    monthly_payment: monthlyPayment,
    property_tax: propertyTax,
    insurance: insurance,
    hoa_fees: hoaFees,
    maintenance: maintenance,
    monthly_expenses: monthlyExpenses,
    rental_income: rentalIncome,
    monthly_cash_flow: monthlyCashFlow,
    annual_cash_flow: annualCashFlow,
    cash_on_cash_return: Math.round(cashOnCashReturn * 100) / 100,
    cap_rate: Math.round(capRate * 100) / 100,
    total_roi_5yr: Math.round(totalRoi5yr * 100) / 100,
    total_roi_10yr: Math.round(totalRoi10yr * 100) / 100,
    appreciation_rate: appreciationRate,
    equity_5yr: Math.floor(equity5yr),
    equity_10yr: Math.floor(equity10yr),
    created_at: new Date(),
    ...overrides,
  };
}

// ============================================================================
// ALERT GENERATORS
// ============================================================================

/**
 * Generate a mock alert
 */
export function generateMockAlert(
  zipCode: string,
  overrides?: Partial<MockAlert>
): MockAlert {
  const metro = MAJOR_METROS.find((m) => m.zip === zipCode) || randomFromArray(MAJOR_METROS);
  const alertType = overrides?.alert_type || randomFromArray([
    'PRICE_DROP',
    'HOT_MARKET',
    'NEW_LISTING',
    'INVESTMENT_OPPORTUNITY',
    'MARKET_SHIFT',
  ] as MockAlert['alert_type'][]);

  const severity: MockAlert['severity'] =
    alertType === 'INVESTMENT_OPPORTUNITY' || alertType === 'HOT_MARKET' ?
      randomFromArray(['HIGH', 'URGENT']) :
    alertType === 'PRICE_DROP' || alertType === 'MARKET_SHIFT' ?
      randomFromArray(['MEDIUM', 'HIGH']) :
      randomFromArray(['LOW', 'MEDIUM']);

  const title = randomFromArray(ALERT_TITLES[alertType]);

  // Generate metadata based on alert type
  let metadata: MockAlert['metadata'] = {};
  if (alertType === 'PRICE_DROP') {
    const currentValue = randomInt(500000, 2000000);
    const previousValue = Math.floor(currentValue * randomInt(108, 120) / 100);
    metadata = {
      current_value: currentValue,
      previous_value: previousValue,
      change_percentage: -Math.round(((previousValue - currentValue) / previousValue) * 100),
    };
  } else if (alertType === 'NEW_LISTING') {
    metadata = {
      listing_count: randomInt(10, 50),
    };
  } else if (alertType === 'HOT_MARKET') {
    metadata = {
      demand_score: randomInt(80, 100),
      change_percentage: randomInt(15, 40),
    };
  }

  const createdAt = randomPastDate(30);
  const expiresAt = randomBoolean() && randomBoolean() ? randomFutureDate(30) : null;

  return {
    id: generateId(),
    title,
    description: `${title} - View full market analysis and details.`,
    alert_type: alertType,
    severity,
    zip_code: metro.zip,
    city: metro.city,
    state: metro.state,
    metadata,
    is_read: randomBoolean() && randomBoolean() && randomBoolean(), // 12.5% read
    is_dismissed: false,
    created_at: createdAt,
    expires_at: expiresAt,
    ...overrides,
  };
}

/**
 * Generate multiple alerts
 */
export function generateMockAlerts(count: number = 10): MockAlert[] {
  return Array.from({ length: count }, () => {
    const metro = randomFromArray(MAJOR_METROS);
    return generateMockAlert(metro.zip);
  });
}

// ============================================================================
// SCHOOL GENERATORS
// ============================================================================

/**
 * Generate a mock school
 */
export function generateMockSchool(
  zipCode: string,
  overrides?: Partial<MockSchool>
): MockSchool {
  const metro = MAJOR_METROS.find((m) => m.zip === zipCode) || randomFromArray(MAJOR_METROS);
  const schoolType = overrides?.type || randomFromArray([
    'ELEMENTARY', 'ELEMENTARY', 'ELEMENTARY', // 37.5%
    'MIDDLE', 'MIDDLE', // 25%
    'HIGH', 'HIGH', // 25%
    'PRIVATE', // 6.25%
    'CHARTER', // 6.25%
  ] as MockSchool['type'][]);

  const name = randomFromArray(SCHOOL_NAMES);
  const district = randomFromArray(SCHOOL_DISTRICTS);

  // Ratings follow bell curve (centered around 6-7)
  const ratingRoll = randomInt(1, 100);
  let rating: number;
  if (ratingRoll <= 5) rating = randomInt(1, 3); // 5% low
  else if (ratingRoll <= 20) rating = randomInt(4, 5); // 15% below average
  else if (ratingRoll <= 80) rating = randomInt(6, 7); // 60% average
  else if (ratingRoll <= 95) rating = randomInt(8, 9); // 15% above average
  else rating = 10; // 5% excellent

  const testScores = (rating / 10) * 100;

  const studentCount = schoolType === 'ELEMENTARY' ? randomInt(300, 600) :
                       schoolType === 'MIDDLE' ? randomInt(400, 800) :
                       schoolType === 'HIGH' ? randomInt(800, 2000) :
                       schoolType === 'PRIVATE' ? randomInt(100, 400) :
                       randomInt(200, 500);

  const teacherRatio = schoolType === 'PRIVATE' ? randomInt(8, 15) :
                       schoolType === 'ELEMENTARY' ? randomInt(18, 25) :
                       randomInt(20, 30);

  const gradeLevels = schoolType === 'ELEMENTARY' ? 'K-5' :
                      schoolType === 'MIDDLE' ? '6-8' :
                      schoolType === 'HIGH' ? '9-12' :
                      schoolType === 'PRIVATE' ? 'K-12' :
                      'K-8';

  return {
    id: generateId(),
    name,
    type: schoolType,
    address: `${randomInt(100, 9999)} ${randomFromArray(['Main', 'School', 'Education', 'Learning'])} ${randomFromArray(['St', 'Ave', 'Blvd', 'Way'])}`,
    city: metro.city,
    state: metro.state,
    zip_code: metro.zip,
    rating,
    test_scores: Math.round(testScores),
    student_count: studentCount,
    teacher_ratio: teacherRatio,
    distance_miles: randomInt(5, 50) / 10, // 0.5 - 5.0 miles
    grade_levels: gradeLevels,
    district,
    ...overrides,
  };
}

/**
 * Generate schools for a zip code (8 schools)
 */
export function generateMockSchools(zipCode: string, count: number = 8): MockSchool[] {
  return Array.from({ length: count }, () => generateMockSchool(zipCode));
}

// ============================================================================
// AI PROFILE GENERATORS
// ============================================================================

const AI_INSIGHTS = [
  'Strong rental demand in area with 95% occupancy rate',
  'Property value appreciation trending 8% above market average',
  'Excellent school district ratings increase property desirability',
  'Low property tax rates compared to surrounding areas',
  'High walkability score with access to amenities',
  'Growing job market with 12% employment growth',
  'New development projects planned within 2 miles',
  'Below-market purchase price represents 15% value opportunity',
  'Strong cash flow potential with estimated 9% cap rate',
  'Minimal deferred maintenance reduces renovation costs',
  'HOA fees significantly lower than comparable properties',
  'Property located in designated opportunity zone for tax benefits',
  'Rental income potential 20% above mortgage payment',
  'Low crime rates and stable neighborhood demographics',
  'Public transportation access within walking distance',
];

/**
 * Generate a mock AI profile
 */
export function generateMockAIProfile(
  overrides?: Partial<MockAIProfile>
): MockAIProfile {
  const metro = overrides?.zip_code
    ? MAJOR_METROS.find(m => m.zip === overrides.zip_code) || randomFromArray(MAJOR_METROS)
    : randomFromArray(MAJOR_METROS);

  // Generate scores
  const locationScore = randomInt(60, 95);
  const financialsScore = randomInt(55, 90);
  const appreciationScore = randomInt(50, 95);
  const cashFlowScore = randomInt(60, 95);
  const riskScore = randomInt(70, 95);

  const aiScore = Math.floor((locationScore + financialsScore + appreciationScore + cashFlowScore + riskScore) / 5);

  // Determine recommendation based on score
  let recommendation: MockAIProfile['recommendation'];
  if (aiScore >= 85) recommendation = 'strong-buy';
  else if (aiScore >= 70) recommendation = 'buy';
  else if (aiScore >= 55) recommendation = 'hold';
  else recommendation = 'pass';

  // Select random insights
  const insightCount = randomInt(3, 5);
  const insights = Array.from({ length: insightCount }, () =>
    randomFromArray(AI_INSIGHTS)
  ).filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

  const streetNumber = randomInt(100, 9999);
  const streetNames = ['Main St', 'Oak Ave', 'Park Blvd', 'Market St', 'Hill Dr', 'Lake Rd', 'Valley Way', 'River Ln'];
  const propertyAddress = `${streetNumber} ${randomFromArray(streetNames)}, ${metro.city}, ${metro.state} ${metro.zip}`;

  return {
    id: generateId(),
    property_address: propertyAddress,
    profile_name: `Investment Analysis: ${streetNumber} ${randomFromArray(streetNames)}`,
    analysis_date: randomPastDate(30),
    ai_score: aiScore,
    score_breakdown: {
      location: locationScore,
      financials: financialsScore,
      appreciation: appreciationScore,
      cash_flow: cashFlowScore,
      risk: riskScore,
    },
    insights,
    market_comparison: {
      average_roi: randomInt(6, 12) + (randomInt(0, 99) / 100),
      average_cash_flow: randomInt(500, 2500),
      appreciation_rate: randomInt(3, 8) + (randomInt(0, 99) / 100),
    },
    recommendation,
    estimated_roi: randomInt(8, 15) + (randomInt(0, 99) / 100),
    estimated_cash_flow: randomInt(800, 3500),
    status: randomBoolean() && randomBoolean() && randomBoolean() ? 'archived' : 'active', // 12.5% archived
    zip_code: metro.zip,
    city: metro.city,
    state: metro.state,
    ...overrides,
  };
}

/**
 * Generate multiple AI profiles
 */
export function generateMockAIProfiles(count: number = 10): MockAIProfile[] {
  return Array.from({ length: count }, () => generateMockAIProfile());
}

// ============================================================================
// REID REPORT GENERATORS
// ============================================================================

/**
 * Generate a REID report
 */
export function generateMockREIDReport(
  zipCodes: string[],
  reportType: MockREIDReport['report_type']
): MockREIDReport {
  const marketData = zipCodes.map((zip) => generateMockMarketData(zip));
  const cities = Array.from(new Set(marketData.map((m) => m.city)));

  const trends: MockTrendPoint[] = [];
  const firstMarket = marketData[0];
  const trendSeries = generateMockTrendSeries(firstMarket.zip_code, 12, 6);
  trends.push(...trendSeries.historical.slice(-6), ...trendSeries.predictions.slice(0, 3));

  const keyFindings = [
    `Analyzed ${zipCodes.length} market areas across ${cities.length} cities`,
    `Average median price: $${Math.floor(marketData.reduce((sum, m) => sum + m.median_price, 0) / marketData.length).toLocaleString()}`,
    `Market temperature range: ${marketData[0].market_temperature} to ${marketData[marketData.length - 1].market_temperature}`,
    `Investment scores range from ${Math.min(...marketData.map(m => m.investment_score))} to ${Math.max(...marketData.map(m => m.investment_score))}`,
  ];

  const recommendations = [
    'Focus on markets with investment scores above 75 for best ROI potential',
    'Consider diversification across multiple temperature zones',
    'Monitor price change trends for early entry/exit signals',
    'Evaluate demand vs supply scores for market timing',
  ];

  return {
    id: generateId(),
    title: `${reportType.replace(/_/g, ' ')} - ${cities.join(', ')}`,
    report_type: reportType,
    zip_codes: zipCodes,
    cities,
    generated_at: new Date(),
    summary: `Comprehensive ${reportType.toLowerCase().replace(/_/g, ' ')} covering ${zipCodes.length} markets with detailed insights and actionable recommendations.`,
    key_findings: keyFindings,
    market_data: marketData,
    trends,
    recommendations,
  };
}
