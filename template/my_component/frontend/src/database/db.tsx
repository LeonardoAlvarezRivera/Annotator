import Dexie, { Table } from 'dexie'
import { Annotation } from '../objects/Annotation.interface';
import { Document } from '../objects/Document.interface';
import { Entity } from '../objects/Entity.interface'
import { Project } from '../objects/Project.interface';

export class AnotadorDB extends Dexie{
    entities!: Table<Entity, number>;
    documents!: Table<Document,number>;
    annotations!: Table<Annotation,number>;
    projects!: Table<Project, number>;

    constructor(){
        super('anotadorDB');
        this.version(1).stores({
            entities: '++id, projectId',
            documents: '++id, projectId',
            annotations: '++id, documentId, firstEntityId',
            projects: '++id'
        });
    }
}



export const dbAnotadorInstance = new AnotadorDB();
