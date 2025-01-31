import { Annotation, AnnotationUpdate } from "../objects/Annotation.interface";
import { dbAnotadorInstance } from '../database/db';

export class AnnotationService{
    constructor (){}

    getByDocumentId(id:number){
        const result = dbAnotadorInstance.annotations.where({documentId: id}).toArray();
        return result;
    }

    deleteBulk(keys:number[]){
        const result = dbAnotadorInstance.annotations.bulkDelete(keys);
        return result;
    }

    deleteUnique(key:number)
    {
        const result = dbAnotadorInstance.annotations.delete(key);
        return result;
    }

    addBulk(annotations:Annotation[]){
        const result = dbAnotadorInstance.annotations.bulkAdd(annotations);
        return result;
    }

    updateBulk(annotations:Annotation[]){
        var annotationsUpdate:AnnotationUpdate[] = [];
        annotations.forEach((annotation) =>
            {
                annotationsUpdate.push({
                    key:annotation.id!,
                    changes: {
                        text: annotation.text,
                        start: annotation.start,
                        end: annotation.end,
                        paragraph: annotation.paragraph,
                        documentId: annotation.documentId,
                        firstEntityId: annotation.firstEntityId,
                        secondEntityId: annotation.secondEntityId,
                        firstEntityCode: annotation.firstEntityCode,
                        secondEntityCode: annotation.secondEntityCode,
                        fieldsFirstEntity: annotation.fieldsFirstEntity,
                        fieldsSecondEntity: annotation.fieldsSecondEntity,
                        status:annotation.status
                    }
                });
            }
        );
        const result = dbAnotadorInstance.annotations.bulkUpdate(annotationsUpdate);
        return result;
    }

    add(annotation:Annotation){
        const result =  dbAnotadorInstance.annotations.add(annotation);
        return result;
    }

    get(annId:number){
        const result = dbAnotadorInstance.annotations.where({id:annId}).first();
        return result;
    }

    getAllItems(){
        const result = dbAnotadorInstance.annotations.toArray();

        return result;
    }
}