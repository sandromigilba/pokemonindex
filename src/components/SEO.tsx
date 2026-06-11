import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  schemaData?: object;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  image = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
  url = window.location.href,
  type = 'website',
  schemaData,
}) => {
  const siteName = 'Pokémon Universe';
  const fullTitle = `${title} | ${siteName}`;

  // Default Structured Data if none provided
  const defaultSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': siteName,
    'url': window.location.origin,
    'description': 'A premium portal for modern Pokémon explorers, powered by PokéAPI & Pokémon TCG API.',
  };

  const activeSchema = schemaData || defaultSchema;

  return (
    <Helmet>
      {/* Basic Title & Description */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      {/* Open Graph Tags */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(activeSchema)}
      </script>
    </Helmet>
  );
};
export default SEO;
