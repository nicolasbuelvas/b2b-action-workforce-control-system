import { UserRole } from './roles';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}