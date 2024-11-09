import Dexie, { Table } from 'dexie'
import { Annotation } from '../objects/Annotation.interface';
import { Document } from '../objects/Document.interface';
import { Entity } from '../objects/Entity.interface'

export class AnotadorDB extends Dexie{
    entities!: Table<Entity, number>;
    documents!: Table<Document,number>;
    annotations!: Table<Annotation,number>;

    constructor(){
        super('anotadorDB');
        this.version(1).stores({
            entities: '++id',
            documents: '++id',
            annotations: '++id, documentId, firstEntityId'
        });
    }
}



export const dbAnotadorInstance = new AnotadorDB();
