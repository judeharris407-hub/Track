import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';

async function resetAdmin() {
  try {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    
    // Update or insert admin user
    const check = await query("SELECT id FROM system_users WHERE LOWER(email) = 'admin@enterprise.com';");
    if (check.rows.length > 0) {
      await query("UPDATE system_users SET password_hash = $1 WHERE LOWER(email) = 'admin@enterprise.com';", [hash]);
      console.log("Updated password for admin@enterprise.com to 'admin123'");
    } else {
      await query(
        "INSERT INTO system_users (name, email, password_hash, role) VALUES ($1, $2, $3, $4);",
        ['System Admin', 'admin@enterprise.com', hash, 'admin']
      );
      console.log("Created admin@enterprise.com with password 'admin123'");
    }
    
    // Test comparison
    const verify = await query("SELECT password_hash FROM system_users WHERE LOWER(email) = 'admin@enterprise.com';");
    const matches = await bcrypt.compare('admin123', verify.rows[0].password_hash);
    console.log("Password verification test matches:", matches);
    
    process.exit(0);
  } catch (err) {
    console.error("Reset error:", err);
    process.exit(1);
  }
}

resetAdmin();
