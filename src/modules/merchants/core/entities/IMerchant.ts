export default interface IMerchant {
    name: string,
    address: string,
    phone: string,
    email: string,
    status?: boolean,
    category?: string,
    categoryName?: string | null,
    logo?: string,
    usersProDisccount?: number,
    usersDisccount?: number,
    url?: string,
    detail?: string
}

