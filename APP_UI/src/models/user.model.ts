export interface User {
  id?: number | string,
  user_name: string,
  first_name: string,
  middle_name?: string,
  last_name: string,
  phone_number?: string,
  email: string,
  active: boolean | string;
  created_by?: string | number,
  created_at?: Date,
  modified_by?: string,
  modified_at?: Date,
  password?: string,
  confirmed_password?: string
}