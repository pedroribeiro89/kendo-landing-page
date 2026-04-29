// src/lib/seo.ts

export interface DojoInput {
  id: string;
  name: string;
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  geo: { lat: number; lng: number };
  schedule: { day: string; time: string; modality: "kendo" | "iaido" }[];
}

export function buildOrganizationJsonLd({ siteUrl }: { siteUrl: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "KendoBH",
    alternateName: "KendoBH — Kendo e Iaido em Belo Horizonte",
    url: siteUrl,
    logo: `${siteUrl}/og-image.jpg`,
    sameAs: [
      "https://www.instagram.com/kendobh/",
      "https://www.facebook.com/KendoBH",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "kendobeaga@gmail.com",
      contactType: "customer service",
      areaServed: "BR",
      availableLanguage: ["Portuguese"],
    },
  };
}

export function buildDojoJsonLd(dojo: DojoInput) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "@id": `#dojo-${dojo.id}`,
    name: `KendoBH — ${dojo.name}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: dojo.address.street,
      addressLocality: dojo.address.city,
      addressRegion: dojo.address.state,
      addressCountry: "BR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: dojo.geo.lat,
      longitude: dojo.geo.lng,
    },
    sport: ["Kendo", "Iaido"],
    openingHoursSpecification: dojo.schedule.map((s) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: portugueseDayToEnglish(s.day),
      opens: s.time.split("–")[0],
      closes: s.time.split("–")[1],
    })),
  };
}

function portugueseDayToEnglish(day: string): string {
  const map: Record<string, string> = {
    "Segunda-feira": "Monday",
    "Terça-feira": "Tuesday",
    "Quarta-feira": "Wednesday",
    "Quinta-feira": "Thursday",
    "Sexta-feira": "Friday",
    Sábado: "Saturday",
    Domingo: "Sunday",
  };
  return map[day] ?? day;
}
