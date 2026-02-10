'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { BuyerSettings } from '@/lib/supabase/buyer-settings-queries';

interface CompanyInfoFormProps {
  settings: BuyerSettings;
  onUpdate: (updates: Partial<BuyerSettings>) => Promise<void>;
}

export function CompanyInfoForm({ settings, onUpdate }: CompanyInfoFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: settings.company_name || '',
    cvr_number: settings.cvr_number || '',
    address: settings.address || '',
    city: settings.city || '',
    postal_code: settings.postal_code || '',
    country: settings.country || 'Danmark',
    contact_person: settings.contact_person || '',
    email: settings.email || '',
    phone: settings.phone || '',
    website: settings.website || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onUpdate(formData);
      toast({
        title: 'Ændringer gemt',
        description: 'Virksomhedsoplysninger er blevet opdateret.',
      });
    } catch (error) {
      toast({
        title: 'Fejl',
        description: 'Kunne ikke gemme ændringer. Prøv igen.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Virksomhedsoplysninger</CardTitle>
        <CardDescription>
          Opdater dine virksomhedsoplysninger og kontaktinformation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="company_name">
              Virksomhedsnavn <span className="text-destructive">*</span>
            </Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
              placeholder="Indtast virksomhedsnavn"
              required
            />
          </div>

          {/* CVR Number */}
          <div className="space-y-2">
            <Label htmlFor="cvr_number">CVR-nummer</Label>
            <Input
              id="cvr_number"
              value={formData.cvr_number}
              onChange={(e) => handleChange('cvr_number', e.target.value)}
              placeholder="12345678"
              maxLength={8}
            />
            <p className="text-sm text-muted-foreground">
              8 cifre uden mellemrum
            </p>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">
              Adresse <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Gadenavn 123"
              required
            />
          </div>

          {/* City and Postal Code */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="postal_code">
                Postnummer <span className="text-destructive">*</span>
              </Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => handleChange('postal_code', e.target.value)}
                placeholder="1234"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">
                By <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="København"
                required
              />
            </div>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">
              Land <span className="text-destructive">*</span>
            </Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              placeholder="Danmark"
              required
            />
          </div>

          {/* Contact Person */}
          <div className="space-y-2">
            <Label htmlFor="contact_person">Kontaktperson</Label>
            <Input
              id="contact_person"
              value={formData.contact_person}
              onChange={(e) => handleChange('contact_person', e.target.value)}
              placeholder="Navn på kontaktperson"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="kontakt@virksomhed.dk"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+45 12 34 56 78"
            />
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://virksomhed.dk"
            />
          </div>

          {/* Logo Upload (Placeholder) */}
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              {settings.logo_url && (
                <div className="h-16 w-16 rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                  <img
                    src={settings.logo_url}
                    alt="Virksomhedslogo"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <Button type="button" variant="outline" disabled>
                <Upload className="mr-2 h-4 w-4" />
                Upload nyt logo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Logo upload kommer snart
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gem ændringer
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
