export default interface IEnvironment {
  id: number;
  key: string;
  value: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
