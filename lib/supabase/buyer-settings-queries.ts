import { SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// Types
// ============================================================================

export interface BuyerSettings {
  id: string;
  company_name: string | null;
  cvr_number: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  contact_person: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface BuyerNotificationSettings {
  user_id: string;
  new_orders: boolean;
  new_leasing: boolean;
  expiring_leases: boolean;
  insurance_warnings: boolean;
  payment_failures: boolean;
  system_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface BuyerPaymentInfo {
  default_payment_method: 'card' | 'invoice' | 'bank_transfer';
  invoice_cvr: string | null;
  invoice_address: string | null;
  invoice_email: string | null;
  last_payment_date: string | null;
  last_payment_amount: number | null;
}

// ============================================================================
// Read Operations
// ============================================================================

/**
 * Get buyer settings for the current user
 */
export async function getBuyerSettings(
  supabase: SupabaseClient,
  userId: string
): Promise<BuyerSettings | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching buyer settings:', error);
    return null;
  }

  return data;
}

/**
 * Get notification settings for buyer
 */
export async function getNotificationSettings(
  supabase: SupabaseClient,
  userId: string
): Promise<BuyerNotificationSettings | null> {
  const { data, error } = await supabase
    .from('buyer_notification_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // If no settings exist, return defaults
    if (error.code === 'PGRST116') {
      return {
        user_id: userId,
        new_orders: true,
        new_leasing: true,
        expiring_leases: true,
        insurance_warnings: true,
        payment_failures: true,
        system_notifications: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    console.error('Error fetching notification settings:', error);
    return null;
  }

  return data;
}

/**
 * Get payment information for buyer
 */
export async function getBuyerPaymentInfo(
  supabase: SupabaseClient,
  userId: string
): Promise<BuyerPaymentInfo | null> {
  // Get default payment method from profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('company_name, cvr_number, address, email')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('Error fetching payment info:', profileError);
    return null;
  }

  // Get last payment from orders
  const { data: lastPayment, error: paymentError } = await supabase
    .from('orders')
    .select('created_at, total_price')
    .eq('buyer_id', userId)
    .eq('payment_status', 'paid')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return {
    default_payment_method: 'card',
    invoice_cvr: profile?.cvr_number || null,
    invoice_address: profile?.address || null,
    invoice_email: profile?.email || null,
    last_payment_date: lastPayment?.created_at || null,
    last_payment_amount: lastPayment?.total_price || null,
  };
}

// ============================================================================
// Write Operations
// ============================================================================

/**
 * Update buyer information
 */
export async function updateBuyerInfo(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<BuyerSettings>
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating buyer info:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
  supabase: SupabaseClient,
  userId: string,
  settings: Partial<Omit<BuyerNotificationSettings, 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; error?: string }> {
  // Try to update first
  const { error: updateError } = await supabase
    .from('buyer_notification_settings')
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  // If no rows were updated, insert new settings
  if (updateError && updateError.code === 'PGRST116') {
    const { error: insertError } = await supabase
      .from('buyer_notification_settings')
      .insert({
        user_id: userId,
        ...settings,
      });

    if (insertError) {
      console.error('Error inserting notification settings:', insertError);
      return { success: false, error: insertError.message };
    }
  } else if (updateError) {
    console.error('Error updating notification settings:', updateError);
    return { success: false, error: updateError.message };
  }

  return { success: true };
}

/**
 * Update buyer logo
 */
export async function updateBuyerLogo(
  supabase: SupabaseClient,
  userId: string,
  logoUrl: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('profiles')
    .update({
      logo_url: logoUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating buyer logo:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
