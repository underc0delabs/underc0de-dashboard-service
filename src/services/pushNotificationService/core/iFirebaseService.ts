export interface IFirebaseService {
  sendNotification(
    title: string,
    message: string,
    tokens: string[]
  ): Promise<void>;
}
