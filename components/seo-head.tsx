'use client';

import Head from 'next/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  product?: {
    name: string;
    price: number;
    currency: string;
    availability: string;
    brand: string;
    category: string;
  };
}

export default function SEOHead({
  title = 'ReeseBlanks - Premium Streetwear & Fashion',
  description = 'Discover exclusive streetwear collections, limited drops, and premium fashion at ReeseBlanks. Join our VIP community for early access.',
  image = '/og-image.jpg',
  url = 'https://reeseblank.com',
  type = 'website',
  product
}: SEOHeadProps) {
  const fullTitle = title.includes('ReeseBlanks') ? title : `${title} | ReeseBlanks`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="ReeseBlanks" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Product Schema (if product page) */}
      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": product.name,
              "brand": {
                "@type": "Brand",
                "name": product.brand
              },
              "category": product.category,
              "offers": {
                "@type": "Offer",
                "price": product.price,
                "priceCurrency": product.currency,
                "availability": `https://schema.org/${product.availability}`,
                "seller": {
                  "@type": "Organization",
                  "name": "ReeseBlanks"
                }
              }
            })
          }}
        />
      )}

      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "ReeseBlanks",
            "url": "https://reeseblank.com",
            "logo": "https://reeseblank.com/logo.png",
            "sameAs": [
              "https://instagram.com/reeseblank",
              "https://twitter.com/reeseblank"
            ]
          })
        }}
      />
    </Head>
  );
}