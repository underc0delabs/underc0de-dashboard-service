export default interface IAdminUser {
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
  status?: boolean;
  role?: string;
  rol?: string;
}
