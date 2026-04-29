import { describe, it, expect } from "vitest";
import {
  buildOrganizationJsonLd,
  buildDojoJsonLd,
  type DojoInput,
} from "../src/lib/seo";

describe("buildOrganizationJsonLd", () => {
  it("returns a valid Organization with sameAs and contact", () => {
    const ld = buildOrganizationJsonLd({
      siteUrl: "https://kendobh.com.br",
    });
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("Organization");
    expect(ld.name).toBe("KendoBH");
    expect(ld.url).toBe("https://kendobh.com.br");
    expect(ld.sameAs).toContain("https://www.instagram.com/kendobh/");
    expect(ld.sameAs).toContain("https://www.facebook.com/KendoBH");
  });
});

describe("buildDojoJsonLd", () => {
  it("returns a SportsActivityLocation with full address and geo", () => {
    const dojo: DojoInput = {
      id: "matsuoka",
      name: "Matsuoka Budokai",
      address: {
        street: "R. Barão de Leopoldina, 130",
        neighborhood: "Alto dos Pinheiros",
        city: "Belo Horizonte",
        state: "MG",
      },
      geo: { lat: -19.9, lng: -43.9 },
      schedule: [
        { day: "Quinta-feira", time: "20:00–21:30", modality: "kendo" },
      ],
    };
    const ld = buildDojoJsonLd(dojo);
    expect(ld["@type"]).toBe("SportsActivityLocation");
    expect(ld.name).toContain("Matsuoka");
    expect(ld.address["@type"]).toBe("PostalAddress");
    expect(ld.address.streetAddress).toBe("R. Barão de Leopoldina, 130");
    expect(ld.address.addressLocality).toBe("Belo Horizonte");
    expect(ld.address.addressRegion).toBe("MG");
    expect(ld.address.addressCountry).toBe("BR");
    expect(ld.geo["@type"]).toBe("GeoCoordinates");
    expect(ld.geo.latitude).toBe(-19.9);
    expect(ld.geo.longitude).toBe(-43.9);
  });
});
