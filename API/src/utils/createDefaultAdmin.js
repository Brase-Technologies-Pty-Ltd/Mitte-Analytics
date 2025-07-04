import bcrypt from "bcrypt";
import sequelize from "../config/db.config.js";
import User from "../models/user/user.model.js";
import Role from "../models/user/role.model.js";
import UserCredentials from "../models/user/credential.model.js";
import UserRole from "../models/user/user.role.model.js";

export async function createDefaultAdmin() {
  const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@admin.com";
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || "Admin123";

  const transaction = await sequelize.transaction();
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: defaultEmail } });

    if (existingUser) {
      await transaction.rollback();
      return;
    }

    // Step 1: Create User
    const user = await User.create({
      user_name: "admin",
      first_name: "Admin",
      last_name: "User",
      middle_name: null,
      phone_number: "9999999999",
      email: defaultEmail,
      active: true,
      created_by: 0,
    }, { transaction });

    // Step 2: Create UserCredentials
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    await UserCredentials.create({
      password: hashedPassword,
      user_id: user.id,
      hash_key: "static-admin-key",
      locked: false,
      active: true,
      created_by: 0,
    }, { transaction });

    // Step 3: Create or find Admin Role
    let role = await Role.findOne({ where: { name: "Admin" } });
    if (!role) {
      role = await Role.create({
        name: "Admin",
        description: "System Administrator",
        active: true,
        created_by: 0,
      }, { transaction });
    }

    // Step 4: Assign Role via UserRole
    await UserRole.create({
      user_id: user.id,
      role_id: role.id,
      active: true,
      created_by: 0,
    }, { transaction });

    await transaction.commit();
    console.log("✅ Default admin user created successfully.");
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Failed to create default admin:", error.message);
  }
}
