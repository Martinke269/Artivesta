# Investment Calculator Widget - Implementation Guide

## Overview

The Investment Calculator Widget is a lightweight, embeddable tool that allows users to compare the financial implications of purchasing, leasing, or renting art and furniture art. It's designed to be embedded on Artissafe PSEO landing pages.

## Features

### Core Functionality
- **Depreciation Calculation**: Handles tax depreciation on art/furniture art
- **ROI Projection**: Shows expected value appreciation over time
- **Comparison Analysis**: Side-by-side comparison of Purchase vs. Leasing vs. Rental
- **Tax Benefits**: Calculates corporate tax advantages (22% Danish rate)
- **Smart Recommendations**: Highlights the most financially advantageous option

### Special Features
- **Museum Partner CTA**: Automatically suggests Museum Partner concept when investment potential exceeds 1M DKK
- **Regnskabsanalysen.dk Branding**: Includes attribution to Regnskabsanalysen.dk
- **Responsive Design**: Works on all screen sizes
- **Professional UI**: Clean, modern interface with gradient styling

## File Structure

```
lib/
  investment-calculator.ts          # Core calculation logic
components/
  investment-calculator-widget.tsx  # React component
app/
  widget/
    investeringsberegner/
      page.tsx                      # Standalone widget page
```

## Usage

### 1. Direct Page Access

The calculator is available at:
```
https://yourdomain.com/widget/investeringsberegner
```

### 2. Iframe Embedding

Embed on any page using an iframe:

```html
<iframe 
  src="https://yourdomain.com/widget/investeringsberegner"
  width="100%"
  height="900"
  frameborder="0"
  style="border: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
  title="Investeringsberegner"
></iframe>
```

### 3. Responsive Iframe

For responsive embedding:

```html
<div style="position: relative; padding-bottom: 100%; height: 0; overflow: hidden;">
  <iframe 
    src="https://yourdomain.com/widget/investeringsberegner"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
    title="Investeringsberegner"
  ></iframe>
</div>
```

### 4. Component Integration

Use directly in Next.js pages:

```tsx
import { InvestmentCalculatorWidget } from '@/components/investment-calculator-widget';

export default function MyPage() {
  return (
    <div>
      <h1>Investment Analysis</h1>
      <InvestmentCalculatorWidget />
    </div>
  );
}
```

## Calculation Logic

### Input Parameters

1. **Købspris (Purchase Price)**: Initial investment amount in DKK
2. **Forventet værdistigning (Expected Appreciation)**: Annual percentage increase
3. **Afskrivningssats (Depreciation Rate)**: Annual tax depreciation percentage
4. **Leasing (Leasing Rate)**: Monthly leasing cost in DKK
5. **Leje (Rental Rate)**: Monthly rental cost in DKK
6. **Investeringsperiode (Investment Period)**: Number of years

### Calculation Formulas

#### Purchase Option
```
Annual Depreciation = Purchase Price × (Depreciation Rate / 100)
Total Depreciation = Annual Depreciation × Investment Period
Tax Benefit = Total Depreciation × 0.22 (Corporate Tax Rate)
Future Value = Purchase Price + (Annual Appreciation × Investment Period)
Net Position = Future Value - Purchase Price + Tax Benefit
```

#### Leasing Option
```
Total Cost = Monthly Rate × 12 × Investment Period
Tax Benefit = Total Cost × 0.22
Net Position = -Total Cost + Tax Benefit
```

#### Rental Option
```
Total Cost = Monthly Rate × 12 × Investment Period
Tax Benefit = Total Cost × 0.22
Net Position = -Total Cost + Tax Benefit
```

### Best Option Selection

The calculator compares net positions and highlights the option with the highest value.

### Museum Partner Recommendation

When `Investment Potential ≥ 1,000,000 DKK`, the calculator displays a special CTA promoting the Museum Partner concept with a link to `/virksomheder-premium-kuratering`.

## Customization

### Compact Mode

Enable compact mode for smaller spaces:

```tsx
<InvestmentCalculatorWidget compact={true} />
```

### Styling

The widget uses Tailwind CSS and shadcn/ui components. Customize by:

1. Modifying the component's className props
2. Updating the gradient backgrounds
3. Adjusting card styling in `components/investment-calculator-widget.tsx`

## Default Values

The calculator initializes with these defaults:
- Purchase Price: 500,000 DKK
- Expected Appreciation: 5% annually
- Depreciation Rate: 20% annually
- Leasing: 5,000 DKK/month
- Rental: 4,000 DKK/month
- Investment Period: 5 years

## SEO Considerations

The widget page includes:
- `noindex, nofollow` robots meta tag (widget should not be indexed separately)
- Descriptive title and meta description
- Proper semantic HTML structure

## Performance

- Lightweight: No external dependencies beyond Next.js and shadcn/ui
- Client-side calculations: Instant results without API calls
- Optimized rendering: React state management for efficient updates

## Deployment on 500,000 Landing Pages

### Strategy 1: Dynamic Iframe Injection
```javascript
// Add to landing page template
<script>
  document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('calculator-widget');
    if (container) {
      const iframe = document.createElement('iframe');
      iframe.src = 'https://artissafe.dk/widget/investeringsberegner';
      iframe.width = '100%';
      iframe.height = '900';
      iframe.frameBorder = '0';
      iframe.style.border = 'none';
      container.appendChild(iframe);
    }
  });
</script>
```

### Strategy 2: Server-Side Template
Include in your landing page template:
```html
<!-- Investment Calculator Widget -->
<section class="calculator-section">
  <iframe 
    src="https://artissafe.dk/widget/investeringsberegner"
    width="100%"
    height="900"
    frameborder="0"
    loading="lazy"
    title="Investeringsberegner"
  ></iframe>
</section>
```

### Strategy 3: CDN Distribution
For optimal performance across 500k pages:
1. Host the widget on a CDN
2. Use lazy loading
3. Implement caching headers
4. Consider using a service worker for offline capability

## Analytics Integration

Track widget usage:

```tsx
// Add to component
useEffect(() => {
  // Track widget load
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'widget_load', {
      widget_name: 'investment_calculator'
    });
  }
}, []);

// Track calculations
const handleCalculate = () => {
  const calculatedResults = calculateInvestment(inputs);
  setResults(calculatedResults);
  
  // Track calculation event
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'calculator_use', {
      purchase_price: inputs.purchasePrice,
      best_option: calculatedResults.bestOption,
      investment_potential: calculatedResults.investmentPotential
    });
  }
};
```

## Maintenance

### Updating Tax Rates
Edit `CORPORATE_TAX_RATE` in `lib/investment-calculator.ts`:
```typescript
const CORPORATE_TAX_RATE = 0.22; // Update as needed
```

### Updating Museum Partner Threshold
Edit `MUSEUM_PARTNER_THRESHOLD` in `lib/investment-calculator.ts`:
```typescript
const MUSEUM_PARTNER_THRESHOLD = 1_000_000; // Update as needed
```

## Testing

Test the calculator with various scenarios:

1. **Low Investment** (< 100k DKK): Should favor rental/leasing
2. **Medium Investment** (100k-500k DKK): Compare all options
3. **High Investment** (> 1M DKK): Should trigger Museum Partner CTA
4. **High Appreciation**: Purchase should be favored
5. **Low Appreciation**: Leasing/rental may be better

## Support

For issues or questions:
- Technical: Check component logs in browser console
- Business Logic: Review calculation formulas in `lib/investment-calculator.ts`
- UI/UX: Modify `components/investment-calculator-widget.tsx`

## Future Enhancements

Potential improvements:
- [ ] Add currency selector (DKK, EUR, USD)
- [ ] Export results as PDF
- [ ] Email results functionality
- [ ] Comparison with multiple artworks
- [ ] Historical data integration
- [ ] Advanced tax scenarios
- [ ] Multi-language support
