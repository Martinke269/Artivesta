import { DashboardHeader } from '@/components/gallery/dashboard/dashboard-header'
import { StatsOverview } from '@/components/gallery/dashboard/stats-overview'
import { AIInsightsSnapshot } from '@/components/gallery/dashboard/ai-insights-snapshot'
import { ArtistsList } from '@/components/gallery/dashboard/artists-list'
import { RecentActivity } from '@/components/gallery/dashboard/recent-activity'
import { QuickActions } from '@/components/gallery/dashboard/quick-actions'

// Mock data for demonstration
const mockGallery = {
  id: 'demo-gallery-id',
  name: 'Kunstgalleriet København',
  description: 'Et moderne galleri i hjertet af København',
  email: 'kontakt@kunstgalleriet.dk',
  phone: '+45 12 34 56 78',
  website: 'https://kunstgalleriet.dk',
  status: 'active',
  commission_rate: 30,
  created_at: new Date().toISOString(),
}

const mockStats = {
  totalArtists: 5,
  totalArtworks: 23,
  totalSales: 8,
  totalRevenue: 145000,
  pendingInvitations: 2,
  activeListings: 18,
}

const mockInsights = [
  {
    id: '1',
    type: 'opportunity' as const,
    title: 'Stærk vækstmulighed',
    description: 'Dine kunstnere har høj engagement. Overvej at invitere flere kunstnere for at udvide dit sortiment.',
    impact: 'high' as const,
    actionUrl: '/gallery/demo-gallery-id/invite',
    actionLabel: 'Inviter kunstner',
  },
  {
    id: '2',
    type: 'recommendation' as const,
    title: 'Afventende invitationer',
    description: 'Du har 2 kunstnere der endnu ikke har accepteret din invitation. Overvej at sende en påmindelse.',
    impact: 'medium' as const,
    actionUrl: '/gallery/demo-gallery-id/invitations',
    actionLabel: 'Se invitationer',
  },
  {
    id: '3',
    type: 'trend' as const,
    title: 'Stigende salg',
    description: 'Dit galleri har gennemført 8 salg med en samlet omsætning på 145.000 kr. Fortsæt det gode arbejde!',
    impact: 'low' as const,
  },
]

const mockArtists = [
  {
    id: '1',
    name: 'Maria Jensen',
    email: 'maria@example.com',
    artworks_count: 8,
    total_sales: 45000,
    joined_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active' as const,
  },
  {
    id: '2',
    name: 'Lars Nielsen',
    email: 'lars@example.com',
    artworks_count: 6,
    total_sales: 32000,
    joined_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active' as const,
  },
  {
    id: '3',
    name: 'Sophie Andersen',
    email: 'sophie@example.com',
    artworks_count: 5,
    total_sales: 28000,
    joined_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active' as const,
  },
  {
    id: '4',
    name: 'Thomas Petersen',
    email: 'thomas@example.com',
    artworks_count: 3,
    total_sales: 25000,
    joined_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active' as const,
  },
  {
    id: '5',
    name: 'Emma Christensen',
    email: 'emma@example.com',
    artworks_count: 1,
    total_sales: 15000,
    joined_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active' as const,
  },
]

const mockActivity = [
  {
    id: '1',
    type: 'artist_joined' as const,
    description: 'Emma Christensen joined the gallery',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'invitation_sent' as const,
    description: 'Invitation sent to peter@example.com',
    timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'artist_joined' as const,
    description: 'Thomas Petersen joined the gallery',
    timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    type: 'invitation_sent' as const,
    description: 'Invitation sent to anna@example.com',
    timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    type: 'artist_joined' as const,
    description: 'Maria Jensen joined the gallery',
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export default function GalleryDashboardDemoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Demo Banner */}
      <div className="mb-6 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
        <h2 className="text-lg font-bold text-purple-900 mb-2">
          🎨 Dashboard Demo / Mockup
        </h2>
        <p className="text-sm text-purple-700">
          Dette er en demo-version af Gallery Dashboard med mock data. 
          For at se det rigtige dashboard med dine egne data, skal du oprette et galleri via <code className="bg-purple-100 px-2 py-1 rounded">/join/gallery</code>
        </p>
      </div>

      <DashboardHeader gallery={mockGallery} />
      
      <div className="mt-8 space-y-8">
        {/* Quick Stats - 4 cards in a row */}
        <StatsOverview stats={mockStats} />
        
        {/* AI Insights Snapshot - Full width */}
        <AIInsightsSnapshot insights={mockInsights} galleryId={mockGallery.id} />
        
        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            <RecentActivity activity={mockActivity} />
            <ArtistsList artists={mockArtists} galleryId={mockGallery.id} />
          </div>
          
          {/* Right column - 1/3 width */}
          <div>
            <QuickActions galleryId={mockGallery.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
