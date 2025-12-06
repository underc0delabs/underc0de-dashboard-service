import { Application, Express } from "express";
const express = require('express');
const morgan = require("morgan")
const cors = require("cors")
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