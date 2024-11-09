import { Checkbox } from "@mui/material";
import React, { useRef, useState } from "react";
import { Annotation } from '../objects/Annotation.interface';
import { Document } from '../objects/Document.interface';
import { Entity } from '../objects/Entity.interface';
import { DocumentService } from "../services/Documents.service";
import { EntitiesService } from '../services/Entities.service';
import { FileParser } from "../tools/FileParser";
import { basicFormatString, convertStringToDOM, findNewAnnotationsInText, readBinaryContent } from '../tools/Utils';
import { AnnotationService } from '../services/Annotations.service';
import { Field } from '../objects/Field.interface';



export type Props = {
 EntityList: Entity[]
};

class Anotador extends React.Component<Props>{
    _corpusContainerHTML!:HTMLElement;
    _corpusTitleHTML!:HTMLElement;
    _textSelected:string = '';
    _isOverCorpusContent:boolean = false;
    _anotationMode:boolean = true;
    _currentDocument: Document | undefined = undefined;
    _AnnotationsSelectedList: Annotation[] = [];
    _annotationsList:Annotation[] = [];
    _tmpAnotationSelected:Annotation = {
        text: "",
        start: 0,
        end: 0,
        paragraph: "",
        documentId: this._currentDocument?.id!,
        firstEntityId: -1,
        secondEntityId: -1,
        firstEntityCode: '',
        secondEntityCode: '',
        fieldsFirstEntity: [],
        fieldsSecondEntity: [],
        status: 'Draft'
    };
    _AnnotationSelected:Annotation = {
        text: "",
        start: 0,
        end: 0,
        paragraph: "",
        documentId: 0,
        firstEntityId: -1,
        secondEntityId: -1,
        firstEntityCode: '',
        secondEntityCode: '',
        fieldsFirstEntity: [],
        fieldsSecondEntity: [],
        status: 'Draft'
    };

    _statusClickSave: number = 0;
    textPlain:string = '';
    entityFields: string[] = [];

    private entityService = new EntitiesService();
    private _documentService = new DocumentService();
    private _annotationsService = new AnnotationService();
    private _parseFileService: FileParser = new FileParser();

    entityList: Entity[]=[];
    documentList: Document[] = [];

    firstEntityFieldList:Field[] = [];
    currentFirstEntitySecondField:string = '-1';
    currentFirstEntityFirstField:string = '-1';
    secondEntityFieldList:Field[] = [];

    constructor(
        props:Props ){

        super(props);
        

        if(this.entityList.length == 0)
        {
            this.loadEntities();
        }
        this.initDocuments();

        document.addEventListener('keyup', e  => {
            e.stopPropagation();
            if(e.ctrlKey && e.key === 's'){
                /*if(this._tmpAnotationSelected.id)
                    this.handleUpdateAnnotations();
                else
                    this.handleSaveAnnotations();
                    */
            }
        });

        document.addEventListener('mouseup', e => {
            if(this._isOverCorpusContent){
                //this.textSelection();
            }
        });

    }

    handleSaveAnnotations = () => {
        if(this._AnnotationsSelectedList.length > 0){
            this.updateEntitySelected();
            //Guardo las nuevas anotaciones    
           
            var result = this._annotationsService.addBulk(this._AnnotationsSelectedList);
        

            result.then(result => {

                //muestro las nuevas anotaciones
                this._AnnotationsSelectedList = [];
                this._tmpAnotationSelected.text = "";
                this.showDocumentWithAnnotations();
            });
        }
    }

    handleUpdateAnnotations = () => {
        if(this._annotationsList.length > 0){
            this.updateEntitySelected();
            //Guardo las nuevas anotaciones    
            
            var result = this._annotationsService.updateBulk(this._AnnotationsSelectedList);
        
            result.then(result => {

                //muestro las nuevas anotaciones
                this._AnnotationsSelectedList = [];
                this._tmpAnotationSelected.text = "";
                this.showDocumentWithAnnotations();
            });
        }
    }
    

    //#region Seleccion de entidades y campos en la parte de detalles de la anotacion
    //quitar cuando no sea necesario el picklist de corpus de arriba
   
    updateEntitySelected = () => {
        this._AnnotationsSelectedList.forEach((annSelected) => {
            annSelected.firstEntityId = this._tmpAnotationSelected.firstEntityId;
            annSelected.secondEntityId = this._tmpAnotationSelected.secondEntityId;
            annSelected.firstEntityCode = this._tmpAnotationSelected.firstEntityCode;
            annSelected.secondEntityCode = this._tmpAnotationSelected.secondEntityCode;
            annSelected.fieldsFirstEntity =  this._tmpAnotationSelected.fieldsFirstEntity;
            annSelected.fieldsSecondEntity = this._tmpAnotationSelected.fieldsSecondEntity;
        });
    }
    handleFirstEntitySelected = (e:any) => {
        let entitySelected = -1;
        if(e.target)
            entitySelected = parseInt(e.target.value);
        else
            entitySelected = parseInt(e);
        var firstEntity:Entity|undefined = this.getEntityById(entitySelected);

        if(firstEntity){
            if(e.target){
                this._tmpAnotationSelected.firstEntityId = firstEntity.id!;
                this._tmpAnotationSelected.firstEntityCode = firstEntity.Code;
                this._tmpAnotationSelected.fieldsFirstEntity = [];
            }
            this.firstEntityFieldList = firstEntity.FieldList!;
        }
        else{
            this._tmpAnotationSelected.firstEntityId = -1;
            this._tmpAnotationSelected.firstEntityCode = '';
            this._tmpAnotationSelected.fieldsFirstEntity = [];
            this.firstEntityFieldList = [];
        }
        
        this.forceUpdate();
        /*
        if(e.target){
            console.log(this._tmpAnotationSelected);
            this.updateEntitySelected();
        }
        */
    }

    handleSecondEntitySelected = (e:any) => {
        let entitySelected = -1;
        if(e.target)
            entitySelected = parseInt(e.target.value);
        else
            entitySelected = parseInt(e);

        var secondEntity:Entity|undefined = this.getEntityById(entitySelected);

        if(secondEntity){
            if(e.target){
                this._tmpAnotationSelected.secondEntityId = secondEntity.id!;
                this._tmpAnotationSelected.secondEntityCode = secondEntity.Code;
                this._tmpAnotationSelected.fieldsSecondEntity =[];
            }
            this.secondEntityFieldList = secondEntity.FieldList!;
            
        }
        else{
            this._tmpAnotationSelected.secondEntityId = -1;
            this._tmpAnotationSelected.secondEntityCode = '';
            this._tmpAnotationSelected.fieldsSecondEntity = [];
            this.secondEntityFieldList = [];
        }

        this.forceUpdate();
        //this.updateEntitySelected();
    }

    setFirstField = (e:any, entitySelected:number) => {
        var fieldCodes:string[]|undefined = [];

        if(entitySelected == 1)
        fieldCodes = this._tmpAnotationSelected.fieldsFirstEntity;
        if(entitySelected == 2)
        fieldCodes = this._tmpAnotationSelected.fieldsSecondEntity;

        if(fieldCodes == undefined)
            fieldCodes = [];

        if(e.target.value !== '-1')
        {
            if(fieldCodes.length >= 1 && fieldCodes)
                fieldCodes[0] = e.target.value;

            if(fieldCodes.length == 0 && fieldCodes)
                fieldCodes.push(e.target.value);
        }
        else
        {
            fieldCodes.pop();
        }
        
        console.log(this._tmpAnotationSelected);
    } 


    setSecondField = (e:any, entitySelected:number) => {
        var fieldCodes:string[]|undefined = [];
        
        if(entitySelected == 1)
        fieldCodes = this._tmpAnotationSelected.fieldsFirstEntity;
        if(entitySelected == 2)
        fieldCodes = this._tmpAnotationSelected.fieldsSecondEntity;

        if(fieldCodes == undefined)
            fieldCodes = [];
        if(e.target.value !== '-1')
        {
            if(fieldCodes.length == 2 && fieldCodes)
                fieldCodes[1] = e.target.value;

            if(fieldCodes.length == 1 && fieldCodes)
                fieldCodes.push(e.target.value);
        }else if(fieldCodes.length == 2)
        {
            fieldCodes.pop();
        }
        console.log(this._tmpAnotationSelected);
    } 
    //#endregion

    //#region MANEJADORES DE EVENTOS DE SELECCION Y BUSQUEDA DE ENTIDADES Y FIELDS
    /**
     * Inicia la busqueda de las entidades y campos seleccionados en la lista de entidades
     */
    handleSearchAnnotations = () => {
        this.entityFields = [];

        this.entityList.forEach((entity) => {
            let fieldsSelected: Field[] = entity.FieldList!.filter((field) => field.selected == true);
            let fieldsCodes:string [] = fieldsSelected.map((field) => field.code);
            fieldsCodes.forEach((fieldsCode) => this.entityFields.push(fieldsCode));
        });
        this.showDocumentWithAnnotations(); 
    }

    /**
     * 
     * @param entity 
     * @returns 
     */
     handleCheckSemiSelected = (entity: Entity):boolean => {
        let isSemiSelected: boolean = false;
        let selectedValues = entity.FieldList!.map(field => field.selected);
        let numberOfTrue = selectedValues.filter((value) => value == true).length;
        if(numberOfTrue > 0 && numberOfTrue < entity.FieldList!.length)
            isSemiSelected = true;
        return isSemiSelected;
    }
    handleFieldCheckChange = (field:Field) =>{
        field.selected = !field.selected;
        this.forceUpdate();
    }
    handleEntityCheckChange = (entity:Entity)  => {
        entity.selected = !entity.selected;
            
        entity.FieldList?.forEach((field) => {
            if(entity.selected)
                field.selected = true;    
            else
                field.selected = false;
        });
        this.forceUpdate();
    }
    handleFieldListStatus =  (entityId:Number) => {
        // Check if user has entered the file
        let entityListEmptyDOMElement = document.getElementById("FieldList_" + entityId);
        if(entityListEmptyDOMElement)
        {
            if(entityListEmptyDOMElement.style.display === "block")
                entityListEmptyDOMElement.style.display = "none";
            else
                entityListEmptyDOMElement.style.display = "block";
        }
    }
    //#endregion

    /**
     * Inicializador de carga de un nuevo documento de texto (corpus) para agregar a la lista
     * @param e Evento de selecccion de documento de texto (corpus)
     */
     handleFileChange = (e:any) => {
        // Check if user has entered the file
        if (e.target.files.length) {
            this._parseFileService.parseFiles(e.target.files).then(result => {
                this.initDocuments();
            });
        }
    }

    /**
     * Obtiene el listado de documentos y carga el primero de la lista
     */
    initDocuments = () => {
        var result = this._documentService.getList();
        result.then(res => {
            this.documentList = res? (res as Document[]): ([] as Document[]); 
            if(this.documentList.length > 0){
                this.showDocument(this.documentList[0]);
                this.forceUpdate();
            }
        });
    };  
    /**
     * Muestra el contenido del documento seleccionado en el recuadro de cospus
     * @param doc documento a mostrar
     */
    showDocument = (doc:Document) => {
        //load corpus title
        this._corpusTitleHTML = document.getElementById("document-title")!;
        this._corpusTitleHTML.innerHTML = "";
        this._corpusTitleHTML.insertAdjacentHTML('beforeend', doc.title);
        this._currentDocument = doc;
        this.textPlain = readBinaryContent(this._currentDocument?.textContent);
        //load corpus content
        this.handleSearchAnnotations();
    };

    showDocumentWithAnnotations = () => {
        var corpus_section =document.getElementById("document-container")!;
        corpus_section.innerHTML = "";
        corpus_section.insertAdjacentHTML('beforeend',this.textPlain);
        /*
        var annotationResult = this._annotationsService.getByDocumentId(this._currentDocument?.id!);
        annotationResult.then(annotations => {  
            this._annotationsList = annotations;
          
            let annFilterByFields = annotations.filter((ann) => {
                let first = ann.fieldsFirstEntity!.some((field) => this.entityFields.includes(field)) || this.entityFields.includes('f_WOF_'+ann.firstEntityCode.split('_')[1]+'0');
                let second = ann.fieldsSecondEntity!.some((field) => this.entityFields.includes(field)) || this.entityFields.includes('f_WOF_'+ann.secondEntityCode.split('_')[1]+'0');
                return first || second;
            });
            corpus_section.insertAdjacentHTML('beforeend',convertStringToDOM(corpus_section,this.textPlain,this._AnnotationsSelectedList, annFilterByFields, this.entityList));
  
            const annotationsSpans = Array.from(document.getElementsByClassName('annotated-content'));
            annotationsSpans.forEach(span => {
                span.addEventListener('click', (event) => {
                    event.stopImmediatePropagation();

                    if(!span.getAttribute("id")?.includes("tmp")){
                        var annotationSelectedId = (!span.getAttribute("id")?.includes("tmp"))?parseInt(span.getAttribute("id")!.toString()):undefined;
                        if(annotationSelectedId)
                        {
                            this._annotationsService.get(annotationSelectedId).then(annotation => {
                                if(annotation){
                                    
                                    this._AnnotationsSelectedList = [];
                                    this.handleFirstEntitySelected(annotation.firstEntityId);
                                    this.handleSecondEntitySelected(annotation.secondEntityId);
                                    this._tmpAnotationSelected = annotation;
                                    this._AnnotationSelected = annotation;
                                    this._AnnotationsSelectedList = this._annotationsList.filter((tmpAnnotation) => basicFormatString(tmpAnnotation.text) === basicFormatString(this._tmpAnotationSelected.text));
                                    this.showDocumentWithAnnotations();
                                    console.log(annotation);
                                    console.log(this._AnnotationsSelectedList);
                                    
                                }     
                            });
                        }
                    }else if(span.getAttribute("id")?.includes("tmp")){
                        this._AnnotationsSelectedList = this._AnnotationsSelectedList.filter((tmpAnnotation) => basicFormatString(tmpAnnotation.text) !== basicFormatString(span.getAttribute("keywords")!));    
                        this.showDocumentWithAnnotations();
                    }                    
                  });
            });
            
            this.handleSetScrollCorpus(corpus_section);
        });
        */
    }

    handleSetScrollCorpus = (corpus_section:HTMLElement) => {
        var scrollpos = sessionStorage.getItem('scrollpos');
        if (scrollpos) {
            corpus_section.scrollTo(0,parseFloat(scrollpos));
        }
        this.forceUpdate();
    }

    handleScrollCorpus = (e:any) => {
        e.stopPropagation();
        let documentCorpus = document.getElementById('document-container');
        var scrollpos = sessionStorage.getItem('scrollpos');
        if((!scrollpos && documentCorpus!.scrollTop > 0) || (scrollpos && documentCorpus!.scrollTop > 0))
            sessionStorage.setItem('scrollpos', documentCorpus!.scrollTop!.toString());
    }

    textSelection = () =>{
        var page_content = document.getElementById('document-container')!.innerText;
        var sel = window.getSelection()!;
       
        if(sel.rangeCount != 0)
        {
            var range = sel.getRangeAt(0).cloneRange();
            var markerTextChar = range.cloneContents()!;
          
            if(markerTextChar.textContent!.length > 3){
                var selectedIndex = page_content.indexOf(markerTextChar.textContent!);
    
                this._tmpAnotationSelected.id = undefined;
                this._tmpAnotationSelected.text = markerTextChar.textContent!;
                this._tmpAnotationSelected.start = selectedIndex;
                this._tmpAnotationSelected.end = selectedIndex + markerTextChar.textContent!.length;
                this._tmpAnotationSelected.documentId = this._currentDocument?.id!;

                this.searchAnnotationMatches();
                console.log(this._tmpAnotationSelected)
            }
            else
            {
                sel.removeAllRanges();
            } 
        }
    }

    searchAnnotationMatches = () => {
        //creo las nuevas anotaciones

        if(this._tmpAnotationSelected.text !== "" ){
            this._AnnotationsSelectedList = findNewAnnotationsInText(this._tmpAnotationSelected,this._AnnotationsSelectedList,this.textPlain,this._currentDocument?.id!, this.getEntityById( this._tmpAnotationSelected.firstEntityId), this.getEntityById(this._tmpAnotationSelected.secondEntityId));
            this.showDocumentWithAnnotations();
        }
    } 
    /**
     * Carga de las entitidades cargados en el anotador
     */
    loadEntities = () => {
        var result = this.entityService.getList();
        result.then(res =>
        {
            this.entityList = res? (res as Entity[]): ([] as Entity[]); 
            this.forceUpdate();
        });
    }

    getEntityById = (entityId:number) => {
        var entityInfo:Entity|undefined = undefined;
        if(this.entityList.length> 0)
        {
            entityInfo = this.entityList.find(entity => entity.id == entityId);
        }
        return entityInfo;
    }

    getFieldByCode = (code: string, entityId:number):Field|undefined => {
        var field:Field|undefined = undefined;
        var entity = this.getEntityById(entityId);

        if(entity)
            field = entity.FieldList?.find((field)=> field.code === code);

        
        return field;
    }
    


 

    render(){
        return (
        <div className="container-main" >
            <div id="SideNav" className="area-sidenav">
            <div className="area-tool-container-nav">
                <div id="PlattformImage" className="area-plat-image area-tool">
                    <div className="area-tool-container">
                        <div className="area-details-header">
                        <div className="area-details-header-content">
                            <i className="area-details-title">Documents</i>
                        </div>
                        <div id="area-corpus-separator" className="separator separator-blue"></div>
                    </div>
                        <div className="area-document-list">
                            {
                                this.documentList.map((document) => (
                                    <div onClick={() => { this.showDocument(document); }} className="area-document-item">
                                        {document.title}
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                </div>
                <div id="EntityList" className="area-entity-list area-tool">
                <div className="area-tool-container">
                    <div className="area-details-header">
                    <div className="area-details-header-content">
                        <i className="area-details-title">Entities</i>
                        <button type="button" className="button-option-small button-option-unselected ">
                        <span className="material-symbols-outlined">
                            ios_share
                        </span>
                        </button>
                        <button type="button" className="button-option-small button-option-unselected " onClick={this.handleSearchAnnotations}>
                        <span className="material-symbols-outlined">
                            search
                        </span>
                        </button>
                    </div>
                    <div id="area-corpus-separator" className="separator separator-blue"></div>
                    </div>
                    <div className="area-entities-filter">

                    <button type="button" className="button-option button-option-unselected ">
                        Aa
                    </button>
                    <button type="button" className="button-option button-option-unselected " data-bs-toggle="modal" data-bs-target="#exampleModal">
                        ab
                    </button>
                    </div>
                    <div className="area-entities-list">
                        {
                            this.entityList.map((entity) => (
                            <div className="area-entity-item-container">
                                <div className="area-entity-item">
                                    <Checkbox checked={entity.selected} indeterminate={this.handleCheckSemiSelected(entity)} onChange={() => this.handleEntityCheckChange(entity)} className="area-entity-checkbox"/>
                                  
                                    <div className="area-entity-circle" style={{background: entity.Color}}></div>
                                    <div className="area-entity-data"><span className="area-entity-label">{entity.Entity}</span> </div>
                                    <span onClick={() => this.handleFieldListStatus(entity.id!)} className="material-symbols-outlined  arrow-field-list">
                                                arrow_drop_up
                                                </span>
                                </div>
                                
                                <div id= {'FieldList_' + entity.id?.toString()} className="area-entity-fields-container">
                                    {
                                        entity.FieldList!.map((field) => (
                                            <div className="area-entity-field-item">
                                                <input type="checkbox" checked={field.selected} onChange={() => this.handleFieldCheckChange(field)} className="area-entity-checkbox"/>
                                                <div className="area-entity-data"><span className="area-entity-label">{field.name}</span></div>
                                            </div>
                                        ))
                                    }
                                    
                                </div>
                            </div>
                            ))
                        }
                    </div>
                </div>
                </div>
            </div>
            </div>
            <div className="area-container">
                <div id="Corpus" className="area-corpus area-tool" >
                <div className="area-tool-container" >
                    <div className="area-corpus-header">
                    <div className="area-corpus-header-content">
                        <button className="button-option button-option-unselected"></button>
                        <button className="button-option button-option-selected"></button>
                        <div className="container-input-document">
                                <input type="file" onChange={this.handleFileChange} name="file-1" id="documentFile" accept=".txt" className="inputfile-document inputfile-document-1" />
                                <label htmlFor="documentFile">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="iborrainputfile" width="20" height="17" viewBox="0 0 20 17"><path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"></path></svg>
                                    <span className="iborrainputfile">New Document</span>
                                </label>
                        </div>
                        <i className="area-corpus-title" id="document-title">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</i>
                    </div>
                    <div id="area-corpus-separator" className="separator"></div>
                    </div>
                    <div id="document-container"   onScroll={(e:any) => this.handleScrollCorpus(e)} onMouseOver={() => {this._isOverCorpusContent = true;}} onMouseOut={() => {this._isOverCorpusContent = false;}} className="area-corpus-content"></div>
                </div>
                </div>
                <div id="Table" className="area-table area-tool">
                     
                </div>
                <div id="Details" className="area-details area-tool">
                <div className="area-tool-container">
                    <div className="area-details-header">
                    <div className="area-details-header-content">
                        <i className="area-details-title">Annotation Details</i>
                    </div>
                    <div id="area-corpus-separator" className="separator"></div>
                    </div>
                    <div className="area-details-content">
                    <div className="area-details-info">
                        <div className="area-details-data"><span className="area-details-data-title">Text:</span> {this._AnnotationSelected.text}</div>
                        <div className="area-details-data"><span className="area-details-data-title">First Entity:</span> {this.getEntityById(this._tmpAnotationSelected.firstEntityId)?.Entity}</div>
                        <div className="area-details-data">&emsp; &emsp;<span className="area-details-data-title">First Field:</span> {(this._AnnotationSelected.fieldsFirstEntity!.length >= 1)?this.getFieldByCode(this._tmpAnotationSelected.fieldsFirstEntity![0],this._tmpAnotationSelected.firstEntityId)?.name:'undefined'}</div>
                        <div className="area-details-data">&emsp; &emsp;<span className="area-details-data-title">Second Field:</span> {(this._AnnotationSelected.fieldsFirstEntity!.length >= 2)?this.getFieldByCode(this._tmpAnotationSelected.fieldsFirstEntity![1],this._tmpAnotationSelected.firstEntityId)?.name:'undefined'}</div>
                        <div className="area-details-data"><span className="area-details-data-title">Second Entity:</span> {this.getEntityById(this._tmpAnotationSelected.secondEntityId)?.Entity}</div>
                        <div className="area-details-data">&emsp; &emsp;<span className="area-details-data-title">First Field:</span> {(this._AnnotationSelected.fieldsSecondEntity!.length >= 1)?this.getFieldByCode(this._tmpAnotationSelected.fieldsSecondEntity![0],this._tmpAnotationSelected.secondEntityId)?.name:'undefined'}</div>
                        <div className="area-details-data">&emsp; &emsp;<span className="area-details-data-title">Second Field:</span> {(this._AnnotationSelected.fieldsSecondEntity!.length >= 2)?this.getFieldByCode(this._tmpAnotationSelected.fieldsSecondEntity![1],this._tmpAnotationSelected.secondEntityId)?.name:'undefined'}</div>
                        <div className="area-details-entity-section" id="area-details-first-entity"><span className="mandatory-field">*</span>First Entity</div>
                        <div className="area-details-data">
                            <select id="firstEntitySelected" value={this._tmpAnotationSelected.firstEntityId}   onChange={this.handleFirstEntitySelected} className="select-entity">
                                <option className="select-entity-item" value={-1}>Select an entity</option>
                                {
                                    this.entityList!.map((entity) => (
                                    <option className="select-entity-item" value={entity.id}>{entity.Entity}</option>
                                    ))
                                }
                            </select>

                            <select onChange={(e:any) => {this.setFirstField(e, 1);}}  className="select-entity">
   
                                {
                                    this.firstEntityFieldList.map((field) => {
                                        if(field.name !== 'Without Fields'){
                                          return  (<option className="select-entity-item " value={field.code}>{field.name}</option>)
                                        }
                                        else{
                                          return  (<option selected className="select-entity-item" value={-1}>Select a field</option>)
                                        }
                                    })
                                }
                            </select>
                            <select  onChange={(e:any) => {this.setSecondField(e,1);}} className="select-entity">
                                {
                                    this.firstEntityFieldList.map((field) => {
                                        if(field.name !== 'Without Fields'){
                                         return   (<option className="select-entity-item" value={field.code}>{field.name}</option>)
                                        }
                                        else{
                                         return  (<option selected className="select-entity-item" value={-1}>Select a field</option>)
                                        }
                                    })
                                }
                            </select>
                        </div>
                        <div className="area-details-entity-section" id="area-details-second-entity">Second Entity: {this.getEntityById(this._tmpAnotationSelected.secondEntityId)?.Entity}</div>
                        <div className="area-details-data">
                            <select id="secondEntitySelected"  value={this._tmpAnotationSelected.secondEntityId} onChange={this.handleSecondEntitySelected} className="select-entity">
                                <option className="select-entity-item" value={-1}>Select an entity</option>
                                {
                                    this.entityList!.map((entity) => (
                                    <option className="select-entity-item" value={entity.id}>{entity.Entity}</option>
                                    ))
                                }
                            </select>
                            <select onChange={(e:any) => {this.setFirstField(e, 2);}}  className="select-entity">
   
                                {
                                    this.secondEntityFieldList.map((field) => {
                                        if(field.name !== 'Without Fields'){
                                          return  (<option className="select-entity-item" value={field.code}>{field.name}</option>)
                                        }
                                        else{
                                          return  (<option selected className="select-entity-item" value={-1}>Select a field</option>)
                                        }
                                    })
                                }
                            </select>
                            <select  onChange={(e:any) => {this.setSecondField(e,2);}} className="select-entity">
                                {
                                    this.secondEntityFieldList.map((field) => {
                                        if(field.name !== 'Without Fields'){
                                         return   (<option className="select-entity-item" value={field.code}>{field.name}</option>)
                                        }
                                        else{
                                         return  (<option selected className="select-entity-item" value={-1}>Select a field</option>)
                                        }
                                    })
                                }
                            </select>
                        </div>
                    </div>
                   
                    <div className="area-details-buttons">
                        <button className="button-standard button-standard-success">Save</button>
                        <button className="button-standard button-standard-danger">Delete</button>
                    </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
      );
    }

}

export default Anotador;