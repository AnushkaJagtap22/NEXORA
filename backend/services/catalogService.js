// JSON-LD Catalog Service for Agent-to-Agent Commerce

class CatalogService {
  constructor(catalogData) {
    this.catalog = [...catalogData];
  }

  getAllProducts() {
    return this.catalog;
  }

  getProductById(id) {
    return this.catalog.find(p => p.id === id || p.sku === id);
  }

  // Returns all products formatted as JSON-LD Data Catalog (schema.org)
  getJsonLdCatalog() {
    return {
      "@context": "https://schema.org/",
      "@type": "DataCatalog",
      "name": "Nexora Merchant AI Catalog",
      "description": "Structured JSON-LD catalog for AI Autonomous Buyers and Agent-to-Agent Commerce (NPCI UAP & ACP/x402 protocol standards).",
      "publisher": {
        "@type": "Organization",
        "name": "Nexora Direct Commerce"
      },
      "dataset": this.catalog.map(item => item.jsonLd)
    };
  }

  searchProducts(query) {
    if (!query) return this.catalog;
    const q = query.toLowerCase();
    return this.catalog.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q)
    );
  }
}

module.exports = CatalogService;
