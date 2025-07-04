import axiosInstance from "../middlewares/axiosInstance";

export async function getGenerics() {
  let keyValues: any[] = [];
  const response = await axiosInstance.get(`/generic`);
  if (response.status === 200) {
    keyValues = response.data.map((data: any) => ({
      label: data.name,
      value: data.id,
    }));
  }

  return keyValues;
}

export async function getBrands() {
  let keyValues: any[] = [];
  const response = await axiosInstance.get(`/brand`);
  if (response.status === 200) {
    keyValues = response.data.map((data: any) => ({
      label: data.name,
      value: data.id,
    }));
  }

  return keyValues;
}

export async function getPackUoms() {
  let keyValues: any[] = [];
  const response = await axiosInstance.get(`/packuom`);
  if (response.status === 200) {
    keyValues = response.data.map((data: any) => ({
      label: data.name,
      value: data.id,
    }));
  }

  return keyValues;
}

export async function getUoms() {
  let keyValues: any[] = [];
  const response = await axiosInstance.get(`/uom`);
  if (response.status === 200) {
    keyValues = response.data.map((data: any) => ({
      label: data.name,
      value: data.id,
    }));
  }

  return keyValues;
}

export async function getProductForms() {
  let keyValues: any[] = [];
  const response = await axiosInstance.get(`/productform`);
  if (response.status === 200) {
    keyValues = response.data.map((data: any) => ({
      label: data.name,
      value: data.id,
    }));
  }

  return keyValues;
}

//Get Hospitals
export async function getHospitals() {
  let keyValues: any[] = [];
  const response = await axiosInstance.get(`/hospital`);
  if (response.status === 200) {
    keyValues = response.data.map((data: any) => ({
      label: data.name,
      value: data.id,
    }));
  }

  return keyValues;
}

//Get Imprests
export async function getImprests() {
  let keyValues: any[] = [];
  const response = await axiosInstance.get(`/imprest`);
  if (response.status === 200) {
    keyValues = response.data.map((data: any) => ({
      label: data.name,
      value: data.id,
    }));
  }

  return keyValues;
}

//Get Products
export async function getProducts() {
  let keyValues: any[] = [];
  const response = await axiosInstance.get(`/product`);
  if (response.status === 200) {
    keyValues = response.data.map((data: any) => ({
      label: data.description,
      value: data.id,
      labelCode: data?.short_code,
    }));
  }

  return keyValues;
}
