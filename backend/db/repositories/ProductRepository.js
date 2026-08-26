const db = require('../sqliteStore');

class ProductRepository {
  static getAll({ search, category, merchantId, status = 'ACTIVE', limit = 100, offset = 0 } = {}) {
    let sql = 'SELECT id, merchant_id as merchantId, name, price, stock, category, sku, image, description, agent_readiness as agentReadiness, status, json_ld as jsonLd, created_at as createdAt FROM products WHERE 1=1';
    const params = [];

    if (status && status !== 'ALL') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (merchantId) {
      sql += ' AND merchant_id = ?';
      params.push(merchantId);
    }

    if (search) {
      sql += ' AND (LOWER(name) LIKE ? OR LOWER(sku) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ?)';
      const term = `%${search.toLowerCase()}%`;
      params.push(term, term, term, term);
    }

    if (category && category !== 'ALL') {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY id ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = db.prepare(sql).all(...params);
    return rows.map(r => {
      let jsonLd = {};
      try { jsonLd = JSON.parse(r.jsonLd); } catch (e) {}
      return { ...r, jsonLd };
    });
  }

  static getById(id, merchantId = null) {
    let sql = 'SELECT id, merchant_id as merchantId, name, price, stock, category, sku, image, description, agent_readiness as agentReadiness, status, json_ld as jsonLd, created_at as createdAt FROM products WHERE id = ?';
    const params = [id];

    if (merchantId) {
      sql += ' AND merchant_id = ?';
      params.push(merchantId);
    }

    const row = db.prepare(sql).get(...params);
    if (!row) return null;

    let jsonLd = {};
    try { jsonLd = JSON.parse(row.jsonLd); } catch (e) {}
    return { ...row, jsonLd };
  }

  static create({ id, merchantId = 'merch_001', name, price, stock = 25, category = 'Accessories', sku, image, description, agentReadiness = 95, status = 'ACTIVE', jsonLd = {} }) {
    const createdAt = new Date().toISOString();
    const jsonLdStr = typeof jsonLd === 'object' ? JSON.stringify(jsonLd) : (jsonLd || '{}');

    const stmt = db.prepare(
      'INSERT INTO products (id, merchant_id, name, price, stock, category, sku, image, description, agent_readiness, status, json_ld, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    stmt.run(id, merchantId, name, price, stock, category, sku, image, description, agentReadiness, status, jsonLdStr, createdAt);

    return this.getById(id);
  }

  static update(id, { name, price, stock, category, description, status }, merchantId = null) {
    const existing = this.getById(id, merchantId);
    if (!existing) return null;

    const updatedName = name !== undefined ? name : existing.name;
    const updatedPrice = price !== undefined ? price : existing.price;
    const updatedStock = stock !== undefined ? stock : existing.stock;
    const updatedCategory = category !== undefined ? category : existing.category;
    const updatedDesc = description !== undefined ? description : existing.description;
    const updatedStatus = status !== undefined ? status : existing.status;

    let sql = 'UPDATE products SET name = ?, price = ?, stock = ?, category = ?, description = ?, status = ? WHERE id = ?';
    const params = [updatedName, updatedPrice, updatedStock, updatedCategory, updatedDesc, updatedStatus, id];

    if (merchantId) {
      sql += ' AND merchant_id = ?';
      params.push(merchantId);
    }

    db.prepare(sql).run(...params);
    return this.getById(id);
  }

  static updateStatus(id, status, merchantId = null) {
    let sql = 'UPDATE products SET status = ? WHERE id = ?';
    const params = [status, id];

    if (merchantId) {
      sql += ' AND merchant_id = ?';
      params.push(merchantId);
    }

    db.prepare(sql).run(...params);
    return true;
  }

  static decrementStock(id, quantity = 1) {
    const stmt = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?');
    const result = stmt.run(quantity, id, quantity);
    return result.changes > 0;
  }
}

module.exports = ProductRepository;
