export default interface ISubscriptionPlan {
    userId: number,
    status: string,
    startedAt: Date,
    expiresAt: Date,
    mpSubscriptionId: string,
    mpPreapprovalId?: string
}

