import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle2, 
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  BarChart3,
  CreditCard,
  Sparkles,
  ArrowRight
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Join as Gallery | ArtIsSafe',
  description: 'Partner with ArtIsSafe and expand your gallery\'s reach. 20% commission, AI-powered insights, automatic invoicing, and seamless payment processing.',
}

export default function JoinGalleryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="w-3 h-3 mr-1" />
            Gallery Partnership Program
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Expand Your Gallery's Reach with ArtIsSafe
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join Denmark's leading art marketplace. Sell more art, reach new collectors, and grow your business with our AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg">
              <Link href="/auth/sign-up?role=gallery_owner">
                Create Gallery Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg">
              <Link href="#benefits">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section id="benefits" className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Partner with ArtIsSafe?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <TrendingUp className="w-10 h-10 text-blue-600 mb-2" />
                <CardTitle>20% Commission</CardTitle>
                <CardDescription>
                  Industry-leading commission rate. Keep more of what you earn.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Sparkles className="w-10 h-10 text-purple-600 mb-2" />
                <CardTitle>AI Diagnostics</CardTitle>
                <CardDescription>
                  Get AI-powered insights on pricing, market positioning, and artwork performance.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CreditCard className="w-10 h-10 text-green-600 mb-2" />
                <CardTitle>Automatic Invoicing</CardTitle>
                <CardDescription>
                  Automated invoicing and payouts. Get paid faster with Stripe Connect.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-10 h-10 text-red-600 mb-2" />
                <CardTitle>Secure Escrow</CardTitle>
                <CardDescription>
                  Built-in escrow system protects both you and your buyers.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="w-10 h-10 text-orange-600 mb-2" />
                <CardTitle>Leasing Support</CardTitle>
                <CardDescription>
                  Enable leasing options for high-value artworks and reach business clients.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="w-10 h-10 text-yellow-600 mb-2" />
                <CardTitle>No Setup Fees</CardTitle>
                <CardDescription>
                  Get started immediately. No upfront costs, no binding contracts.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Everything You Need to Succeed
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Professional Dashboard</h3>
                    <p className="text-gray-600">
                      Manage your entire gallery from one intuitive dashboard. Upload artworks, track sales, and monitor analytics.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">AI Price Suggestions</h3>
                    <p className="text-gray-600">
                      Get intelligent pricing recommendations based on category, size, medium, and market data.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Metadata Validation</h3>
                    <p className="text-gray-600">
                      Automatic quality checks ensure your listings are complete and optimized for discovery.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Team Management</h3>
                    <p className="text-gray-600">
                      Invite team members with different roles: managers, curators, and staff.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Stripe Payment Links</h3>
                    <p className="text-gray-600">
                      Generate secure payment links for direct sales outside the platform.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Performance Analytics</h3>
                    <p className="text-gray-600">
                      Track views, inquiries, and sales. Understand what works and optimize your strategy.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Leasing Options</h3>
                    <p className="text-gray-600">
                      Enable monthly leasing for businesses. Expand your market and increase revenue.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">AI Behavior Monitoring</h3>
                    <p className="text-gray-600">
                      Get alerts for long-term listings, price anomalies, and optimization opportunities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Get Started in Minutes
          </h2>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Create Your Account</h3>
                <p className="text-gray-600">
                  Sign up as a gallery owner. It takes less than 2 minutes.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Set Up Your Gallery</h3>
                <p className="text-gray-600">
                  Add your gallery details, logo, and contact information.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Upload Your First Artwork</h3>
                <p className="text-gray-600">
                  Add artwork details, images, and pricing. Get instant AI insights.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Connect Stripe</h3>
                <p className="text-gray-600">
                  Link your Stripe account to receive payments. Required before publishing.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                ✓
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Start Selling</h3>
                <p className="text-gray-600">
                  Your gallery is live! Start accepting orders and growing your business.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Placeholder */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Trusted by Leading Galleries
            </h2>
            <p className="text-gray-600 mb-8">
              Join galleries across Denmark who are already growing their business with ArtIsSafe.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50">
              {/* Placeholder for gallery logos */}
              <div className="h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <div className="h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <div className="h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <div className="h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Grow Your Gallery?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join ArtIsSafe today and start reaching more collectors.
          </p>
          <Button size="lg" asChild className="text-lg">
            <Link href="/auth/sign-up?role=gallery_owner">
              Create Gallery Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            No setup fees • No binding contracts • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  )
}
