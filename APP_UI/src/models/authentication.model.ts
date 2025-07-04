import { Role } from "./role.model";
import { User } from "./user.model";

export interface Authentication {
  token?: string;
  user: User;
  userdata: User,
  iat: number,
  exp: number,
  roles: Role[];
  hospital?: string | null;
}