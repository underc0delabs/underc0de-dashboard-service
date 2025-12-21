export default interface IUser {
    username: string,
    name: string,
    lastname?: string,
    phone: string,
    email: string,
    idNumber?: string,
    password: string,
    userType: number,
    birthday: Date,
    vip?: boolean,
    suscription?: string,
    status?: boolean,
    fcmToken?: string
}