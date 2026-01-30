import jwt_token from "jsonwebtoken";
import configs from "../configs.js"
const generateJWT = async (id: string) => {
  return new Promise((resolve, reject) => {
    const payload = { id };
    jwt_token.sign(
      payload,
      configs.secret_key as string,
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
