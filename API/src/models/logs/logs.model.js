import { DataTypes } from "sequelize";
import sequelize from "../../config/db.config.js";
import User from "../user/user.model.js";

const Logs = sequelize.define('Logs', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  login_time: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  login_ip: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  event_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  details: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});
Logs.belongsTo(User, { foreignKey: 'user_id' });
export default Logs;
