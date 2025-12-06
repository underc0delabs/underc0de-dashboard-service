export interface IHashService {
    hash: (toHash: string) => string,
    compare: (toHash: string, hashed: string) => boolean,
}