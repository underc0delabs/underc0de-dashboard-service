import { Application, Express } from "express";
import express from 'express';
import morgan from "morgan";
import cors from "cors";
const ConfigureServerMiddlewares = (app: Application) => {
    app.use(morgan('dev'))
    const corsOrigin = process.env.CORS_ORIGIN?.trim();
    const corsOptions = {
        origin: corsOrigin ? corsOrigin.split(',').map((o: string) => o.trim()) : '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        optionsSuccessStatus: 200
    };
    app.use(cors(corsOptions))
    
    app.use(express.json())
    app.use(express.urlencoded({extended:true}))
    
    app.use(express.static('public'))
    
}

export default ConfigureServerMiddlewares