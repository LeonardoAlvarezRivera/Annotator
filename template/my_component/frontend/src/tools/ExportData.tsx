import { Annotation } from '../objects/Annotation.interface';
import { Entity } from '../objects/Entity.interface';
import { EXPORT_JSON_NER, EXPORT_JSON_TAGTOG } from './Contants';
import { entityItem, NERAnnotation } from '../interfaces/NERAnnotation.interface';
import JSZip from 'jszip';
import { Document } from '../objects/Document.interface';
import { readBinaryContent } from './Utils';

export class ExportData{

    constructor(){}


    startExportProcess (formatExport:number, annotations: Annotation[], entities: Entity[], documents: Document[]){
        const zip = new JSZip();

        const replacer = (key: any, value: any ) => (value === null ? '' : value);

        zip.folder('data_export_anotations')!.file('entities.json', JSON.stringify(entities,replacer)); 
    
        documents.forEach(document => {

            if(formatExport == EXPORT_JSON_NER){
            const jsonStringify = this.createJSONFile(annotations.filter(annotation => annotation.documentId === document.id), entities, document, replacer);
            zip.folder('data_export_anotations')!.folder("NER_Annotations")!.file(document.title+'.json',jsonStringify);
            }

        });

        this.createZipFile(zip);
    }

    

    private createJSONFile(annotations: Annotation[], entities: Entity[], document: Document, replacer:any)
    { 
       const textPlain = readBinaryContent(document.textContent);    

       var NERAnnotations: NERAnnotation[] = [];  

       var paragraphs = textPlain.split('\n').filter(item => item !== '\r');
       paragraphs.forEach((paragraph, index) => {
           var annotationsByParagraph = annotations.filter(item => item.paragraph === 'p'+index);
           
           const uniqueArray = annotationsByParagraph.
           filter((item, index, self) =>index === 
           self.findIndex((o) => o.start === item.start && o.end === item.end ) 
            );

           var NERAnn: NERAnnotation = {
            Anotacion: paragraph.replaceAll('\r',''),
            entities: []
           };

           uniqueArray.forEach(item => {

            //add first entity
               var entity = entities.find(entityItem => entityItem.Code === item.firstEntityCode);
               if(entity !== undefined)
               {
                    var entityItem: entityItem ={
                        start: item.start,
                        end: item.end,
                        entity: entity.Entity,
                        fields: (item.fieldsFirstEntity)?this.getFieldsByCode(entity,item.fieldsFirstEntity):[]
                    };
                    NERAnn.entities.push(entityItem);
               }

               //add second entity
               var secondentity = entities.find(entityItem => entityItem.Code === item.secondEntityCode);
               if(secondentity !== undefined)
               {
                    var entityItem: entityItem ={
                        start: item.start,
                        end: item.end,
                        entity: secondentity.Entity,
                        fields: (item.fieldsSecondEntity)?this.getFieldsByCode(secondentity,item.fieldsSecondEntity):[]
                    };
                    NERAnn.entities.push(entityItem);
               }
           });

           NERAnnotations.push(NERAnn);
        });
    
       return JSON.stringify(NERAnnotations,replacer);//this.createZipFile(NERAnnotations, entities, document);
    }

    private getFieldsByCode(entity:Entity, fieldsCode: string[]):string[]{
        var fieldsText:string[]=[];
       
            fieldsCode.forEach(item=>{
                if(entity.FieldList !== undefined){
                    var fieldObject = entity.FieldList.find(field => field.code === item);
                    if(fieldObject !== undefined)
                    {
                        fieldsText.push(fieldObject.name);
                    }
                }
            });

        
        return fieldsText;
    }

    private async createZipFile(zip:JSZip){
        
        const a = document.createElement('a');
        var dateNow = Date.now();

        const archive = await zip.generateAsync({type:"blob"});
        const url = window.URL.createObjectURL(archive);
        a.href = url;
        a.download = 'data_export_anotations.zip';
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }
}

