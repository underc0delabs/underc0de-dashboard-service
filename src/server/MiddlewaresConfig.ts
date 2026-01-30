import { Application, Express } from "express";
import express from 'express';
import morgan from "morgan";
import cors from "cors";
const ConfigureServerMiddlewares = (app: Application) => {
    app.use(morgan('dev'))
    const corsOptions = {
        origin: '*',
        optionsSuccessStatus: 200 // For legacy browser support
    }
    app.use(cors(corsOptions))
    
    app.use(express.json())
    app.use(express.urlencoded({extended:true}))
    
    app.use(express.static('public'))
    
}

export default ConfigureServerMiddlewares