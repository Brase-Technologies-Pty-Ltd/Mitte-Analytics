import UserCredential from "../models/user/credential.model.js";
import User from "../models/user/user.model.js";
import OTP from "../models/user/otp.model.js";
import { isValidPassword } from "../validations/validation.js";
import jwt from "jsonwebtoken";
import { isUserExisted } from "../validations/validation.js";
import UserRole from "../models/user/user.role.model.js";
import Role from "../models/user/role.model.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();
import mailService from "../services/mailService.js";

const SECRET_KEY = "MySecret@123";

const Login = async (req, res) => {
  try {
    const { user_name, password } = req.body;
    const user = await User.findOne({
      where: { user_name },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!user.active) {
      return res
        .status(403)
        .json({ error: "User is inactive. Please contact support." });
    }

    const userCredential = await UserCredential.findOne({
      where: { user_id: user.id },
    });
    const isValid = await bcrypt.compare(password, userCredential.password);

    if (!isValid) {
      return res.status(404).json({ error: "Invalid user name or password!" });
    }

    const userRoles = await UserRole.findAll({
      where: { user_id: user.id },
      include: Role,
    });
    if (!userRoles || userRoles.length === 0) {
      return res
        .status(403)
        .json({ error: "No roles assigned. Please contact administrator." });
    }
    const roleIds = userRoles.map((userRole) => userRole.role_id);
    const roledata = await Role.findAll({ where: { id: roleIds } });
    const roleNames = roledata.map((role) => role.dataValues);

    const tokenData = {
      time: Date(),
      userdata: user,
      roles: roleNames,
      hospital: user.hospital,
    };

    const token = jwt.sign(tokenData, SECRET_KEY, { expiresIn: "1h" });

    res.status(200).header("auth-token", token).send(token);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const Register = async (req, res) => {
  try {
    const user = req.body;
    if (!isValidPassword(user.password)) {
      return res.status(400).json({
        error:
          "Invalid password format. Password must contain at least one uppercase letter, one special character, and one digit.",
      });
    }
    let hasUser = await isUserExisted(user);

    if (hasUser) {
      return res.status(409).json({ error: "Username already in use" });
    }
    const newUser = await User.create(user);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    const userCredential = await UserCredential.create({
      user_id: newUser.id,
      password: hashedPassword,
      hash_key: salt,
      last_login_date: "",
      created_by: 1,
      updated_by: 1,
      hospital_id: user.hospital_id,
      locked: false,
    });

    res.status(201).json({ message: "User registered", result: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const userData = async (req, res) => {
  const token = req.header("auth_header");
  try {
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        res.status(401).send("token expired");
      } else {
        res.status(200).json({ user: decoded });
      }
    });
  } catch (error) {
    res.status(500).json({ status: "error", data: "Internal Server Error" });
  }
};

// @@@@@@@@------- Forgot Password ---------@@@@@@@@@@@

const ForgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Enter a valid Email Address" });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({ message: "This email address is not registered" });
    }

    const userCredential = await UserCredential.findOne({
      where: { user_id: user.id },
    });

    if (!userCredential) {
      return res.status(404).json({ message: "User credentials not found" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    await OTP.create({
      code: otp,
      user_id: user.id,
      purpose: "forgot-password",
    });

    await mailService.sendMail({
      to: user.email,
      subject: "Password Reset Request",
      template: "passwordReset",
      context: {
        first_name: user.first_name,
        last_name: user.last_name,
        otp: otp,
        year: new Date().getFullYear(),
      },
    });

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("ForgotPassword error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const OTPValidation = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Enter a valid Email and OTP" });
    }

    const currentTime = new Date().getTime();
    const otpRecord = await OTP.findOne({
      where: { code: otp, purpose: "forgot-password" },
      include: [{ model: User, as: "User", attributes: ["email"] }],
    });

    if (!otpRecord || !otpRecord.User) {
      return res.status(400).json({
        message:
          "The OTP is either invalid or expired, kindly retry the OTP again",
      });
    }

    const storedEmail = otpRecord.User.email;

    if (email !== storedEmail) {
      return res.status(400).json({ message: "Enter a valid Email and OTP" });
    }

    const expirationTime = otpRecord.createdAt.getTime() + 5 * 60 * 1000;

    if (currentTime > expirationTime) {
      await OTP.destroy({
        where: { id: otpRecord.id },
      });
      return res.status(400).json({
        message:
          "The OTP is either invalid or expired, kindly retry the OTP again.",
      });
    }

    res.status(200).json({
      message: "OTP validation successful",
      userId: otpRecord.user_id,
      status: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const ChangePassword = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  try {
    if (!email || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Email, password, and confirmPassword are required" });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least one uppercase letter and one special character and one digit",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({
      where: { email: email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userCredentials = await UserCredential.findOne({
      where: { user_id: user.id },
    });

    if (!userCredentials) {
      return res.status(404).json({ message: "User credentials not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    userCredentials.password = hashedPassword;
    await userCredentials.save();

    await mailService.sendMail({
      to: user.email,
      subject: "Password Reset Successful",
      template: "passwordResetSuccess",
      context: {
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  Register,
  Login,
  userData,
  ForgotPassword,
  ChangePassword,
  OTPValidation,
};
