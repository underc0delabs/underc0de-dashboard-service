export default interface IPayment {
    userSubscriptionId: number,
    mpPaymentId: string,
    status: string,
    paidAt: Date
}

