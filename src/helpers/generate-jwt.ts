const jwt_token = require("jsonwebtoken");
import configs from "../configs"
const generateJWT = async (id: string) => {
  return new Promise((resolve, reject) => {
    const payload = { id };
    jwt_token.sign(
      payload,
      configs.secret_key,
      {},
      (err: Error, token:string) => {
        if (err) {
          reject("No se pudo generar token");
        } else {
          resolve(token);
        }
      }
    );
  });
};

export default generateJWT
