import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, TrendingUp, AlertCircle } from 'lucide-react';

export default async function AdminPricingPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/');
  }

  // Fetch statistics
  const { data: artworks } = await supabase
    .from('artworks')
    .select('id')
    .eq('status', 'available');

  const { data: evaluations } = await supabase
    .from('price_evaluations')
    .select('*')
    .order('evaluated_at', { ascending: false })
    .limit(100);

  const { data: marketSales } = await supabase
    .from('market_sales')
    .select('id');

  const { data: dataSources } = await supabase
    .from('market_data_sources')
    .select('*')
    .order('created_at', { ascending: false });

  // Calculate statistics
  const totalArtworks = artworks?.length || 0;
  const totalEvaluations = evaluations?.length || 0;
  const totalMarketSales = marketSales?.length || 0;

  const recentEvaluations = evaluations?.slice(0, 10) || [];

  const recommendationCounts = evaluations?.reduce((acc, ev) => {
    acc[ev.recommendation] = (acc[ev.recommendation] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const avgConfidence = evaluations?.length
    ? (evaluations.reduce((sum, ev) => sum + (ev.confidence_score || 0), 0) / evaluations.length * 100).toFixed(1)
    : '0';

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Prisevaluering Administration</h1>
        <p className="text-muted-foreground">
          Administrer markedsdata og prisevalueringer
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kunstværker</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalArtworks}</div>
            <p className="text-xs text-muted-foreground">
              Tilgængelige værker
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evalueringer</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvaluations}</div>
            <p className="text-xs text-muted-foreground">
              Gennemsnitlig tillid: {avgConfidence}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Markedsdata</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMarketSales}</div>
            <p className="text-xs text-muted-foreground">
              Salgspriser i database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Datakilder</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataSources?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Aktive kilder
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Handlinger</CardTitle>
          <CardDescription>
            Kør prisevalueringer og administrer markedsdata
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action="/api/pricing/evaluate" method="POST">
            <input type="hidden" name="evaluate_all" value="true" />
            <Button type="submit" className="w-full md:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" />
              Evaluer alle kunstværker
            </Button>
          </form>
          <p className="text-sm text-muted-foreground">
            Dette vil evaluere alle tilgængelige kunstværker mod aktuelle markedsdata.
            Processen kan tage flere minutter afhængigt af antallet af værker.
          </p>
        </CardContent>
      </Card>

      {/* Recommendation Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Anbefalingsfordeling</CardTitle>
          <CardDescription>
            Oversigt over prisanbefalinger
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Badge variant="default" className="bg-blue-500">Underpriset</Badge>
              <p className="text-2xl font-bold">{recommendationCounts['underpriced'] || 0}</p>
            </div>
            <div className="space-y-2">
              <Badge variant="default" className="bg-green-500">Rimeligt priset</Badge>
              <p className="text-2xl font-bold">{recommendationCounts['fairly_priced'] || 0}</p>
            </div>
            <div className="space-y-2">
              <Badge variant="default" className="bg-orange-500">Overpriset</Badge>
              <p className="text-2xl font-bold">{recommendationCounts['overpriced'] || 0}</p>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary">Utilstrækkelige data</Badge>
              <p className="text-2xl font-bold">{recommendationCounts['insufficient_data'] || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Datakilder</CardTitle>
          <CardDescription>
            Konfigurerede markedsdatakilder
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dataSources && dataSources.length > 0 ? (
            <div className="space-y-4">
              {dataSources.map((source) => (
                <div key={source.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{source.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {source.description || 'Ingen beskrivelse'}
                    </p>
                    {source.last_sync_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Sidst synkroniseret: {new Date(source.last_sync_at).toLocaleString('da-DK')}
                      </p>
                    )}
                  </div>
                  <Badge variant={source.is_active ? 'default' : 'secondary'}>
                    {source.is_active ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Ingen datakilder konfigureret endnu</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Evaluations */}
      <Card>
        <CardHeader>
          <CardTitle>Seneste evalueringer</CardTitle>
          <CardDescription>
            De 10 seneste prisevalueringer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentEvaluations.length > 0 ? (
            <div className="space-y-4">
              {recentEvaluations.map((evaluation) => (
                <div key={evaluation.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {new Date(evaluation.evaluated_at).toLocaleString('da-DK')}
                    </p>
                    <p className="text-sm mt-1">{evaluation.evaluation_notes}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {evaluation.comparable_sales_count} sammenlignelige salg
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        Tillid: {(evaluation.confidence_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <Badge 
                    variant="default"
                    className={
                      evaluation.recommendation === 'underpriced' ? 'bg-blue-500' :
                      evaluation.recommendation === 'fairly_priced' ? 'bg-green-500' :
                      evaluation.recommendation === 'overpriced' ? 'bg-orange-500' :
                      'bg-gray-500'
                    }
                  >
                    {evaluation.recommendation === 'underpriced' ? 'Underpriset' :
                     evaluation.recommendation === 'fairly_priced' ? 'Rimeligt' :
                     evaluation.recommendation === 'overpriced' ? 'Overpriset' :
                     'Utilstrækkelige data'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Ingen evalueringer endnu</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
