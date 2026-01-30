import { NextFunction, Request, Response } from "express";
import configs from "../../../configs.js";
import { IAdminUserRepository } from "../../../modules/adminUsers/core/repository/IAdminUserRepository.js";
import { IJwtValidator } from "../../JwtValidator/core/IJwtValidator.js";

import jwt from "jsonwebtoken";
const getJwtValidator = (UserAdminRepository: IAdminUserRepository): IJwtValidator => {
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

        const secret = configs.secret_key;
        if (!secret) {
          return res.status(500).json({
            status: 500,
            success: false,
            msg: "Configuración de JWT no disponible",
            type: 'auth'
          });
        }
        try {
          const decoded = jwt.verify(token, secret) as { id: string };
          const { id } = decoded;
          //leer user
          const user = await UserAdminRepository.getById(id);
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