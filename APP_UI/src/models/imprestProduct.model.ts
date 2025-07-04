export interface ImprestProduct {
  id?:  null | undefined;
  Product?: any;
  product_id?: number | string;
  imprest_id?: number | string;
  min_stock?: string | number ;
  max_stock?: number | string;
  available_stock?: number | string ;
  hospital_id?: string | Number | boolean;
  active?: boolean
}



