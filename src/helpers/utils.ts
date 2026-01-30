import fs from 'fs';

export const mongoObjectNormalizer = (object:{[key:string]: any}) => {
    return JSON.parse(JSON.stringify(object))
}

export const createHashMap = (objectToMap: {[key:string]: any}, defaultValue?:any) => {
    const handler = {
        get: function(target:{[key:string]:any}, name:string) {
            return target.hasOwnProperty(name) ? target[name] : defaultValue;
          }
    }
    const map = Object.keys(objectToMap).reduce((map, property) => {
        const mapPart = property.split(',').reduce((map, splitedProperty)=> {
            return {...map, [splitedProperty]: objectToMap[property]}
        },{})
        return {...map, ...mapPart}
    },{})
    return new Proxy(map, handler)
}
export const checkForDuplicate = (array:{[key:string]:any}[], keyName:string) => {
    return new Set(array.map(item => item[keyName])).size !== array.length
  }

export const getPemFromValue = (value:string, path:string) => {
    const pathWithExtention = path + '.pem'
    fs.writeFileSync(pathWithExtention,value)
    const file = fs.readFileSync(pathWithExtention)
    fs.unlinkSync(pathWithExtention)
    return file
}