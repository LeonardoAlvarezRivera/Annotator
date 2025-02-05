import React from "react"
import { FC } from "react"
import { Entity } from "../objects/Entity.interface"
import { Field } from "../objects/Field.interface";
import { Annotation } from '../objects/Annotation.interface';
import { AnnotationService } from "../services/Annotations.service";
import { basicFormatString } from "../tools/Utils";

interface ContextMenuEntityFieldsProps {
    entities: Entity[],
    entityId:number,
    fieldIndex:number,
    fieldSelected:number,
    annotation:Annotation,
    annotationList:Annotation[],
    closeContextMenu: () => void,
    refreshData: () => void
}

const ContextMenu_EntityFields:FC<ContextMenuEntityFieldsProps> = ({entities, entityId, fieldIndex, fieldSelected, annotation, annotationList, closeContextMenu, refreshData}) => {

    const _annotationsService = new AnnotationService();
    var annotationsToSave:Annotation[] = [];



    function getEntityById(entityId:number):Entity|undefined{
        var entityFounded =  entities.find((entity) => entity.id == entityId);
        return entityFounded;
    }

    function getEntityFields(entityId:number):Field[]{
        var fields:Field[] = [];
        var entityFounded:Entity|undefined = getEntityById(entityId);
        if(entityFounded)
            fields = entityFounded.FieldList!;
        return fields;
    }


    function setFirstFieldsToAnnotations(field:Field){
        if(annotationsToSave.length > 0){
            annotationsToSave.forEach(annSelected => {
                if(!annSelected.fieldsFirstEntity)
                {
                    annSelected.fieldsFirstEntity = [];
                }

                if(annSelected.fieldsFirstEntity.length == 0){
                    annSelected.fieldsFirstEntity.push(field.code);
                }
                else{
                    annSelected.fieldsFirstEntity[0] =field.code;
                }
            });
            updateBulkAnnotations();

        }
    }

    function setSecondFieldsToAnnotations(field:Field){
        if(annotationsToSave.length > 0){
            annotationsToSave.forEach(annSelected => {
                if(!annSelected.fieldsFirstEntity)
                {
                    annSelected.fieldsFirstEntity = [];
                }

                if(annSelected.fieldsFirstEntity.length < 2){
                    annSelected.fieldsFirstEntity.push(field.code);
                }
                else{
                    annSelected.fieldsFirstEntity[1] =field.code;
                }
            });
         
            updateBulkAnnotations();
        }
    }


    function setFirstFieldsSecond(field:Field){
        if(annotationsToSave.length > 0){
            annotationsToSave.forEach(annSelected => {
                if(!annSelected.fieldsSecondEntity)
                {
                    annSelected.fieldsSecondEntity = [];
                }

                if(annSelected.fieldsSecondEntity.length == 0){
                    annSelected.fieldsSecondEntity.push(field.code);
                }
                else{
                    annSelected.fieldsSecondEntity[0] =field.code;
                }
            });
            updateBulkAnnotations();

        }
    }

    function setSecondFieldsSecond(field:Field){
        if(annotationsToSave.length > 0){
            annotationsToSave.forEach(annSelected => {
                if(!annSelected.fieldsSecondEntity)
                {
                    annSelected.fieldsSecondEntity = [];
                }

                if(annSelected.fieldsSecondEntity.length < 2){
                    annSelected.fieldsSecondEntity.push(field.code);
                }
                else{
                    annSelected.fieldsSecondEntity[1] =field.code;
                }
            });
         
            updateBulkAnnotations();
        }
    }


    function updateBulkAnnotations()
    {
        var result = _annotationsService.updateBulk(annotationsToSave);
        result.then(result => {
            refreshData();
            //comunicar con el componente de anotador
        });
    }

    function ValidateFields(fieldIndex:number, fields:String[]):boolean{

        var result:boolean = true;
        if(fieldIndex == 1 && fields.length == 0){
            result = false;
        }
        return result;
    }

    function handleFieldSelected(field:Field, fieldIndex:number){
        annotationsToSave = [];
        annotationsToSave = annotationList.filter((tmpAnnotation) => basicFormatString(tmpAnnotation.text) === basicFormatString(annotation.text));
        
        if(fieldIndex == 0 && fieldSelected == 0 && ValidateFields(fieldIndex, annotation.fieldsFirstEntity!)){
            setFirstFieldsToAnnotations(field);
        }
        else if(fieldIndex == 1 && fieldSelected == 0  && ValidateFields(fieldIndex, annotation.fieldsFirstEntity!)){
            setSecondFieldsToAnnotations(field);
        }

        else if(fieldIndex == 0 && fieldSelected == 1 && ValidateFields(fieldIndex, annotation.fieldsSecondEntity!)){
            setFirstFieldsSecond(field);
        }
        else if(fieldIndex == 1 && fieldSelected == 1  && ValidateFields(fieldIndex, annotation.fieldsSecondEntity!)){
            setSecondFieldsSecond(field);
        }
        else {
            alert('Asegurese de tener un primer field antes de agregar el segundo');
        }

        //closeContextMenu();
    }
    
    return (
        
        <ul className="context-submenu-field">
            <div className="context-menu-container-options">
            {
                
                getEntityFields(entityId).map((field) => {

                    if(field.name !== 'Without Fields'){

                    return (
                    <li 
                    className="context-submenu-field-item"
                    onClick={(e) => {e.stopPropagation(); handleFieldSelected(field,fieldIndex);}}
                    >
                        <span>{field.name}</span>

                    </li>)
                    }
                })
        
            }
            </div>
        </ul>
    )
}

export default ContextMenu_EntityFields