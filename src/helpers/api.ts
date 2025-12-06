import { Response } from "express";
export const SuccessResponse = (res:Response,status:number,msg:string,result:any, pagination?:any) => {
    return res.status(status).json({
      status,
      success: true,
      msg,
      result,
      pagination
    })
  }
  export const ErrorResponse = (res:Response, error:Error, status:number = 500) => {
    res.status(status).json({
      status: status,
      success: false,
      msg: error.message,
      result: null,
      pagination: null
    })
  }
  