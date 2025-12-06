import { NextFunction, Request, Response } from "express";
import configs from "../../../configs";
import { IUserRepository } from "../../../modules/users/core/repository/IMongoUserRepository";
import { IJwtValidator } from "../core/IJwtValidator";
const jwt = require("jsonwebtoken");
const getJwtValidator = (UserRepository: IUserRepository): IJwtValidator => {
    const jwtValidator = async (req: Request, res: Response, next: NextFunction) => {
        const bearerHeader = req.header("authorization");
        if (!bearerHeader) {
          return res.status(401).json({
            status: 401,
            success: false,
            msg: "No hay token en la petición",
            type: 'auth'
          })
        }
        const bearer = bearerHeader.split(' ')
        const token = bearer[1]

        if(!token) {
          return res.status(401).json({
            status: 401,
            success: false,
            msg: "Se necesita el prefijo Bearer",
            type: 'auth'
          })
        }

        try {
          const { id } = jwt.verify(token, configs.secret_key);
          //leer user
          const user = await UserRepository.getById(id);
          //si el user existe
          if (!user) {
            return res.status(401).json({
              status: 401,
              success: false,
              msg:"Token no válido - usuario no existe",
              type: 'auth'
            })
          }
          //verificar si el uid es de un user activo
          if (!user.status) {
            return res.status(401).json({
              status: 401,
              success: false,
              msg:"Token no válido - usuario inactivo",
              type: 'auth'
            })
          }
          next();
        } catch (error:any) {
          console.log(JSON.stringify(error,null,2))
          return res.status(401).json({
            status: 401,
            success: false,
            msg: error.name === 'TokenExpiredError' ? "Sesión expirada" : "Token no válido" ,
            type: 'auth'
          })
        }
    }

    return jwtValidator
    
}

export default getJwtValidator