# Gallery Dashboard Settings Page

## Overview
The Settings Page allows gallery owners and managers to configure their gallery's information, notifications, payment settings, and security preferences. Access is role-based with different permissions for owners, managers, curators, and staff.

## Route
`/gallery/dashboard/settings`

## Features

### 1. Gallery Information Section
**Access:** Owner and Manager can edit, Curator and Staff are read-only

**Fields:**
- Gallery name (required)
- Description (optional)
- Address (required)
- City (required)
- Postal code (required)
- Country (required)
- Contact email (required)
- Phone (optional)
- Website (optional)

**Actions:**
- Save changes button (updates all fields at once)

### 2. Notification Settings Section
**Access:** All roles can configure their own notifications

**Toggles:**
- Nye ordrer (New orders)
- Nye leasingaftaler (New leasing agreements)
- Udløbende leasingaftaler (Expiring leases)
- Forsikringsadvarsler (Insurance warnings)
- Nye kunstnere i galleriet (New artists in gallery)
- Systemmeddelelser (System notifications)

**Behavior:**
- Each toggle updates immediately
- Settings are per-user (not gallery-wide)

### 3. Payment & Payout Settings Section
**Access:** Owner can edit, others are read-only

**Displays:**
- Stripe connection status (Connected/Not connected badge)
- Stripe account ID (if connected)
- Payout frequency (monthly)
- Last payout date and amount (if available)
- Commission percentage (default 20%)
- Commission breakdown explanation

**Actions (Owner only):**
- Connect Stripe button (if not connected)
- Open Stripe Dashboard button (if connected)
- Update account information button (if connected)

### 4. Security & Roles Section
**Access:** Role-specific features

**Displays for all:**
- Current user role badge
- Role description
- Change password button
- 2FA toggle (placeholder - coming soon)

**Owner-only "Danger Zone":**
- Transfer ownership button (placeholder modal)
- Delete gallery button (with comprehensive warning dialog)

**Delete Gallery Warning:**
- Lists all data that will be permanently deleted:
  - All artworks and metadata
  - All team members and artists
  - All orders and leasing agreements
  - All analytics and AI insights
- Emphasizes impact on artists and team members
- Requires explicit confirmation

## Components

### Main Components
- `app/gallery/dashboard/settings/page.tsx` - Server component that fetches data
- `app/gallery/dashboard/settings/settings-page-client.tsx` - Client component with tabs and state management

### Section Components
- `components/gallery/dashboard/settings/gallery-info-form.tsx` - Gallery information form
- `components/gallery/dashboard/settings/notification-settings.tsx` - Notification toggles
- `components/gallery/dashboard/settings/payment-settings.tsx` - Payment info display
- `components/gallery/dashboard/settings/security-settings.tsx` - Security and role management

## Database Queries

### Query Functions (`lib/supabase/gallery-settings-queries.ts`)

**Read Operations:**
- `getGallerySettings(supabase, galleryId)` - Fetch gallery settings
- `getNotificationSettings(supabase, galleryId, userId)` - Fetch user notification preferences
- `getGalleryPaymentInfo(supabase, galleryId)` - Fetch Stripe and payout info
- `getGallerySocialMedia(supabase, galleryId)` - Fetch social media links (placeholder)
- `getGalleryBranding(supabase, galleryId)` - Fetch branding settings (placeholder)
- `isGalleryOwner(supabase, galleryId, userId)` - Check if user is owner

**Write Operations:**
- `updateGalleryInfo(supabase, galleryId, updates)` - Update gallery information
- `updateNotificationSettings(supabase, galleryId, userId, settings)` - Update notifications
- `updateGalleryLogo(supabase, galleryId, logoUrl)` - Update gallery logo
- `deleteGallery(supabase, galleryId)` - Delete gallery (owner only)
- `transferGalleryOwnership(supabase, galleryId, newOwnerId)` - Transfer ownership (placeholder)

## Role-Based Access Control

### Owner
- Full access to all sections
- Can edit all settings
- Can delete gallery
- Can transfer ownership (placeholder)

### Manager
- Can edit gallery information
- Can configure own notifications
- Read-only access to payment settings
- Cannot delete gallery or transfer ownership

### Curator
- Read-only access to gallery information
- Can configure own notifications
- Read-only access to payment settings
- Cannot access danger zone

### Staff
- Read-only access to gallery information
- Can configure own notifications
- Read-only access to payment settings
- Cannot access danger zone

## Security Considerations

### RLS Policies
All operations respect existing RLS policies:
- Gallery settings can only be viewed by gallery team members
- Only owners can update critical settings (payment, deletion)
- Only owners and managers can update gallery information
- Each user can only update their own notification preferences

### Data Validation
- Required fields are enforced client-side and server-side
- Email format validation
- URL format validation for website
- Phone number format (basic validation)

### Dangerous Operations
- Gallery deletion requires explicit confirmation
- Warning dialog lists all data that will be lost
- Emphasizes impact on team members and artists
- Cannot be undone

## UI/UX Features

### Tabs Navigation
- Responsive tab layout
- 4 main tabs: Gallerioplysninger, Notifikationer, Betaling, Sikkerhed
- Mobile: 2-column grid
- Desktop: Horizontal tabs

### Form Behavior
- Auto-save for notification toggles
- Manual save for gallery information
- Loading states during save operations
- Success/error toast notifications

### Responsive Design
- Mobile-first approach
- Form fields stack on mobile
- Grid layouts on desktop
- Accessible form labels and descriptions

### Empty States
- Placeholder messages for unconnected Stripe
- Coming soon badges for future features (2FA, ownership transfer)

## Toast Notifications

### Success Messages
- "Ændringer gemt" - Gallery info updated
- "Notifikationer opdateret" - Notifications updated
- "Galleri slettet" - Gallery deleted

### Error Messages
- "Kunne ikke gemme ændringer. Prøv igen." - Update failed
- "Kunne ikke opdatere notifikationer. Prøv igen." - Notification update failed
- "Kunne ikke slette galleriet. Prøv igen." - Delete failed

## Future Enhancements

### Planned Features (Placeholders)
1. **Branding Section:**
   - Primary/secondary color pickers
   - Logo upload
   - Cover image upload
   - Live preview

2. **Social Media:**
   - Instagram handle
   - Facebook page
   - LinkedIn profile

3. **2FA:**
   - Two-factor authentication setup
   - Backup codes
   - Recovery options

4. **Ownership Transfer:**
   - Select new owner from team members
   - Confirmation workflow
   - Email notifications

5. **Advanced Payment Settings:**
   - Custom commission rates per artist
   - Payout schedule configuration
   - Tax information

## Testing Checklist

### Functional Testing
- [ ] Gallery info form saves correctly
- [ ] Notification toggles update immediately
- [ ] Payment info displays correctly
- [ ] Role badges show correct role
- [ ] Delete gallery works with confirmation
- [ ] Proper redirects after deletion
- [ ] Form validation works
- [ ] Toast notifications appear

### Permission Testing
- [ ] Owner can access all features
- [ ] Manager can edit gallery info
- [ ] Curator has read-only access to info
- [ ] Staff has read-only access to info
- [ ] Only owner sees danger zone
- [ ] Non-owners cannot delete gallery

### UI Testing
- [ ] Tabs work on mobile and desktop
- [ ] Forms are responsive
- [ ] Loading states display correctly
- [ ] Error states display correctly
- [ ] Confirmation dialogs work
- [ ] All Danish text is correct

### Edge Cases
- [ ] User with no gallery redirects correctly
- [ ] Team member (non-owner) can access page
- [ ] Invalid gallery ID redirects
- [ ] Network errors handled gracefully
- [ ] Concurrent updates handled

## Error Handling

### Common Errors
1. **No Gallery Found:** Redirect to dashboard
2. **Permission Denied:** Show read-only view
3. **Network Error:** Show error toast, allow retry
4. **Validation Error:** Show field-specific errors

### Error Recovery
- All operations can be retried
- Form state is preserved on error
- Clear error messages in Danish
- Graceful degradation for missing data

## Performance Considerations

### Data Loading
- Server-side data fetching
- Minimal client-side queries
- Cached gallery settings
- Optimistic UI updates for toggles

### Bundle Size
- Code splitting by tab
- Lazy loading of dialogs
- Minimal dependencies
- Optimized images

## Accessibility

### ARIA Labels
- Form fields have proper labels
- Buttons have descriptive text
- Dialogs have proper roles
- Status messages announced

### Keyboard Navigation
- Tab order is logical
- All interactive elements focusable
- Escape closes dialogs
- Enter submits forms

### Screen Readers
- Form errors announced
- Success messages announced
- Loading states announced
- Role information clear

## Related Documentation
- [Gallery Dashboard Implementation](./GALLERY_DASHBOARD_IMPLEMENTATION.md)
- [Gallery Dashboard Team](./GALLERY_DASHBOARD_TEAM.md)
- [RLS Security Implementation](../RLS_SECURITY_IMPLEMENTATION.md)
