import { Field } from "./Field.interface";

export interface Annotation{
    id?:        number;
    text:       string;
    start:      number;
    end:        number;
    paragraph:  string;
    documentId: number;
    firstEntityId:   number;
    firstEntityCode: string;
    secondEntityId: number;
    secondEntityCode: string;
    fieldsFirstEntity?: string[];
    fieldsSecondEntity?: string[];
    status: string;
}

export interface AnnotationUpdate{
    key: number,
    changes: Annotation
}