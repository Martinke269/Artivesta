import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, AlertTriangle, Info, TrendingUp, Activity, Shield } from 'lucide-react'

export default async function BehaviorMonitoringPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  // Fetch admin alerts
  const { data: alerts } = await supabase
    .from('admin_alerts')
    .select('*')
    .eq('is_resolved', false)
    .order('created_at', { ascending: false })
    .limit(50)

  // Count alerts by severity
  const criticalCount = alerts?.filter(a => a.severity === 'critical').length || 0
  const warningCount = alerts?.filter(a => a.severity === 'warning').length || 0
  const infoCount = alerts?.filter(a => a.severity === 'info').length || 0

  // Fetch price change approvals
  const { data: priceApprovals } = await supabase
    .from('price_history')
    .select(`
      *,
      artworks:artwork_id (
        id,
        title,
        price_cents,
        artist_id
      )
    `)
    .eq('requires_approval', true)
    .eq('approval_status', 'pending')
    .order('created_at', { ascending: false })

  // Fetch payment deviations
  const { data: paymentDeviations } = await supabase
    .from('payment_deviations')
    .select(`
      *,
      orders:order_id (
        id,
        buyer_id,
        seller_id
      ),
      artworks:artwork_id (
        title
      )
    `)
    .eq('approval_status', 'pending')
    .order('created_at', { ascending: false })

  // Fetch unusual removals
  const { data: unusualRemovals } = await supabase
    .from('artwork_removal_events')
    .select('*')
    .eq('unusual_removal', true)
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch AI diagnostics
  const { data: aiDiagnostics } = await supabase
    .from('ai_diagnostics')
    .select(`
      *,
      artworks:artwork_id (
        id,
        title,
        price_cents,
        artist_id
      )
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch escrow events
  const { data: escrowEvents } = await supabase
    .from('escrow_events')
    .select(`
      *,
      orders:order_id (
        id,
        artwork_id,
        buyer_id,
        seller_id
      )
    `)
    .in('event_type', ['refunded', 'disputed', 'partial_release'])
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch Stripe webhook logs (failures)
  const { data: stripeFailures } = await supabase
    .from('stripe_webhook_logs')
    .select('*')
    .eq('processing_status', 'failed')
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch audit log (RLS bypass attempts)
  const { data: rlsBypassAttempts } = await supabase
    .from('audit_log')
    .select('*')
    .eq('rls_bypass_attempt', true)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Behavior Monitoring & Anomaly Detection</h1>
        <p className="text-muted-foreground">
          AI-assisted system to understand pricing behavior, detect accidental mispricing, and maintain data quality
        </p>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warning Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warningCount}</div>
            <p className="text-xs text-muted-foreground">Need review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Info Alerts</CardTitle>
            <Info className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{infoCount}</div>
            <p className="text-xs text-muted-foreground">For awareness</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">
            <AlertCircle className="h-4 w-4 mr-2" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="price-approvals">
            <TrendingUp className="h-4 w-4 mr-2" />
            Price Approvals
          </TabsTrigger>
          <TabsTrigger value="diagnostics">
            <Activity className="h-4 w-4 mr-2" />
            AI Diagnostics
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>All unresolved alerts across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts && alerts.length > 0 ? (
                  alerts.map((alert) => (
                    <Alert 
                      key={alert.id}
                      variant={alert.severity === 'critical' ? 'destructive' : 'default'}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {alert.severity === 'critical' && <AlertCircle className="h-4 w-4" />}
                            {alert.severity === 'warning' && <AlertTriangle className="h-4 w-4" />}
                            {alert.severity === 'info' && <Info className="h-4 w-4" />}
                            <AlertTitle>{alert.title}</AlertTitle>
                            <Badge variant={
                              alert.severity === 'critical' ? 'destructive' :
                              alert.severity === 'warning' ? 'default' : 'secondary'
                            }>
                              {alert.alert_type.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <AlertDescription>{alert.description}</AlertDescription>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(alert.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </Alert>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No unresolved alerts</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Price Approvals Tab */}
        <TabsContent value="price-approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Price Change Approvals</CardTitle>
              <CardDescription>Price changes requiring seller/buyer approval (&gt;20% change)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {priceApprovals && priceApprovals.length > 0 ? (
                  priceApprovals.map((approval) => (
                    <div key={approval.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{approval.artworks?.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Price change: {(approval.old_price_cents / 100).toFixed(0)} DKK → {(approval.new_price_cents / 100).toFixed(0)} DKK
                          </p>
                          <Badge variant="outline" className="mt-1">
                            {approval.change_percentage.toFixed(1)}% change
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Badge variant={approval.seller_approved ? 'default' : 'secondary'}>
                          Seller: {approval.seller_approved ? 'Approved' : 'Pending'}
                        </Badge>
                        <Badge variant={approval.buyer_approved ? 'default' : 'secondary'}>
                          Buyer: {approval.buyer_approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(approval.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No pending price approvals</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Deviations</CardTitle>
              <CardDescription>Stripe payments deviating &gt;20% from listed price</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentDeviations && paymentDeviations.length > 0 ? (
                  paymentDeviations.map((deviation) => (
                    <div key={deviation.id} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{deviation.artworks?.title}</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Listed:</span> {(deviation.listed_price_cents / 100).toFixed(0)} DKK
                        </div>
                        <div>
                          <span className="text-muted-foreground">Paid:</span> {(deviation.payment_price_cents / 100).toFixed(0)} DKK
                        </div>
                      </div>
                      <Badge variant="outline" className="mt-2">
                        {deviation.deviation_percentage.toFixed(1)}% deviation
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(deviation.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No payment deviations</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Diagnostics Tab */}
        <TabsContent value="diagnostics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>90-Day Listing Diagnostics</CardTitle>
              <CardDescription>Artworks listed for 90+ days without sale</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiDiagnostics && aiDiagnostics.length > 0 ? (
                  aiDiagnostics.map((diagnostic) => (
                    <div key={diagnostic.id} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-2">{diagnostic.artworks?.title}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Days Active:</span>
                          <p className="font-medium">{diagnostic.days_active}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Views:</span>
                          <p className="font-medium">{diagnostic.view_count}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Clicks:</span>
                          <p className="font-medium">{diagnostic.click_count}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Inquiries:</span>
                          <p className="font-medium">{diagnostic.inquiry_count}</p>
                        </div>
                      </div>
                      {diagnostic.price_level && (
                        <Badge variant="outline">
                          Price Level: {diagnostic.price_level.replace(/_/g, ' ')}
                        </Badge>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Generated: {new Date(diagnostic.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No diagnostics available</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Unusual Removals</CardTitle>
              <CardDescription>Artworks removed without sale, lease, or escrow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {unusualRemovals && unusualRemovals.length > 0 ? (
                  unusualRemovals.map((removal) => (
                    <div key={removal.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge variant="outline" className="mb-2">{removal.removal_type}</Badge>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Days Active:</span> {removal.days_active}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Views:</span> {removal.view_count}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Final Price:</span> {(removal.final_price_cents / 100).toFixed(0)} DKK
                            </div>
                            <div>
                              <span className="text-muted-foreground">Inquiries:</span> {removal.inquiry_count}
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(removal.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No unusual removals</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Escrow Anomalies</CardTitle>
              <CardDescription>Refunds, disputes, and partial releases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {escrowEvents && escrowEvents.length > 0 ? (
                  escrowEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={event.event_type === 'disputed' ? 'destructive' : 'default'}>
                          {event.event_type.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-sm">{(event.amount_cents / 100).toFixed(0)} DKK</span>
                      </div>
                      {event.reason && (
                        <p className="text-sm text-muted-foreground mb-2">{event.reason}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No escrow anomalies</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stripe Webhook Failures</CardTitle>
              <CardDescription>Failed webhook processing events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stripeFailures && stripeFailures.length > 0 ? (
                  stripeFailures.map((failure) => (
                    <div key={failure.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="destructive">{failure.event_type}</Badge>
                        <span className="text-xs text-muted-foreground">{failure.event_id}</span>
                      </div>
                      {failure.error_message && (
                        <p className="text-sm text-destructive mb-2">{failure.error_message}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(failure.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No webhook failures</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>RLS Bypass Attempts</CardTitle>
              <CardDescription>Security violations and unauthorized access attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rlsBypassAttempts && rlsBypassAttempts.length > 0 ? (
                  rlsBypassAttempts.map((attempt) => (
                    <Alert key={attempt.id} variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>RLS Bypass Attempt</AlertTitle>
                      <AlertDescription>
                        <p className="mb-1">Action: {attempt.action} on {attempt.entity_type}</p>
                        <p className="text-xs">{new Date(attempt.created_at).toLocaleString()}</p>
                      </AlertDescription>
                    </Alert>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No RLS bypass attempts</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
