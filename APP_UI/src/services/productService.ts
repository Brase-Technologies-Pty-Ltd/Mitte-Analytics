import axiosInstance from "../middlewares/axiosInstance";

export const getAllProduct = async () => {
  const response = await axiosInstance.get(`/product`);
  if (response.status === 200) {
    return response.data;
  }
};
export const deleteProduct = async (id: number) => {
  return await axiosInstance.delete(`/product/${id}`);
};

export const createProduct = async (product: any) => {
  const productData = JSON.stringify(product);
  const response = await axiosInstance.post(`/product`, productData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.status === 201) {
    return response.data;
  }
};

export async function updateProduct(id: number | string, product: any) {
  const productData = JSON.stringify(product);
  const response = await axiosInstance.put(`/product/${id}`, productData, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status === 201 || response.status === 200) {
    return response.data;
  }
}
