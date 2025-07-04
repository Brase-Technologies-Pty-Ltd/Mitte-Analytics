import ImprestProduct from "../models/imprest_product/imprest.product.model.js";
import Product from "../models/product/product.model.js";
import Imprest from "../models/imprest/imprest.model.js";
import Purchase from "../models/purchase/purchase.model.js";
import UserRole from "../models/user/user.role.model.js";
import Cameras from "../models/camera/camera.model.js";
import messages from "../helpers/messages.js";
import fs from "fs";
import path from "path";

const getImprestProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRoles = await UserRole.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Imprest,
        },
      ],
    });
    const imprestProducts = await ImprestProduct.findAll({
      where: { imprest_id: userRoles.map((userRole) => userRole.imprest_id) },
      include: [
        {
          model: Product,
        },
        {
          model: Imprest,
          include: [
            {
              model: Cameras,
            },
          ],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    res.status(200).json(imprestProducts);
  } catch (error) {
    res.status(500).json({ message: messages.ServerMessage.ERROR_MESSAGE });
  }
};

const fetchImprestProducts = async (req, res) => {
  try {
    const cameras = await Cameras.findAll();
    const imprestProducts = await ImprestProduct.findAll({
      include: [
        {
          model: Product,
        },
        {
          model: Imprest,
        },
      ],
    });

    const imprestData = {};
    imprestProducts.forEach(({ imprest, Product, id, ...rest }) => {
      if (imprest && id) {
        if (!imprestData[id]) {
          imprestData[id] = {
            ...rest?.dataValues,
            imprest: { ...imprest.dataValues },
            Product: { ...Product?.dataValues },
            cameras: null,
          };
        }
        if (!imprestData[id].cameras) {
          imprestData[id].cameras = cameras?.filter((val) =>
            imprest.cameras?.split(",")?.includes(val?.camera_name)
          );
        }
      }
    });

    const imprestDataRes = Object.values(imprestData);
    res.status(200).json(imprestDataRes);
  } catch (error) {
    res.status(500).json({ message: messages.ServerMessage.ERROR_MESSAGE });
  }
};

const createImprestProduct = async (req, res) => {
  try {
    const imprestProductData = req.body;
    const imprestId = imprestProductData.imprest_id;
    const productId = imprestProductData.product_id;

    const existingImprestProduct = await ImprestProduct.findOne({
      where: {
        imprest_id: imprestId,
        product_id: productId,
      },
    });

    if (existingImprestProduct) {
      return res.status(400).json({
        error:
          "Duplicate entry. This product is already associated with the specified imprest.",
      });
    }

    const imprestProduct = await ImprestProduct.create(imprestProductData);
    res.status(201).json(imprestProduct);
  } catch (error) {
    // Handle other errors
    res
      .status(400)
      .json({ error: messages.ImprestProductMessage.CREATE_ERROR_MESSAGE });
  }
};

const updateImprestProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    let dbImprestProduct = await ImprestProduct.findByPk(id, {
      include: [
        {
          model: Product,
          attributes: ["description"],
        },
        {
          model: Imprest,
          attributes: ["name"],
        },
      ],
    });

    if (!dbImprestProduct) {
      return res.status(404).json({ error: "ImprestProduct not found." });
    }

    dbImprestProduct = await dbImprestProduct.update(updatedData);

    if (
      dbImprestProduct.available_stock < dbImprestProduct.min_stock &&
      !dbImprestProduct.purchaseEventTriggered
    ) {
      const purchaseOrderId = `PO-${Date.now()}-${dbImprestProduct.id}`;
      const txtFileName = `${purchaseOrderId}.txt`;
      const txtFilePath = path.join("purchase_orders", txtFileName);

      fs.mkdirSync("purchase_orders", { recursive: true });

      const content = `
      Purchase Order ID: ${purchaseOrderId}
      Imprest Name: ${dbImprestProduct.imprest?.name}
      Product Name: ${dbImprestProduct.Product?.description}
      Available Stock: ${dbImprestProduct.available_stock}
      Minimum Stock: ${dbImprestProduct.min_stock}
      Date: ${new Date().toLocaleString()}
      `.trim();

      fs.writeFileSync(txtFilePath, content);

      // 3. Create purchase
      await Purchase.create({
        initiated: true,
        received: false,
        shipped: false,
        delivered: false,
        purchaseOrderId,
        product_id: dbImprestProduct.product_id,
        imprest_id: dbImprestProduct.imprest_id,
        hospital_id: null,
        txtfilename: txtFileName,
      });

      // 4. Update flag
      await dbImprestProduct.update({ purchaseEventTriggered: true });
    }

    res.status(200).json(dbImprestProduct);
  } catch (error) {
    console.error("Update error:", error);
    res
      .status(400)
      .json({ error: messages.ImprestProductMessage.UPDATE_ERROR_MESSAGE });
  }
};

const restockImprestProducts = async (req, res) => {
  try {
    const imprestProducts = await ImprestProduct.findAll({
      include: [{ model: Product }, { model: Imprest }],
    });

    const allPurchases = await Purchase.findAll();
    const updatedPurchaseOrders = [];

    for (const imprestData of imprestProducts) {
      const dbImprestProduct = await ImprestProduct.findByPk(imprestData.id);
      await dbImprestProduct.update({
        available_stock: imprestData.max_stock + 1,
        purchaseEventTriggered: false,
      });

      const existingPurchase = allPurchases.find(
        (p) =>
          Number(p.imprest_id) === Number(imprestData.imprest?.id) &&
          Number(p.product_id) === Number(imprestData.Product?.id)
      );

      if (existingPurchase) {
        await existingPurchase.update({
          initiated: false,
          shipped: false,
          received: false,
          delivered: true,
        });
      }
    }

    res.status(200).json({
      message: "All ImprestProducts restocked. Matching purchases updated.",
      updatedPurchaseOrders,
    });
  } catch (error) {
    console.error("Restocking error:", error);
    res
      .status(400)
      .json({ error: messages.ImprestProductMessage.UPDATE_ERROR_MESSAGE });
  }
};
const getImprestProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const imprestProduct = await ImprestProduct.findByPk(id, {
      include: [{ model: Imprest }, { model: Product }],
    });

    if (!imprestProduct) {
      return res
        .status(404)
        .json({ error: messages.ImprestProductMessage.ID_NOTFOUND_MESSAGE });
    }

    res.status(200).json(imprestProduct);
  } catch (error) {
    res.status(500).json({ error: messages.ServerMessage.ERROR_MESSAGE });
  }
};

const deleteImprestProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const imprestProduct = await ImprestProduct.findByPk(id);

    if (!imprestProduct) {
      return res
        .status(404)
        .json({ error: messages.ImprestProductMessage.ID_NOTFOUND_MESSAGE });
    }

    const deletedImprestProduct = imprestProduct.toJSON();

    await imprestProduct.destroy();

    res.status(200).json({
      message: messages.ImprestProductMessage.UPDATE_SUCCESS_MESSAGE,
      deletedImprestProduct,
    });
  } catch (error) {
    res
      .status(400)
      .json({ error: messages.ImprestProductMessage.DELETE_ERROR_MESSAGE });
  }
};

export default {
  getImprestProducts,
  fetchImprestProducts,
  restockImprestProducts,
  createImprestProduct,
  updateImprestProduct,
  getImprestProductById,
  deleteImprestProduct,
};
