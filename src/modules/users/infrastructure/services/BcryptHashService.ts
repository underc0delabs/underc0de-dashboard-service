import { IHashService } from "../../core/services/IHashService"

const bcryptjs = require('bcryptjs')
const salt = bcryptjs.genSaltSync()

export const BcryptHashService = (): IHashService => ({
  hash(toHash: string): string {
    return bcryptjs.hashSync(toHash, salt)
  },
  compare(toHash: string, hashed: string): boolean {
    return bcryptjs.compareSync(toHash, hashed)
  }
})