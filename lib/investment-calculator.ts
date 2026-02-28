/**
 * Investment Calculator Logic
 * Reused from Regnskabsanalysen.dk for Artissafe PSEO pages
 */

export interface CalculatorInputs {
  purchasePrice: number;
  expectedAppreciation: number; // Annual percentage
  depreciationRate: number; // Annual percentage for tax purposes
  leasingMonthlyRate: number;
  rentalMonthlyRate: number;
  investmentPeriod: number; // Years
}

export interface CalculatorResults {
  purchaseOption: {
    totalCost: number;
    taxBenefit: number;
    futureValue: number;
    netPosition: number;
  };
  leasingOption: {
    totalCost: number;
    taxBenefit: number;
    netPosition: number;
  };
  rentalOption: {
    totalCost: number;
    taxBenefit: number;
    netPosition: number;
  };
  bestOption: 'purchase' | 'leasing' | 'rental';
  investmentPotential: number;
  recommendMuseumPartner: boolean;
}

const CORPORATE_TAX_RATE = 0.22; // 22% Danish corporate tax
const MUSEUM_PARTNER_THRESHOLD = 1_000_000; // 1M DKK

export function calculateInvestment(inputs: CalculatorInputs): CalculatorResults {
  const {
    purchasePrice,
    expectedAppreciation,
    depreciationRate,
    leasingMonthlyRate,
    rentalMonthlyRate,
    investmentPeriod,
  } = inputs;

  // Purchase Option Calculations
  const annualDepreciation = purchasePrice * (depreciationRate / 100);
  const totalDepreciation = annualDepreciation * investmentPeriod;
  const purchaseTaxBenefit = totalDepreciation * CORPORATE_TAX_RATE;
  
  const annualAppreciation = purchasePrice * (expectedAppreciation / 100);
  const futureValue = purchasePrice + (annualAppreciation * investmentPeriod);
  
  const purchaseNetPosition = futureValue - purchasePrice + purchaseTaxBenefit;

  // Leasing Option Calculations
  const totalLeasingCost = leasingMonthlyRate * 12 * investmentPeriod;
  const leasingTaxBenefit = totalLeasingCost * CORPORATE_TAX_RATE;
  const leasingNetPosition = -totalLeasingCost + leasingTaxBenefit;

  // Rental Option Calculations
  const totalRentalCost = rentalMonthlyRate * 12 * investmentPeriod;
  const rentalTaxBenefit = totalRentalCost * CORPORATE_TAX_RATE;
  const rentalNetPosition = -totalRentalCost + rentalTaxBenefit;

  // Determine best option
  const options = [
    { type: 'purchase' as const, netPosition: purchaseNetPosition },
    { type: 'leasing' as const, netPosition: leasingNetPosition },
    { type: 'rental' as const, netPosition: rentalNetPosition },
  ];
  
  const bestOption = options.reduce((best, current) => 
    current.netPosition > best.netPosition ? current : best
  ).type;

  const investmentPotential = Math.max(
    purchaseNetPosition,
    leasingNetPosition,
    rentalNetPosition
  );

  return {
    purchaseOption: {
      totalCost: purchasePrice,
      taxBenefit: purchaseTaxBenefit,
      futureValue,
      netPosition: purchaseNetPosition,
    },
    leasingOption: {
      totalCost: totalLeasingCost,
      taxBenefit: leasingTaxBenefit,
      netPosition: leasingNetPosition,
    },
    rentalOption: {
      totalCost: totalRentalCost,
      taxBenefit: rentalTaxBenefit,
      netPosition: rentalNetPosition,
    },
    bestOption,
    investmentPotential,
    recommendMuseumPartner: investmentPotential >= MUSEUM_PARTNER_THRESHOLD,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
