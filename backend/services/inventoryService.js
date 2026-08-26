const db = require('../db/sqliteStore');

class InventoryService {
  static reserveStock(orderId, productId, quantity, expiryMinutes = 15) {
    // 1. Verify product stock
    const product = db.prepare('SELECT id, stock FROM products WHERE id = ?').get(productId);
    if (!product || product.stock < quantity) {
      return { success: false, reason: 'INSUFFICIENT_STOCK' };
    }

    // 2. Calculate expiry
    const reservationId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString();

    // 3. Insert reservation record
    db.prepare("INSERT INTO inventory_reservations (reservation_id, order_id, product_id, quantity, expires_at, status) VALUES (?, ?, ?, ?, ?, 'ACTIVE')").run(
      reservationId, orderId, productId, quantity, expiresAt
    );

    return { success: true, reservationId, expiresAt };
  }

  static commitReservation(orderId) {
    const resRow = db.prepare("SELECT reservation_id, product_id, quantity, status FROM inventory_reservations WHERE order_id = ? AND status = 'ACTIVE'").get(orderId);
    if (!resRow) {
      return { success: true, note: 'NO_ACTIVE_RESERVATION_FOUND' };
    }

    // Atomically decrement stock
    const updateResult = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?').run(resRow.quantity, resRow.product_id, resRow.quantity);
    if (updateResult.changes === 0) {
      return { success: false, reason: 'INVENTORY_COMMIT_FAILED' };
    }

    // Mark reservation committed
    db.prepare("UPDATE inventory_reservations SET status = 'COMMITTED' WHERE reservation_id = ?").run(resRow.reservation_id);
    return { success: true, committedQuantity: resRow.quantity };
  }

  static releaseReservation(orderId) {
    const stmt = db.prepare("UPDATE inventory_reservations SET status = 'RELEASED' WHERE order_id = ? AND status = 'ACTIVE'");
    stmt.run(orderId);
    return { success: true };
  }

  static expireStaleReservations() {
    const now = new Date().toISOString();
    const stmt = db.prepare("UPDATE inventory_reservations SET status = 'EXPIRED' WHERE expires_at < ? AND status = 'ACTIVE'");
    const result = stmt.run(now);
    return result.changes;
  }
}

module.exports = InventoryService;
