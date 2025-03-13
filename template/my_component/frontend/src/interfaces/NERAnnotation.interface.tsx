export interface NERAnnotation{
    Anotacion:       string;
    entities: entityItem[];
}

export interface entityItem{
    start: number,
    end: number,
    entity: string,
    fields: string[]
}
