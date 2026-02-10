# Buyer Dashboard Settings Page

## Overview
The Settings Page allows buyers to configure their company information, notification preferences, payment settings, and security options. All settings are user-specific and protected by RLS policies.

## Route
`/buyer/dashboard/settings`

## Features

### 1. Virksomhedsoplysninger (Company Information)
**Purpose:** Manage company details and contact information

**Fields:**
- Virksomhedsnavn (Company name) - Required
- CVR-nummer (CVR number) - Optional, 8 digits
- Adresse (Address) - Required
- Postnummer (Postal code) - Required
- By (City) - Required
- Land (Country) - Required, defaults to "Danmark"
- Kontaktperson (Contact person) - Optional
- Email - Required
- Telefon (Phone) - Optional
- Website - Optional
- Logo - Optional (placeholder for future upload)

**Actions:**
- Save changes button (updates all fields at once)
- Upload logo button (placeholder - coming soon)

**Validation:**
- Required fields enforced
- Email format validation
- URL format validation for website
- CVR number limited to 8 characters

### 2. Notifikationer (Notifications)
**Purpose:** Configure email notification preferences

**Toggles:**
- Nye ordrer (New orders) - Notifications when placing new orders
- Nye leasingaftaler (New leasing agreements) - Notifications for new leases
- Udløber snart (Expiring leases) - Warnings for expiring leases
- Forsikringsadvarsler (Insurance warnings) - Insurance issues or expiration
- Betalingsfejl (Payment failures) - Failed payment notifications
- Systemmeddelelser (System notifications) - Important system updates

**Behavior:**
- Each toggle updates immediately (optimistic UI)
- Settings are per-user (stored in buyer_notification_settings table)
- Default: All notifications enabled
- Success/error toast notifications

### 3. Betalingsindstillinger (Payment Settings)
**Purpose:** View and manage payment methods and history

**Payment Methods:**
- Betalingskort (Card) - Visa, Mastercard, etc.
- Faktura (Invoice) - Invoice with payment deadline
- Bankoverførsel (Bank transfer) - Direct bank payment

**Invoice Information:**
- CVR-nummer (from company info)
- Faktura email (from company info)
- Faktura adresse (from company info)

**Payment History:**
- Last payment date and amount
- Empty state if no payments yet
- Link to full history (placeholder - coming soon)

**Note:** Payment method selection is currently read-only (coming soon)

### 4. Sikkerhed (Security)
**Purpose:** Manage account security and access

**Role Information:**
- Current role: Køber (Buyer)
- Status badge: Aktiv (Active)
- List of permissions:
  - Buy and lease artworks
  - Manage orders and leasing agreements
  - View invoices and payments
  - Manage insurance
  - Update company information

**Password Management:**
- Change password button (placeholder - coming soon)
- Last changed indicator

**Two-Factor Authentication (2FA):**
- Toggle for 2FA (placeholder - coming soon)
- SMS or app-based verification

**Login Activity:**
- View recent login attempts (placeholder - coming soon)
- Active sessions management

## Components

### Main Components
- `app/buyer/dashboard/settings/page.tsx` - Server component that fetches data
- `app/buyer/dashboard/settings/settings-page-client.tsx` - Client component with tabs

### Section Components
- `components/buyer/dashboard/settings/company-info-form.tsx` - Company information form
- `components/buyer/dashboard/settings/notification-settings.tsx` - Notification toggles
- `components/buyer/dashboard/settings/payment-settings.tsx` - Payment info display
- `components/buyer/dashboard/settings/security-settings.tsx` - Security and role info

## Database Queries

### Query Functions (`lib/supabase/buyer-settings-queries.ts`)

**Read Operations:**
- `getBuyerSettings(supabase, userId)` - Fetch buyer settings from profiles table
- `getNotificationSettings(supabase, userId)` - Fetch notification preferences
- `getBuyerPaymentInfo(supabase, userId)` - Fetch payment info and last payment

**Write Operations:**
- `updateBuyerInfo(supabase, userId, updates)` - Update company information
- `updateNotificationSettings(supabase, userId, settings)` - Update notifications
- `updateBuyerLogo(supabase, userId, logoUrl)` - Update company logo

## Database Schema

### buyer_notification_settings Table
```sql
CREATE TABLE buyer_notification_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  new_orders BOOLEAN DEFAULT true,
  new_leasing BOOLEAN DEFAULT true,
  expiring_leases BOOLEAN DEFAULT true,
  insurance_warnings BOOLEAN DEFAULT true,
  payment_failures BOOLEAN DEFAULT true,
  system_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies
- Users can only view their own notification settings
- Users can insert their own notification settings
- Users can update their own notification settings

## Security Considerations

### RLS Policies
All operations respect RLS policies:
- Buyers can only view and update their own settings
- Notification settings are user-specific
- Payment information is read-only from existing data

### Data Validation
- Required fields enforced client-side and server-side
- Email format validation
- URL format validation
- CVR number format (8 digits)

### Privacy
- No access to other users' data
- Payment details are derived from existing orders
- Notification preferences are private

## UI/UX Features

### Tabs Navigation
- 4 main tabs: Virksomhed, Notifikationer, Betaling, Sikkerhed
- Responsive layout:
  - Mobile: 2-column grid
  - Desktop: Horizontal tabs with icons
- Icons for visual clarity

### Form Behavior
- Auto-save for notification toggles (optimistic UI)
- Manual save for company information
- Loading states during save operations
- Success/error toast notifications
- Form validation with error messages

### Responsive Design
- Mobile-first approach
- Form fields stack on mobile
- Grid layouts on desktop
- Accessible form labels and descriptions

### Empty States
- No payments yet message
- Placeholder messages for coming soon features
- Clear visual indicators

## Toast Notifications

### Success Messages
- "Ændringer gemt" - Company info updated
- "Notifikationer opdateret" - Notifications updated

### Error Messages
- "Kunne ikke gemme ændringer. Prøv igen." - Update failed
- "Kunne ikke opdatere notifikationer. Prøv igen." - Notification update failed

## Future Enhancements

### Planned Features (Placeholders)
1. **Logo Upload:**
   - Image upload functionality
   - Image cropping/resizing
   - Preview before save

2. **Payment Method Selection:**
   - Choose default payment method
   - Add/remove payment methods
   - Payment method verification

3. **Password Change:**
   - Current password verification
   - New password with strength indicator
   - Confirmation email

4. **2FA:**
   - SMS-based verification
   - Authenticator app support
   - Backup codes
   - Recovery options

5. **Login Activity:**
   - Recent login history
   - Device information
   - Location tracking
   - Suspicious activity alerts

6. **Full Payment History:**
   - Paginated payment list
   - Filter by date range
   - Export to CSV
   - Receipt downloads

## Testing Checklist

### Functional Testing
- [ ] Company info form saves correctly
- [ ] All required fields validated
- [ ] Notification toggles update immediately
- [ ] Payment info displays correctly
- [ ] Security section shows correct role
- [ ] Toast notifications appear
- [ ] Form validation works
- [ ] Optimistic UI updates correctly

### Data Testing
- [ ] Settings load from database
- [ ] Updates persist to database
- [ ] Default notification settings work
- [ ] Payment history displays correctly
- [ ] Empty states display when appropriate

### UI Testing
- [ ] Tabs work on mobile and desktop
- [ ] Forms are responsive
- [ ] Loading states display correctly
- [ ] Icons display correctly
- [ ] All Danish text is correct
- [ ] Badges display correctly

### Edge Cases
- [ ] User with no company info
- [ ] User with no payment history
- [ ] User with no notification settings (uses defaults)
- [ ] Network errors handled gracefully
- [ ] Concurrent updates handled
- [ ] Invalid data rejected

## Error Handling

### Common Errors
1. **No User Found:** Redirect to login
2. **No Settings Found:** Redirect to dashboard
3. **Network Error:** Show error toast, allow retry
4. **Validation Error:** Show field-specific errors

### Error Recovery
- All operations can be retried
- Form state preserved on error
- Clear error messages in Danish
- Graceful degradation for missing data

## Performance Considerations

### Data Loading
- Server-side data fetching
- Parallel data fetching with Promise.all
- Minimal client-side queries
- Optimistic UI updates for toggles

### Bundle Size
- Code splitting by tab
- Lazy loading of future features
- Minimal dependencies
- Optimized components

## Accessibility

### ARIA Labels
- Form fields have proper labels
- Buttons have descriptive text
- Tabs have proper roles
- Status messages announced

### Keyboard Navigation
- Tab order is logical
- All interactive elements focusable
- Enter submits forms
- Escape closes dialogs (future)

### Screen Readers
- Form errors announced
- Success messages announced
- Loading states announced
- Role information clear

## Related Documentation
- [Buyer Dashboard Overview](./BUYER_DASHBOARD_OVERVIEW.md)
- [Buyer Dashboard Orders](./BUYER_DASHBOARD_ORDERS.md)
- [Buyer Dashboard Leasing](./BUYER_DASHBOARD_LEASING.md)
- [Buyer Dashboard Invoices](./BUYER_DASHBOARD_INVOICES.md)
- [Buyer Dashboard Payments](./BUYER_DASHBOARD_PAYMENTS.md)
- [Buyer Dashboard Insurance](./BUYER_DASHBOARD_INSURANCE.md)
- [RLS Security Implementation](../RLS_SECURITY_IMPLEMENTATION.md)
