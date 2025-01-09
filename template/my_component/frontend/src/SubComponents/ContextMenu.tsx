import { FC, useState } from "react";

import { ArrowForwardIos, DeleteForever, DeleteForeverOutlined, Sell, TextFields} from "@mui/icons-material";
import { Field } from '../objects/Field.interface';
import { Entity } from "../objects/Entity.interface";
import { Annotation } from '../objects/Annotation.interface';
import React from "react";
import ContextMenu_EntityFields from "./ContextMenu_EntityFields";
import { AnnotationService } from "../services/Annotations.service";
import { basicFormatString } from "../tools/Utils";
import { ComunicationService } from '../notifications/comunication.service';
import { createSignal } from "@react-rxjs/utils";
import { bind } from "@react-rxjs/core";


interface ContextMenuProps {
    x:number|undefined
    y:number|undefined
    displayValue:string|undefined
    xTranslate:string|undefined
    yTranslate:string|undefined
    closeContextMenu: () => void
    showAnnotations: ()=> void
    refreshData: () => void
    entities: Entity[],
    annotation:Annotation,
    annotationsSelected:Annotation[],
    annotationList:Annotation[]
}

const ContextMenu:FC<ContextMenuProps> = ({x,y,displayValue, xTranslate, yTranslate, closeContextMenu, showAnnotations, refreshData, entities, annotationList, annotation, annotationsSelected}) => {
 
   

    const [filterValue, setFilterEntities] = useState('');
    const _annotationsService = new AnnotationService();
    var annotationsToSave:Annotation[] = [];
    var contextMenuText: string = '';

    //A signal is an entry point 


 

    function handleFilterEntities(e:any){
        setFilterEntities(e.target.value);
    }

    function clearEntity(entityIndex:number){
        annotationsToSave = [];
        annotationsToSave = annotationList.filter((tmpAnnotation) => basicFormatString(tmpAnnotation.text) === basicFormatString(annotation.text));
        if(annotationsToSave.length > 0){
            if(entityIndex === 0 ){
                annotationsToSave.forEach(annSelected => {
                    annSelected.firstEntityId =  -1;
                    annSelected.firstEntityCode = '';
                    annSelected.fieldsFirstEntity =  [];
                });
            }
            else
            {
                annotationsToSave.forEach(annSelected => {
                    annSelected.secondEntityId =  -1;
                    annSelected.secondEntityCode = '';
                    annSelected.fieldsSecondEntity =  [];
                });
            }
            updateBulkAnnotations();
        }
        closeContextMenu();
    }

    function deleteBulkAnnotations()
    {
        
        var annKeysToDelete:number[] = [];
        
        annKeysToDelete = annotationList.filter((annSelected) => basicFormatString(annSelected.text) === basicFormatString(annotation.text)).map(annSelected => annSelected.id!);
  
        var result = _annotationsService.deleteBulk(annKeysToDelete);
        result.then(result => {
            closeContextMenu();
            showAnnotations();

        });
    }

    function deleteUniqueAnnotation()
    {
        var result = _annotationsService.deleteUnique(annotation.id!);
        result.then(result => {
            closeContextMenu();
            showAnnotations();

        });
    }

    function updateBulkAnnotations()
    {
        var result = _annotationsService.updateBulk(annotationsToSave);
        result.then(result => {
            refreshData();
            //comunicar con el componente de anotador
        });
    }

    function updateFirstEntityData(entity:Entity){
        if(annotationsToSave.length > 0){
            annotationsToSave.forEach(annSelected => {
                annSelected.firstEntityId =  entity.id!
                annSelected.firstEntityCode =  entity.Code;
                annSelected.fieldsFirstEntity =  [];
            });
            updateBulkAnnotations();
        }
    }

    function updateSecondEntityData(entity:Entity){
        if(annotationsToSave.length > 0){
            annotationsToSave.forEach(annSelected => {
                annSelected.secondEntityId =  entity.id!
                annSelected.secondEntityCode = entity.Code;
                annSelected.fieldsSecondEntity =  [];
            });
            updateBulkAnnotations();
        }
    }

    function entitySelected(entity:Entity, entityIndex:number){
        annotationsToSave = [];
        annotationsToSave = annotationList.filter((tmpAnnotation) => basicFormatString(tmpAnnotation.text) === basicFormatString(annotation.text));
        /*
        if(annotation.status === 'Saved')
            annotationsToSave = annotationList.filter((tmpAnnotation) => basicFormatString(tmpAnnotation.text) === basicFormatString(annotation.text));
        else
            annotationsToSave = annotationList.filter((tmpAnnotation) =>  tmpAnnotation.status === 'Draft');
        */
    
        if(entityIndex == 0)
        {
            updateFirstEntityData(entity);
        }
        else if(entityIndex == 1)
        {
            updateSecondEntityData(entity);
        }
        closeContextMenu();
    }

    function getEntityName(entityId:number):string{
        var entityFounded =  entities.find((entity) => entity.id == entityId);

        if(entityFounded)
            return entityFounded?.Entity;
        else
            return 'undefined';

    }

    function getEntityById(entityId:number):Entity|undefined{
        var entityFounded =  entities.find((entity) => entity.id == entityId);
        return entityFounded;
    }

    function getFieldName(entityId:number,fields:string[],fieldIndex:number):string{
        var fieldName:string = 'undefined';
        const entity = getEntityById(entityId);
        if(entity && fields.length >= 1 && fieldIndex == 0 ){
            const fieldFounded = entity.FieldList!.find((field) => field.code == fields[fieldIndex]);
            if(fieldFounded)
            {
                fieldName = fieldFounded.name;
            }
        }

        if(entity && fields.length == 2 && fieldIndex == 1 ){
            const fieldFounded = entity.FieldList!.find((field) => field.code == fields[fieldIndex]);
            if(fieldFounded)
            {
                fieldName = fieldFounded.name;
            }
        }
        return fieldName;
    }

    function getAnnTextToShow(selectedEntities:Annotation[]):string{
        
    /*
        if(annotationsSelected.length > 0 ){
            contextMenuText = `${annotationsSelected.length} annotations selected`;
        }
        else
        */
            contextMenuText = annotation.text;

        return contextMenuText;
    }
    
    return (
        
        <ul
        id="contextMenu"
        className="context-menu-absolute"
        style={
            x !== undefined
                ? {top: `${y}px`, left: `${x}px`, transform: `translate(${xTranslate}, ${yTranslate})`, display: displayValue}
                :undefined
        }>
            <li  className="context-menu-item context-menu-label context-menu-line"><span>{getAnnTextToShow(annotationsSelected)}</span> <TextFields className="context-menu-item-icon"></TextFields></li>
            <li onClick={deleteBulkAnnotations} className="context-menu-item context-menu-label context-menu-line"><span>Delete All Annotations</span> <DeleteForever className="context-menu-item-icon"></DeleteForever></li>
            <li onClick={deleteUniqueAnnotation} className="context-menu-item context-menu-label context-menu-line"><span>Delete this</span> <DeleteForever className="context-menu-item-icon"></DeleteForever></li>

            {
                <li className="context-menu-item">
                    <span>{getEntityName(annotation.firstEntityId)}<ArrowForwardIos className="context-menu-item-arrow"></ArrowForwardIos></span>

                    <ul className="context-submenu">
                        <li className="context-submenu-item context-submenu-default-cursor" onClick={(e) => {e.stopPropagation(); clearEntity(0);}}>
                            <span> Clear <DeleteForeverOutlined className="context-menu-item-icon"></DeleteForeverOutlined></span>
               
                        </li>
                        <li className="context-submenu-item context-submenu-default-cursor">
                            <span>{getFieldName(annotation.firstEntityId,annotation.fieldsFirstEntity!,0)} <Sell className="context-menu-item-icon"></Sell></span>
                            <ArrowForwardIos className="context-menu-item-arrow"></ArrowForwardIos>
                            <ContextMenu_EntityFields entities={entities} entityId={annotation.firstEntityId} fieldIndex={0} fieldSelected={0} annotation={annotation} annotationList={annotationList} closeContextMenu={closeContextMenu} refreshData={refreshData}/>
                        </li>
                        <li className="context-submenu-item context-submenu-default-cursor context-menu-line">
                            <span>{getFieldName(annotation.firstEntityId,annotation.fieldsFirstEntity!,1)} <Sell className="context-menu-item-icon"></Sell></span>
                            <ArrowForwardIos className="context-menu-item-arrow"></ArrowForwardIos>
                            <ContextMenu_EntityFields entities={entities} entityId={annotation.firstEntityId} fieldIndex={1} fieldSelected={0} annotation={annotation} annotationList={annotationList} closeContextMenu={closeContextMenu} refreshData={refreshData}/>
                        </li>
                        <input autoComplete="off" onChange={(e)=> {handleFilterEntities(e);}} className="context-menu-search-item" placeholder="Search"  id="site-search-second" name="q" />
                        <div className="context-menu-container-options">

                        
                        {
                            entities.filter((entity) => entity.Entity.toLocaleLowerCase().includes(filterValue.toLocaleLowerCase())).map((entity) => {
                                return (
                                <li className="context-submenu-item"
                                onClick={(e) => {e.stopPropagation(); entitySelected(entity, 0);}}
                                >
                                    <span >
                                        {entity.Entity}
                                    </span>
                                </li>)
                                
                            })
                        }
                        </div>
                    </ul>
                </li>
            }
            {
                <li className="context-menu-item">
                    <span>{getEntityName(annotation.secondEntityId)} <ArrowForwardIos className="context-menu-item-arrow"></ArrowForwardIos></span>
                    <ul className="context-submenu">
                        <li className="context-submenu-item" onClick={(e) => {e.stopPropagation(); clearEntity(1);}}>
                            <span>Clear<DeleteForeverOutlined className="context-menu-item-icon"></DeleteForeverOutlined></span>

                            
                        </li>
                        <li className="context-submenu-item">
                            <span>{getFieldName(annotation.secondEntityId,annotation.fieldsSecondEntity!,0)} <Sell className="context-menu-item-icon"></Sell></span>
                            <ArrowForwardIos className="context-menu-item-arrow"></ArrowForwardIos>
                            <ContextMenu_EntityFields entities={entities} entityId={annotation.secondEntityId} fieldIndex={0} fieldSelected={1} annotation={annotation} annotationList={annotationList} closeContextMenu={closeContextMenu} refreshData={refreshData}/>

                            
                        </li>
                        <li className="context-submenu-item context-menu-line">
                            <span>{getFieldName(annotation.secondEntityId,annotation.fieldsSecondEntity!,1)} <Sell className="context-menu-item-icon"></Sell></span>
                            <ArrowForwardIos className="context-menu-item-arrow"></ArrowForwardIos>
                            <ContextMenu_EntityFields entities={entities} entityId={annotation.secondEntityId} fieldIndex={1} fieldSelected={1} annotation={annotation} annotationList={annotationList} closeContextMenu={closeContextMenu} refreshData={refreshData}/>
                        </li>
                        <input autoComplete="off" onChange={(e)=> {handleFilterEntities(e);}} className="context-menu-search-item" placeholder="Search"  id="site-search" name="q" />
                        <div className="context-menu-container-options">
                        {
                            entities.filter((entity) => entity.Entity.toLocaleLowerCase().includes(filterValue.toLocaleLowerCase())).map((entity) => {
                                return (
                                    <li 
                                    className="context-submenu-item"
                                    onClick={(e) => {e.stopPropagation(); entitySelected(entity, 1);}}
                                    >
                                        <span>{entity.Entity}</span>
                                </li>)
                            })
                        }
                        </div>
                    </ul>
                </li>
            }
        </ul>  
    )
}

export default ContextMenu