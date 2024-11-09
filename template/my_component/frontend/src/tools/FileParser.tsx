import { Document } from "../objects/Document.interface";
import { DocumentService } from "../services/Documents.service";
import { getTitleDocument, ReadFile } from '../tools/Utils';

const _documentService: DocumentService = new DocumentService();

export class FileParser{
    
    constructor(){

    }

    async parseFiles(files:File[]){
        var cont: number = 0;
        for(cont; cont< files.length; cont++)
        {
            var newDocument: Document = {
                title: getTitleDocument(files[cont]),
                textContent: await ReadFile(files[cont])
            }

            _documentService.add(newDocument).then(docId => {
                console.log('Document with id: '+docId+' added')
            }).catch(error => {
                console.log(error);
            });
        }
    }
}