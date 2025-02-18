import { Entity } from '../objects/Entity.interface';
import { Field } from '../objects/Field.interface';

export const ReadFileToText = (inputFile: File):any =>{
    const temporaryFileReader = new FileReader();

    return new Promise((resolve, reject) => {
        temporaryFileReader.onerror = () => {
            temporaryFileReader.abort();
            reject(new DOMException("Problem parsing input file."));
        };

        temporaryFileReader.onload = () => {
            resolve(temporaryFileReader.result as string);
        };
    
        temporaryFileReader.readAsText(inputFile);
    });
    
};

export const ReadFileToArrayBuffer = (inputFile: File):any =>{
    const temporaryFileReader = new FileReader();

    temporaryFileReader.onload = () => {
        console.log(temporaryFileReader.result as string);
    };

    temporaryFileReader.readAsArrayBuffer(inputFile);
};

export const ArrayBufferToText = (arrayBuffer: ArrayBuffer):any =>{
    let view = new Uint8Array(arrayBuffer); // trata el buffer como una secuencia de enteros de 32 bits
    return  new  TextDecoder('utf-8').decode(view);  
};

export const ParseEntitiesCSV = (csvContent:string, projectId:number):any => {
    const lines = csvContent.split('\n');
    let entityList:Entity[] =[]; 
    let entityString: string[] = [];
    
    lines.forEach((fieldData, index )=> {
        let fieldInfo = fieldData.split(',');

        let entityFound = entityList.find((entity) => fieldInfo[3] === entity.Code);

        if(entityFound !== undefined && fieldInfo[2] !== '' && fieldInfo[2] !== undefined)
        {
            let newField = CreateNewField(index+1,fieldInfo[2], entityFound.FieldList!.length.toString(), entityFound.Code);
            entityFound.FieldList!.push(newField);

            entityFound.Fields += 1;
        }
        else if(fieldInfo[4] !== '' && fieldInfo[4] !== 'Entity-Name' && fieldInfo[4] !== undefined && fieldInfo[2] !== '' && fieldInfo[2] !== undefined)
        {
            entityString.push(fieldInfo[4]);
            let newEntity = CreateNewEntity(fieldInfo, entityList.length, projectId);
            entityList.push(newEntity);

            let emptyField = CreateNewField(0,'Without Fields',newEntity.FieldList!.length.toString(), newEntity.Code);
            newEntity.FieldList!.push(emptyField);

            newEntity.Fields += 1;

            let newField = CreateNewField(index +1,fieldInfo[2],newEntity.FieldList!.length.toString(), newEntity.Code);
            newEntity.FieldList!.push(newField);

            newEntity.Fields += 1;
        }
    });

    return entityList;
};


const CreateNewEntity = (fieldInfo:string[], Id:number, projectId:number):Entity => {
    const fields: Field[] = [];

    let newEntity:Entity = {
        Entity: fieldInfo[4],
        Code: fieldInfo[3],
        FieldList: fields,
        Color: getEntityColor(),
        Fields: 0,
        Actions: Id,
        selected: true,
        projectId:projectId
    };

    return newEntity;
};

export const NewEntity = (name:string, entityList:Entity[], projectId:number):Entity => {
    let tmpEntityList:Entity[] =[]; 
    let newEntity:Entity = CreateNewEntity(['','','','e_'+entityList.length,name], entityList.length ,projectId);
    entityList.forEach((entity) => { tmpEntityList.push(entity); });
    newEntity.FieldList!.push(CreateNewField(0,'Without Fields',newEntity.FieldList!.length.toString(), newEntity.Code))
    newEntity.Fields = newEntity.FieldList!.length;
    tmpEntityList.push(newEntity);

    return newEntity;
};



const CreateNewField = (id:number,name:string, code: string,entityCode:string):Field => {
    let newField:Field = {
        id: id,
        code:(name === 'Without Fields')? 'f_WOF_'+entityCode.split('_')[1]+code: 'f_'+entityCode.split('_')[1]+code, 
        name: name,
        selected: true
    }
    return newField
};

export const NewField = (fieldName:string, entityList:Entity[], entitySelected:Entity):Entity[] => {
    let tmpEntityList:Entity[] =[]; 
    entityList.forEach((entity) => { 
        if(entity.Code == entitySelected.Code)
        {
            let fieldFound = entity.FieldList!.find((field) => field.name == fieldName);
            var newField = CreateNewField(entity.FieldList!.length + 1, fieldName,entity.FieldList!.length.toString(), entity.Code);

            if(!fieldFound) entity.FieldList! =  [...entity.FieldList!, newField]; //entity.FieldList!.push(newField);
        }
        entity.Fields = entity.FieldList!.length;
        tmpEntityList.push(entity); 
    });
    return tmpEntityList;
};

export const getEntityColor = ():string => {
    var first:number = 360 * Math.random();
    var second:number = 60 + 20 * Math.random();
    var third:number = 65 + 20 * Math.random();
    return "hsl(" + Math.trunc(first) + ',' +
        Math.trunc(second) + '%,' +
        Math.trunc(third) + '%)'
};
