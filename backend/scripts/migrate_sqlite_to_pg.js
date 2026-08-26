const fs = require('fs');
const path = require('path');
const db = require('../db/sqliteStore');

function exportSQLiteToPostgreSQL() {
  console.log("==================================================");
  console.log("NEXORA SQLITE TO POSTGRESQL MIGRATION EXPORTER");
  console.log("==================================================\n");

  const tables = [
    'users', 'products', 'orders', 'payments', 'campaigns', 
    'customers', 'auth_tokens', 'inventory_reservations', 
    'webhook_events', 'refunds', 'negotiations', 'audit_events'
  ];

  let pgSQL = `-- Nexora PostgreSQL Migration Script\n-- Generated on ${new Date().toISOString()}\n\n`;

  for (const table of tables) {
    try {
      const rows = db.prepare(`SELECT * FROM ${table}`).all();
      pgSQL += `-- Table: ${table} (${rows.length} records)\n`;

      if (rows.length > 0) {
        const columns = Object.keys(rows[0]).map(c => `"${c}"`).join(', ');
        for (const row of rows) {
          const values = Object.values(row).map(v => {
            if (v === null || v === undefined) return 'NULL';
            if (typeof v === 'number') return v;
            if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
            return `'${String(v).replace(/'/g, "''")}'`;
          }).join(', ');

          pgSQL += `INSERT INTO "${table}" (${columns}) VALUES (${values}) ON CONFLICT DO NOTHING;\n`;
        }
      }
      pgSQL += '\n';
    } catch (err) {
      console.warn(`[Migrate] Skipping table ${table}: ${err.message}`);
    }
  }

  const exportPath = path.join(__dirname, '..', 'data', 'postgresql_dump.sql');
  fs.writeFileSync(exportPath, pgSQL);

  console.log(`[SUCCESS] PostgreSQL migration script exported cleanly to: ${exportPath}`);
}

exportSQLiteToPostgreSQL();
