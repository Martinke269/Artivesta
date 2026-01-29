/**
 * Structured Data (JSON-LD) generators for SEO
 */

export interface Artwork {
  id: string;
  title: string;
  description?: string;
  price_cents: number;
  currency: string;
  image_url?: string;
  status: string;
  created_at: string;
  artist: {
    name: string;
  };
  medium?: string;
  dimensions?: string;
  year_created?: number;
}

/**
 * Generate Product schema for artwork
 */
export function generateArtworkSchema(artwork: Artwork, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: artwork.title,
    description: artwork.description || `Original kunstværk af ${artwork.artist.name}`,
    image: artwork.image_url ? `${baseUrl}${artwork.image_url}` : undefined,
    brand: {
      '@type': 'Brand',
      name: artwork.artist.name,
    },
    offers: {
      '@type': 'Offer',
      price: (artwork.price_cents / 100).toFixed(2),
      priceCurrency: artwork.currency,
      availability: artwork.status === 'available' 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      url: `${baseUrl}/artwork/${artwork.id}`,
      seller: {
        '@type': 'Person',
        name: artwork.artist.name,
      },
    },
    category: 'Art',
    additionalProperty: [
      artwork.medium && {
        '@type': 'PropertyValue',
        name: 'Medium',
        value: artwork.medium,
      },
      artwork.dimensions && {
        '@type': 'PropertyValue',
        name: 'Dimensions',
        value: artwork.dimensions,
      },
      artwork.year_created && {
        '@type': 'PropertyValue',
        name: 'Year Created',
        value: artwork.year_created.toString(),
      },
    ].filter(Boolean),
  };
}

/**
 * Generate Organization schema for the marketplace
 */
export function generateOrganizationSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Kunstmarkedsplads',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Danmarks førende online markedsplads for original kunst',
    sameAs: [
      // Add social media links here when available
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['Danish', 'English'],
    },
  };
}

/**
 * Generate WebSite schema with search action
 */
export function generateWebSiteSchema(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Kunstmarkedsplads',
    url: baseUrl,
    description: 'Danmarks førende online markedsplads for original kunst',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
  baseUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}

/**
 * Generate ItemList schema for artwork listings
 */
export function generateArtworkListSchema(
  artworks: Artwork[],
  baseUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: artworks.map((artwork, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: artwork.title,
        image: artwork.image_url ? `${baseUrl}${artwork.image_url}` : undefined,
        url: `${baseUrl}/artwork/${artwork.id}`,
        offers: {
          '@type': 'Offer',
          price: (artwork.price_cents / 100).toFixed(2),
          priceCurrency: artwork.currency,
        },
      },
    })),
  };
}

/**
 * Generate Person schema for artist profile
 */
export function generateArtistSchema(
  artistName: string,
  artworkCount: number,
  baseUrl: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: artistName,
    jobTitle: 'Artist',
    worksFor: {
      '@type': 'Organization',
      name: 'Kunstmarkedsplads',
    },
    numberOfWorks: artworkCount,
  };
}
