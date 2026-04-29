module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:4321/"],
      startServerCommand: "pnpm preview",
      startServerReadyPattern: "Local",
      numberOfRuns: 3,
      settings: {
        preset: "desktop",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.95 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.95 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 1800 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.05 }],
        "total-blocking-time": ["error", { maxNumericValue: 200 }],
      },
    },
    upload: { target: "temporary-public-storage" },
  },
};
