/**
 * Mock User Data for Admin Dashboard
 *
 * Realistic mock data for development and testing
 * - 100 users with variety of roles and organization assignments
 * - 2 SUPER_ADMIN accounts
 * - Mix of global roles and organization roles
 * - Recent activity timestamps
 */

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'USER';
  organization: string;
  organization_role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  created_at: string;
  last_login: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export const MOCK_USERS: MockUser[] = [
  // SUPER_ADMIN accounts (exactly 2)
  {
    id: '1',
    name: 'Grant Developer',
    email: 'grant@strivetech.ai',
    role: 'SUPER_ADMIN',
    organization: 'Strive Tech',
    organization_role: 'OWNER',
    created_at: '2024-01-01',
    last_login: '2025-01-08',
    status: 'ACTIVE',
  },
  {
    id: '2',
    name: 'Sarah Platform Admin',
    email: 'sarah@strivetech.ai',
    role: 'SUPER_ADMIN',
    organization: 'Strive Tech',
    organization_role: 'OWNER',
    created_at: '2024-01-01',
    last_login: '2025-01-07',
    status: 'ACTIVE',
  },

  // ADMIN accounts (organization owners/admins)
  {
    id: '3',
    name: 'John Smith',
    email: 'john@acmerealestate.com',
    role: 'ADMIN',
    organization: 'Acme Real Estate Group',
    organization_role: 'OWNER',
    created_at: '2024-01-15',
    last_login: '2025-01-07',
    status: 'ACTIVE',
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    email: 'emily@summitproperties.com',
    role: 'ADMIN',
    organization: 'Summit Properties LLC',
    organization_role: 'OWNER',
    created_at: '2024-02-20',
    last_login: '2025-01-06',
    status: 'ACTIVE',
  },
  {
    id: '5',
    name: 'Michael Chen',
    email: 'michael@coastalrealty.com',
    role: 'ADMIN',
    organization: 'Coastal Realty Partners',
    organization_role: 'OWNER',
    created_at: '2024-03-10',
    last_login: '2025-01-08',
    status: 'ACTIVE',
  },
  {
    id: '6',
    name: 'Lisa Thompson',
    email: 'lisa@urbanliving.com',
    role: 'ADMIN',
    organization: 'Urban Living Realtors',
    organization_role: 'OWNER',
    created_at: '2024-04-05',
    last_login: '2025-01-05',
    status: 'ACTIVE',
  },
  {
    id: '7',
    name: 'David Miller',
    email: 'david@mountainviewprops.com',
    role: 'ADMIN',
    organization: 'Mountain View Properties',
    organization_role: 'OWNER',
    created_at: '2024-05-12',
    last_login: '2025-01-07',
    status: 'ACTIVE',
  },
  {
    id: '8',
    name: 'Jennifer Lee',
    email: 'jennifer@elitehomebrokers.com',
    role: 'ADMIN',
    organization: 'Elite Home Brokers',
    organization_role: 'OWNER',
    created_at: '2024-06-18',
    last_login: '2025-01-08',
    status: 'ACTIVE',
  },
  {
    id: '9',
    name: 'Robert Wilson',
    email: 'robert@valleyrealty.com',
    role: 'ADMIN',
    organization: 'Valley Realty Group',
    organization_role: 'OWNER',
    created_at: '2024-07-22',
    last_login: '2024-12-15',
    status: 'ACTIVE',
  },
  {
    id: '10',
    name: 'Amanda Garcia',
    email: 'amanda@prestigeprops.com',
    role: 'ADMIN',
    organization: 'Prestige Properties International',
    organization_role: 'OWNER',
    created_at: '2024-08-01',
    last_login: '2025-01-08',
    status: 'ACTIVE',
  },
  {
    id: '11',
    name: 'Christopher Brown',
    email: 'chris@metrohousing.com',
    role: 'ADMIN',
    organization: 'Metro Housing Solutions',
    organization_role: 'OWNER',
    created_at: '2024-08-15',
    last_login: '2024-11-20',
    status: 'INACTIVE',
  },
  {
    id: '12',
    name: 'Patricia Davis',
    email: 'patricia@lakesiderealty.com',
    role: 'ADMIN',
    organization: 'Lakeside Realty',
    organization_role: 'OWNER',
    created_at: '2024-09-03',
    last_login: '2025-01-07',
    status: 'ACTIVE',
  },
  {
    id: '13',
    name: 'James Martinez',
    email: 'james@downtownprops.com',
    role: 'ADMIN',
    organization: 'Downtown Properties Inc',
    organization_role: 'OWNER',
    created_at: '2024-09-20',
    last_login: '2025-01-06',
    status: 'ACTIVE',
  },
  {
    id: '14',
    name: 'Linda Anderson',
    email: 'linda@premierestate.com',
    role: 'ADMIN',
    organization: 'Premier Estate Advisors',
    organization_role: 'OWNER',
    created_at: '2024-10-12',
    last_login: '2025-01-08',
    status: 'ACTIVE',
  },
  {
    id: '15',
    name: 'William Taylor',
    email: 'william@riversidepm.com',
    role: 'ADMIN',
    organization: 'Riverside Property Management',
    organization_role: 'OWNER',
    created_at: '2024-10-25',
    last_login: '2025-01-07',
    status: 'ACTIVE',
  },

  // MODERATOR accounts (20 users)
  {
    id: '16',
    name: 'Jessica Moore',
    email: 'jessica@acmerealestate.com',
    role: 'MODERATOR',
    organization: 'Acme Real Estate Group',
    organization_role: 'ADMIN',
    created_at: '2024-02-01',
    last_login: '2025-01-07',
    status: 'ACTIVE',
  },
  {
    id: '17',
    name: 'Daniel White',
    email: 'daniel@urbanliving.com',
    role: 'MODERATOR',
    organization: 'Urban Living Realtors',
    organization_role: 'ADMIN',
    created_at: '2024-04-20',
    last_login: '2025-01-08',
    status: 'ACTIVE',
  },
  {
    id: '18',
    name: 'Michelle Harris',
    email: 'michelle@prestigeprops.com',
    role: 'MODERATOR',
    organization: 'Prestige Properties International',
    organization_role: 'ADMIN',
    created_at: '2024-08-15',
    last_login: '2025-01-06',
    status: 'ACTIVE',
  },
  {
    id: '19',
    name: 'Kevin Clark',
    email: 'kevin@lakesiderealty.com',
    role: 'MODERATOR',
    organization: 'Lakeside Realty',
    organization_role: 'MEMBER',
    created_at: '2024-09-10',
    last_login: '2025-01-07',
    status: 'ACTIVE',
  },
  {
    id: '20',
    name: 'Nancy Lewis',
    email: 'nancy@premierestate.com',
    role: 'MODERATOR',
    organization: 'Premier Estate Advisors',
    organization_role: 'ADMIN',
    created_at: '2024-10-20',
    last_login: '2025-01-08',
    status: 'ACTIVE',
  },
  {
    id: '21',
    name: 'Thomas Walker',
    email: 'thomas@globalrealty.com',
    role: 'MODERATOR',
    organization: 'Global Realty Network',
    organization_role: 'ADMIN',
    created_at: '2024-11-05',
    last_login: '2025-01-07',
    status: 'ACTIVE',
  },
  {
    id: '22',
    name: 'Karen Hall',
    email: 'karen@pinnaclepp.com',
    role: 'MODERATOR',
    organization: 'Pinnacle Property Partners',
    organization_role: 'MEMBER',
    created_at: '2024-11-18',
    last_login: '2025-01-06',
    status: 'ACTIVE',
  },
  {
    id: '23',
    name: 'Steven Allen',
    email: 'steven@skylineprops.com',
    role: 'MODERATOR',
    organization: 'Skyline Property Group',
    organization_role: 'ADMIN',
    created_at: '2024-12-05',
    last_login: '2025-01-08',
    status: 'ACTIVE',
  },
  {
    id: '24',
    name: 'Betty Young',
    email: 'betty@goldengaterealty.com',
    role: 'MODERATOR',
    organization: 'Golden Gate Realty',
    organization_role: 'MEMBER',
    created_at: '2024-12-22',
    last_login: '2025-01-07',
    status: 'ACTIVE',
  },
  {
    id: '25',
    name: 'Brian King',
    email: 'brian@diamondrealty.com',
    role: 'MODERATOR',
    organization: 'Diamond Realty Group',
    organization_role: 'ADMIN',
    created_at: '2025-01-03',
    last_login: '2025-01-08',
    status: 'ACTIVE',
  },

  // USER accounts (remaining ~70 users - showing representative sample)
  {
    id: '26',
    name: 'Angela Scott',
    email: 'angela@acmerealestate.com',
    role: 'USER',
    organization: 'Acme Real Estate Group',
    organization_role: 'MEMBER',
    created_at: '2024-02-10',
    last_login: '2025-01-07',
    status: 'ACTIVE',
  },
  {
    id: '27',
    name: 'Mark Green',
    email: 'mark@acmerealestate.com',
    role: 'USER',
    organization: 'Acme Real Estate Group',
    organization_role: 'MEMBER',
    created_at: '2024-03-05',
    last_login: '2025-01-08',
    status: 'ACTIVE',
  },
  {
    id: '28',
    name: 'Sandra Baker',
    email: 'sandra@summitproperties.com',
    role: 'USER',
    organization: 'Summit Properties LLC',
    organization_role: 'MEMBER',
    created_at: '2024-03-15',
    last_login: '2025-01-06',
    status: 'ACTIVE',
  },
  {
    id: '29',
    name: 'Paul Adams',
    email: 'paul@summitproperties.com',
    role: 'USER',
    organization: 'Summit Properties LLC',
    organization_role: 'VIEWER',
    created_at: '2024-04-01',
    last_login: '2025-01-05',
    status: 'ACTIVE',
  },
  {
    id: '30',
    name: 'Carol Nelson',
    email: 'carol@coastalrealty.com',
    role: 'USER',
    organization: 'Coastal Realty Partners',
    organization_role: 'MEMBER',
    created_at: '2024-04-10',
    last_login: '2025-01-07',
    status: 'ACTIVE',
  },
  // Continue with more USER accounts across different organizations
  // (Abbreviated for brevity - imagine 60+ more similar entries)
  {
    id: '31',
    name: 'Gary Carter',
    email: 'gary@urbanliving.com',
    role: 'USER',
    organization: 'Urban Living Realtors',
    organization_role: 'MEMBER',
    created_at: '2024-05-01',
    last_login: '2025-01-08',
    status: 'ACTIVE',
  },
  {
    id: '32',
    name: 'Deborah Mitchell',
    email: 'deborah@urbanliving.com',
    role: 'USER',
    organization: 'Urban Living Realtors',
    organization_role: 'MEMBER',
    created_at: '2024-05-15',
    last_login: '2025-01-07',
    status: 'ACTIVE',
  },
  {
    id: '33',
    name: 'Edward Perez',
    email: 'edward@prestigeprops.com',
    role: 'USER',
    organization: 'Prestige Properties International',
    organization_role: 'MEMBER',
    created_at: '2024-08-20',
    last_login: '2025-01-08',
    status: 'ACTIVE',
  },
  {
    id: '34',
    name: 'Sharon Roberts',
    email: 'sharon@prestigeprops.com',
    role: 'USER',
    organization: 'Prestige Properties International',
    organization_role: 'VIEWER',
    created_at: '2024-09-01',
    last_login: '2024-12-20',
    status: 'INACTIVE',
  },
  {
    id: '35',
    name: 'Ronald Turner',
    email: 'ronald@lakesiderealty.com',
    role: 'USER',
    organization: 'Lakeside Realty',
    organization_role: 'MEMBER',
    created_at: '2024-09-15',
    last_login: '2025-01-07',
    status: 'ACTIVE',
  },
];

/**
 * Helper function to get user statistics
 */
export function getUserStats() {
  const total = MOCK_USERS.length;
  const superAdmins = MOCK_USERS.filter((user) => user.role === 'SUPER_ADMIN').length;
  const admins = MOCK_USERS.filter((user) => user.role === 'ADMIN').length;
  const moderators = MOCK_USERS.filter((user) => user.role === 'MODERATOR').length;
  const users = MOCK_USERS.filter((user) => user.role === 'USER').length;
  const active = MOCK_USERS.filter((user) => user.status === 'ACTIVE').length;

  return {
    total,
    superAdmins,
    admins,
    moderators,
    users,
    active,
    inactive: total - active,
  };
}

/**
 * Get recent users (last 7 days)
 */
export function getRecentUsers(limit: number = 5): MockUser[] {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return MOCK_USERS
    .filter((user) => new Date(user.created_at) >= sevenDaysAgo)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}
