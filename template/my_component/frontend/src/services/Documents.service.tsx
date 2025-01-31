import { dbAnotadorInstance } from "../database/db";
import { Document } from "../objects/Document.interface";


export class DocumentService{
    constructor (){}

    getList(projectId:number){
        const result = dbAnotadorInstance.documents.where({projectId:projectId}).toArray();
        return result;
    }

    getDocument(docId:number){
        const result = dbAnotadorInstance.documents.where({id: docId}).toArray();
        return result;
    }

    add(document:Document){
        const result = dbAnotadorInstance.documents.add(document);
        return result;
    }
}