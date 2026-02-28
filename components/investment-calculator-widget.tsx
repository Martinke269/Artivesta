'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, Calculator, Info, Award, X, ExternalLink, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  calculateInvestment,
  formatCurrency,
  formatPercentage,
  type CalculatorInputs,
  type CalculatorResults,
} from '@/lib/investment-calculator';

interface InvestmentCalculatorWidgetProps {
  compact?: boolean;
}

export function InvestmentCalculatorWidget({ compact = false }: InvestmentCalculatorWidgetProps) {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    purchasePrice: 500000,
    expectedAppreciation: 5,
    depreciationRate: 20,
    leasingMonthlyRate: 5000,
    rentalMonthlyRate: 4000,
    investmentPeriod: 5,
  });

  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [showConversionDialog, setShowConversionDialog] = useState(false);
  const [hasSeenDialog, setHasSeenDialog] = useState(false);

  const handleCalculate = () => {
    const calculatedResults = calculateInvestment(inputs);
    setResults(calculatedResults);
    
    // Show conversion dialog after first calculation (if not seen before)
    if (!hasSeenDialog) {
      setTimeout(() => {
        setShowConversionDialog(true);
        setHasSeenDialog(true);
      }, 2000); // Show after 2 seconds
    }
  };

  // Load hasSeenDialog state from localStorage
  useEffect(() => {
    const seen = localStorage.getItem('investment_calc_dialog_seen');
    if (seen === 'true') {
      setHasSeenDialog(true);
    }
  }, []);

  // Save hasSeenDialog state to localStorage
  useEffect(() => {
    if (hasSeenDialog) {
      localStorage.setItem('investment_calc_dialog_seen', 'true');
    }
  }, [hasSeenDialog]);

  const handleInputChange = (field: keyof CalculatorInputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs((prev) => ({ ...prev, [field]: numValue }));
  };

  const getOptionLabel = (option: string) => {
    switch (option) {
      case 'purchase':
        return 'Køb';
      case 'leasing':
        return 'Leasing';
      case 'rental':
        return 'Leje';
      default:
        return option;
    }
  };

  return (
    <div className={`w-full ${compact ? 'max-w-2xl' : 'max-w-4xl'} mx-auto`}>
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-2xl">Investeringsberegner</CardTitle>
          </div>
          <CardDescription>
            Sammenlign Køb, Leasing og Leje af kunst og møbelkunst
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Input Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="purchasePrice">Købspris (DKK)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={inputs.purchasePrice}
                  onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="expectedAppreciation">Forventet værdistigning (% årligt)</Label>
                <Input
                  id="expectedAppreciation"
                  type="number"
                  step="0.1"
                  value={inputs.expectedAppreciation}
                  onChange={(e) => handleInputChange('expectedAppreciation', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="depreciationRate">Afskrivningssats (% årligt)</Label>
                <Input
                  id="depreciationRate"
                  type="number"
                  step="0.1"
                  value={inputs.depreciationRate}
                  onChange={(e) => handleInputChange('depreciationRate', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="leasingMonthlyRate">Leasing (DKK/måned)</Label>
                <Input
                  id="leasingMonthlyRate"
                  type="number"
                  value={inputs.leasingMonthlyRate}
                  onChange={(e) => handleInputChange('leasingMonthlyRate', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="rentalMonthlyRate">Leje (DKK/måned)</Label>
                <Input
                  id="rentalMonthlyRate"
                  type="number"
                  value={inputs.rentalMonthlyRate}
                  onChange={(e) => handleInputChange('rentalMonthlyRate', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="investmentPeriod">Investeringsperiode (år)</Label>
                <Input
                  id="investmentPeriod"
                  type="number"
                  value={inputs.investmentPeriod}
                  onChange={(e) => handleInputChange('investmentPeriod', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleCalculate} className="w-full mt-6" size="lg">
            <Calculator className="mr-2 h-5 w-5" />
            Beregn investering
          </Button>

          {/* Results */}
          {results && (
            <div className="mt-8 space-y-6">
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Resultat
                </h3>

                <div className="grid gap-4 md:grid-cols-3">
                  {/* Purchase Option */}
                  <Card className={results.bestOption === 'purchase' ? 'border-green-500 border-2' : ''}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        Køb
                        {results.bestOption === 'purchase' && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Bedst
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Investering:</span>
                        <span className="font-medium">{formatCurrency(results.purchaseOption.totalCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Skattefordel:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(results.purchaseOption.taxBenefit)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fremtidig værdi:</span>
                        <span className="font-medium">{formatCurrency(results.purchaseOption.futureValue)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-semibold">
                        <span>Nettoposition:</span>
                        <span className={results.purchaseOption.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(results.purchaseOption.netPosition)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Leasing Option */}
                  <Card className={results.bestOption === 'leasing' ? 'border-green-500 border-2' : ''}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        Leasing
                        {results.bestOption === 'leasing' && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Bedst
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total omkostning:</span>
                        <span className="font-medium">{formatCurrency(results.leasingOption.totalCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Skattefordel:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(results.leasingOption.taxBenefit)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-semibold">
                        <span>Nettoposition:</span>
                        <span className={results.leasingOption.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(results.leasingOption.netPosition)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rental Option */}
                  <Card className={results.bestOption === 'rental' ? 'border-green-500 border-2' : ''}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        Leje
                        {results.bestOption === 'rental' && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Bedst
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total omkostning:</span>
                        <span className="font-medium">{formatCurrency(results.rentalOption.totalCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Skattefordel:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(results.rentalOption.taxBenefit)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-semibold">
                        <span>Nettoposition:</span>
                        <span className={results.rentalOption.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(results.rentalOption.netPosition)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Summary Alert */}
                <Alert className="mt-6 bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription>
                    <strong>Anbefaling:</strong> {getOptionLabel(results.bestOption)} er den mest fordelagtige løsning
                    med et investeringspotentiale på <strong>{formatCurrency(results.investmentPotential)}</strong> over{' '}
                    {inputs.investmentPeriod} år.
                  </AlertDescription>
                </Alert>

                {/* Museum Partner CTA */}
                {results.recommendMuseumPartner && (
                  <Alert className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                    <Award className="h-5 w-5 text-purple-600" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-semibold text-purple-900">
                          Museum Partner-koncept anbefales
                        </p>
                        <p className="text-sm text-purple-800">
                          Med et investeringspotentiale over 1 mio. kr. kan vores Museum Partner-koncept give dig
                          adgang til eksklusiv kunst, professionel kuratering og optimale skattefordele.
                        </p>
                        <Button
                          variant="default"
                          className="mt-2 bg-purple-600 hover:bg-purple-700"
                          onClick={() => window.open('/virksomheder-premium-kuratering', '_blank')}
                        >
                          Læs mere om Museum Partner
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}

          {/* Branding */}
          <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>
              Analyse leveret af{' '}
              <a
                href="https://regnskabsanalysen.dk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium"
              >
                Regnskabsanalysen.dk
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Dialog */}
      <Dialog open={showConversionDialog} onOpenChange={setShowConversionDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-6 w-6 text-blue-600" />
              Få en fuld regnskabsanalyse
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Du har netop beregnet dit investeringspotentiale. Vil du have en dybdegående analyse af din virksomheds økonomi?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">
                Regnskabsanalysen.dk tilbyder:
              </h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Komplet økonomisk sundhedstjek af din virksomhed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Identificer skjulte omkostninger og besparelsesmuligheder</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Optimer din skatteposition og cashflow</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">✓</span>
                  <span>Få konkrete anbefalinger til vækst og rentabilitet</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-medium">
                <span className="text-green-600">💡 Eksklusivt tilbud:</span> Få 20% rabat når du henviser til denne investeringsberegner
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConversionDialog(false)}
              className="flex-1"
            >
              Måske senere
            </Button>
            <Button
              onClick={() => {
                window.open('https://www.regnskabsanalysen.dk?ref=artissafe_calc', '_blank');
                setShowConversionDialog(false);
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Få din analyse nu
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-2">
            Ingen binding • Gratis konsultation • Hurtig respons
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
