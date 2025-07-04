import sequelize from "../../src/config/db.config.js";
import { createDefaultAdmin } from "../utils/createDefaultAdmin.js";

async function Sync() {
  try {
    await sequelize.sync({ force: false });

    // Seed default admin
    await createDefaultAdmin();
  } catch (error) {
    console.error("❌ Error syncing database:", error.message);
  }
}

export default Sync;
