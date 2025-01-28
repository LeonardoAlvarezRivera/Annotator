import { Field } from "./Field.interface";

export interface Entity{
    id?: number;
    Entity: string;
    Code: string;
    Color: string;
    Fields: number;
    FieldList?: Field[];
    Actions: number;
    selected: boolean;
    projectId : number;
}

