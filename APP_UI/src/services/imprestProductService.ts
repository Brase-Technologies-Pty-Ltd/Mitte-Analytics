import axiosInstance from "../middlewares/axiosInstance";
import { ImprestProduct } from "../models/imprestProduct.model";

export const getImprestProduct = async () => {
  const response = await axiosInstance.get(`/imprestproduct`);
  if (response.status === 200) {
    return response.data;
  }
};

export const restockImprestProducts = async () => {
  const response = await axiosInstance.get(`/imprestproduct/restock`);
  if (response.status === 200) {
    return response.data;
  }
};

export const createImprestProduct = async (imprestProducts: ImprestProduct) => {
  const response = await axiosInstance.post(
    `/imprestproduct`,
    imprestProducts,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (response.status === 201 || response.status === 200) {
    return response.data;
  }
};

//Upadte Imprest_product
export async function updateImprestProduct(
  id: number | string,
  imprestProducts: any
) {
  const response = await axiosInstance.put(
    `/imprestproduct/${id}`,
    imprestProducts,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (response.status === 201 || response.status === 200) {
    return response.data;
  }
}

//Fetch One Imprest Product
export const getImprestProductById = async (id: number | string) => {
  const response = await axiosInstance.get(`/imprestproduct/${id}`);
  if (response.status === 200) {
    return response.data;
  }
};

// Delete Imprest Product
export const deleteImprestProduct = async (id: number) => {
  return await axiosInstance.delete(`/imprestproduct/${id}`);
};

//Get Products
export const getProducts = async () => {
  const response = await axiosInstance.get(`/product`);
  if (response.status === 200) {
    let keyValues = response.data.map((data: any) => ({
      label: data.description,
      value: data.id,
      labelCode: data?.short_code,
    }));
    return keyValues;
  }
};

export const raisePoforImprestProducts = async (outOfStockProducts: any) => {
  try {
    const response = await axiosInstance.post(`/purchase/initiate`, {
      data: outOfStockProducts.map(({ imprest_id, Product }: any) => ({
        imprest_id: imprest_id,
        product_id: Product.id,
      })),
    });

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Failed to raise PO");
    }
  } catch (error) {
    console.error("Service Error - raisePoforImprestProducts:", error);
    throw error;
  }
};
