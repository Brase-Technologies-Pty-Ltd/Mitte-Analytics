import dotenv from "dotenv";
dotenv.config();
import Product from "../models/product/product.model.js";
import Imprest from "../models/imprest/imprest.model.js";
import messages from "../helpers/messages.js";
import Purchase from "../models/purchase/purchase.model.js";
import ImprestProduct from "../models/imprest_product/imprest.product.model.js";
import Email from "../models/email/email.model.js";
import nodemailer from "nodemailer";
import ShortUniqueId from "short-unique-id";
import fs from "fs";
import path from "path";

// Function to send email
const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};

// Function to save POs to a TXT file
const savePOsToTXT = async (initiatedPOs, index) => {
  const txtFilePath = path.resolve(__dirname, "./purchase_orders/");

  // Ensure the folder exists
  try {
    await fs.promises.mkdir(txtFilePath, { recursive: true });
  } catch (err) {
    console.error("Error creating directory:", err);
    return;
  }

  initiatedPOs?.map(async (po, idx) => {
    let priority = 1;
    let txtContent = `App Name:Titrate\nPriority:${priority}\n`;

    const currentDate = new Date();
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const localDate = currentDate
      .toLocaleString("en-US", options)
      .replace(/\//g, "-")
      .replace(/,/g, "_")
      .replace(/ /g, "_")
      .replace(/:/g, "-");

    txtContent += `DateTime:${localDate}\nImprest ID: ${po.imprestId}\nImprest Name: ${po.imprestName}\nProduct ID: ${po.productId}\nProduct Name: ${po.productName}\nPurchase Order: ${po.purchaseOrderId}\nQuantity Requested:${po.quantityRequested}`;

    const txtFileName = `po_${idx}_index_${po.purchaseOrderId}_${localDate}.txt`;

    try {
      await fs.promises.writeFile(
        path.join(txtFilePath, txtFileName),
        txtContent
      );
      await Purchase.update(
        { txtfilename: txtFileName },
        {
          where: { purchaseOrderId: po.purchaseOrderId },
        }
      );
    } catch (err) {
      console.error(`Error saving PO ${po.purchaseOrderId} to TXT:`, err);
    }
  });
};

// Function to initiate product purchase
const initiateProductPurchase = async (req, res) => {
  try {
    const bodyReq = req.body.data;
    const initiatedPOs = [];

    for (let i = 0; i < bodyReq?.length; i++) {
      const imprest = await ImprestProduct.findOne({
        where: {
          imprest_id: bodyReq[i]?.imprest_id,
          product_id: bodyReq[i]?.product_id,
        },
        include: [
          {
            model: Product,
          },
          {
            model: Imprest,
          },
        ],
      });

      // Check if imprest exists and update purchaseEventTriggered to true
      if (imprest && imprest?.purchaseEventTriggered !== true) {
        await ImprestProduct.update(
          { purchaseEventTriggered: true },
          {
            where: {
              imprest_id: bodyReq[i]?.imprest_id,
              product_id: bodyReq[i]?.product_id,
            },
          }
        );
      }

      const uid = new ShortUniqueId();
      const uidWithTimestamp = uid.stamp(10);

      const stockDetails = `Purchase Order ID: ${uidWithTimestamp}\nProduct: ${imprest?.Product?.description}\nimprest: ${imprest?.imprest?.name}\nAvailable Stock: ${imprest?.available_stock}\nMax Stock: ${imprest?.max_stock}\nMin Stock: ${imprest?.min_stock}`;

      initiatedPOs.push({
        imprestId: bodyReq[i]?.imprest_id,
        productId: bodyReq[i]?.product_id,
        productName: imprest?.Product?.description,
        imprestName: imprest?.imprest?.name,
        stockDetails,
        quantityRequested: imprest?.max_stock,
        purchaseOrderId: uidWithTimestamp,
      });

      // Create initiation email message
      // const initiationEmailMessage = `Purchase event triggered for Imprest: ${imprest?.imprest?.name} and Product: ${imprest?.Product?.description} with Purchase Order ID: ${uidWithTimestamp}`;
      // await Email.create({ message: initiationEmailMessage, notificationType: "Purchase Order Triggered", emailtype: true, alertMode: 1 });

      // if (imprest && imprest?.purchaseEventTriggered !== true) {
      //   const obj = { ...bodyReq[i], initiated: true, received: false, purchaseOrderId: uidWithTimestamp, shipped: false, delivered: false };
      //   await Purchase.create(obj);

      //   const successEmailMessage = `Purchase has been initiated for Imprest: ${imprest?.imprest?.name} and Product: ${imprest?.Product?.description} with Purchase Order ID: ${uidWithTimestamp}`;
      //   await Email.create({ message: successEmailMessage, emailtype: true, notificationType: "Purchase Order Initiated", alertMode: 1 });

      // } else {
      //   const failureEmailMessage = `Purchase failed for Imprest: ${imprest?.imprest?.name} and Product: ${imprest?.Product?.description} with Purchase Order ID: ${uidWithTimestamp}`;
      //   await Email.create({ message: failureEmailMessage, emailtype: false, notificationType: "Purchase Order Failed", alertMode: 1 });
      // }
    }

    // Save PO to TXT immediately after initiating
    await savePOsToTXT(initiatedPOs);

    if (initiatedPOs.length > 0) {
      const customerEmail = process.env.CUSTOMER_EMAIL;
      const customerEmailSubject = "Purchase Orders Initiated";
      const customerEmailMessage = `Dear Customer,\n\nThe following Purchase Order(s) have been initiated:\n\n${initiatedPOs
        .map(
          (po) =>
            `PO for imprest_id: ${po.imprestId} and product_id: ${po.productId}\n${po.stockDetails}\n\n`
        )
        .join("")}`;
      await sendEmail(
        customerEmail,
        customerEmailSubject,
        customerEmailMessage
      );
      const purchaseData = await Purchase.findAll({
        include: [
          {
            model: Product,
          },
          {
            model: Imprest,
          },
        ],
      });
      res.status(200).json(purchaseData);
    } else {
      const purchaseData = await Purchase.findAll({
        include: [
          {
            model: Product,
          },
          {
            model: Imprest,
          },
        ],
      });
      res.status(200).json({
        status: false,
        messages: messages.PurchaseProductMessage.CREATE_ERROR_MESSAGE,
        data: purchaseData,
      });
    }
  } catch (error) {
    res
      .status(400)
      .json({ error: messages.PurchaseProductMessage.CREATE_ERROR_MESSAGE });
  }
};

// Function to receive product purchase
const receiveProductPurchase = async (req, res) => {
  try {
    const { purchaseId } = req.body;
    const purchase = await Purchase.findOne({
      where: {
        purchaseOrderId: purchaseId,
      },
    });
    const imprest = await ImprestProduct.findOne({
      where: {
        imprest_id: purchase?.imprest_id,
        product_id: purchase?.product_id,
      },
      include: [
        {
          model: Product,
        },
        {
          model: Imprest,
        },
      ],
    });
    const successEmailMessage = `Accepting Purchase has been triggered for Imprest: ${imprest?.imprest?.name} and Product: ${imprest?.Product?.description} with Purchase Order ID: ${purchaseId}`;
    await Email.create({
      message: successEmailMessage,
      notificationType: "Accepting Purchase Order Triggered",
      emailtype: true,
      alertMode: 1,
    });
    if (
      imprest &&
      purchase?.initiated === true &&
      purchase?.shipped === false &&
      purchase?.delivered === false
    ) {
      await purchase.update({ received: true });
      const successEmailMessage = `Purchase acceptance successful for Imprest: ${imprest?.imprest?.name} and Product: ${imprest?.Product?.description} with Purchase Order ID: ${purchaseId}`;
      await Email.create({
        message: successEmailMessage,
        notificationType: "Purchase Order Accepted",
        emailtype: true,
        alertMode: 1,
      });
      const purchaseData = await Purchase.findAll();
      res.status(200).json(purchaseData);
    } else {
      const failureEmailMessage = `Purchase acceptance failed for Purchase Order ID: ${purchaseId}`;
      await Email.create({
        message: failureEmailMessage,
        notificationType: "Purchase Order Acceptance Failed",
        emailtype: false,
        alertMode: 1,
      });
      const purchaseData = await Purchase.findAll();
      res.status(200).json({
        status: false,
        message: failureEmailMessage,
        data: purchaseData,
      });
    }
  } catch (error) {
    res
      .status(400)
      .json({ error: messages.PurchaseProductMessage.CREATE_ERROR_MESSAGE });
  }
};

// Function to ship product purchase
const shipProductPurchase = async (req, res) => {
  try {
    const { purchaseId } = req.body;
    const purchase = await Purchase.findOne({
      where: {
        purchaseOrderId: purchaseId,
      },
    });
    const imprest = await ImprestProduct.findOne({
      where: {
        imprest_id: purchase?.imprest_id,
        product_id: purchase?.product_id,
      },
      include: [
        {
          model: Product,
        },
        {
          model: Imprest,
        },
      ],
    });
    const successEmailMessage = `Shipping Purchase has been triggered for Imprest: ${imprest?.imprest?.name} and Product: ${imprest?.Product?.description} with Purchase Order ID: ${purchaseId}`;
    await Email.create({
      message: successEmailMessage,
      notificationType: "Shipping Purchase Order Triggered",
      emailtype: true,
      alertMode: 1,
    });
    if (
      imprest &&
      purchase?.initiated === true &&
      purchase?.received === true &&
      purchase?.delivered === false
    ) {
      await purchase.update({ shipped: true });
      const successEmailMessage = `Purchase shipment successful for Imprest: ${imprest?.imprest?.name} and Product: ${imprest?.Product?.description} with Purchase Order ID: ${purchaseId}`;
      await Email.create({
        message: successEmailMessage,
        notificationType: "Purchase Order Shipped",
        emailtype: true,
        alertMode: 1,
      });
      const purchaseData = await Purchase.findAll();
      res.status(200).json(purchaseData);
    } else {
      const failureEmailMessage = `Purchase shipment failed for Purchase Order ID: ${purchaseId}`;
      await Email.create({
        message: failureEmailMessage,
        notificationType: "Purchase Order shipment Failed",
        emailtype: false,
        alertMode: 1,
      });
      const purchaseData = await Purchase.findAll();
      res.status(200).json({
        status: false,
        message: failureEmailMessage,
        data: purchaseData,
      });
    }
  } catch (error) {
    res
      .status(400)
      .json({ error: messages.PurchaseProductMessage.CREATE_ERROR_MESSAGE });
  }
};

// Function to deliver product purchase
const deliverProductPurchase = async (req, res) => {
  try {
    const { purchaseId } = req.body;
    const purchase = await Purchase.findOne({
      where: {
        purchaseOrderId: purchaseId,
      },
    });
    const imprest = await ImprestProduct.findOne({
      where: {
        imprest_id: purchase?.imprest_id,
        product_id: purchase?.product_id,
      },
      include: [
        {
          model: Product,
        },
        {
          model: Imprest,
        },
      ],
    });
    const successEmailMessage = `Delivering Purchase has been triggered for Imprest: ${imprest?.imprest?.name} and Product: ${imprest?.Product?.description} with Purchase Order ID: ${purchaseId}`;
    await Email.create({
      message: successEmailMessage,
      notificationType: "Delivering Purchase Order Triggered",
      emailtype: true,
      alertMode: 1,
    });
    if (
      imprest &&
      purchase?.initiated === true &&
      purchase?.received === true &&
      purchase?.shipped === true
    ) {
      // purchase event false
      const { id } = imprest;
      const findData = await ImprestProduct.findByPk(id);
      const dataSet = {
        available_stock: imprest?.max_stock - imprest?.available_stock,
        purchaseEventTriggered: false,
      };
      await findData.update(dataSet);
      await purchase.update({ delivered: true });
      const successEmailMessage = `Purchase Delivered successful for Imprest: ${imprest?.imprest?.name} and Product: ${imprest?.Product?.description} with Purchase Order ID: ${purchaseId}`;
      await Email.create({
        message: successEmailMessage,
        notificationType: "Purchase Order Delivered",
        emailtype: true,
        alertMode: 1,
      });
      const purchaseData = await Purchase.findAll();
      res.status(200).json(purchaseData);
    } else {
      const failureEmailMessage = `Purchase delivery failed for Purchase Order ID: ${purchaseId}`;
      await Email.create({
        message: failureEmailMessage,
        notificationType: "Purchase Order Delivery Failed",
        emailtype: false,
        alertMode: 1,
      });
      const purchaseData = await Purchase.findAll();
      res.status(200).json({
        status: false,
        messages: failureEmailMessage,
        data: purchaseData,
      });
    }
  } catch (error) {
    res
      .status(400)
      .json({ error: messages.PurchaseProductMessage.CREATE_ERROR_MESSAGE });
  }
};

// Function to fetch product purchase
const fetchProductPurchase = async (req, res) => {
  try {
    const purchaseData = await Purchase.findAll({
      include: [
        {
          model: Product,
        },
        {
          model: Imprest,
        },
      ],
    });
    res.status(200).json(purchaseData);
  } catch (error) {
    res
      .status(400)
      .json({ error: messages.PurchaseProductMessage.CREATE_ERROR_MESSAGE });
  }
};

const folderPath = process.env.PO_FOLDER;

const getAllPoFiles = async (req, res) => {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Unable to read folder" });
    }

    const textFiles = files.filter((file) => file.endsWith(".txt"));

    if (textFiles.length === 0) {
      return res
        .status(404)
        .json({ message: "No text files found in the folder" });
    }

    const fileContents = [];
    textFiles.forEach((file) => {
      const filePath = path.join(folderPath, file);
      const content = fs.readFileSync(filePath, "utf-8");
      fileContents.push({ filename: file, content });
    });

    res.json(fileContents);
  });
};

const getOnePoFile = async (req, res) => {
  try {
    const { fileName } = req.params;

    const filePath = path.join(
      folderPath,
      fileName.endsWith(".txt") ? fileName : `${fileName}.txt`
    );
    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ message: `No text file found with name: ${fileName}` });
    }

    const content = fs.readFileSync(filePath, "utf-8");

    res.set({
      "Content-Type": "text/plain",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    });

    res.send(content);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default {
  initiateProductPurchase,
  receiveProductPurchase,
  shipProductPurchase,
  deliverProductPurchase,
  fetchProductPurchase,
  getAllPoFiles,
  getOnePoFile,
};
