import React from "react";
import { Checkbox } from "@mui/material";
import { Annotation } from "../objects/Annotation.interface";
import { Entity } from "../objects/Entity.interface";
import { Document } from '../objects/Document.interface';
import { Props } from "./Anotador";
import { EntitiesService } from '../services/Entities.service';
import CorpusComponent from "./ContextMenuHandler";
import { AnnotationService } from "../services/Annotations.service";
import { DocumentService } from "../services/Documents.service";
import { FileParser } from "../tools/FileParser";
import { Field } from "../objects/Field.interface";
import { basicFormatString, convertStringToDOM, findNewAnnotationsInText, readBinaryContent } from "../tools/Utils";
import { ComunicationService } from "../notifications/comunication.service";





class Anotator extends React.Component<Props>{

    
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

    isTagSelected:boolean = false;

    _statusClickSave: number = 0;
    textPlain:string = '';
    entityFields: string[] = [];

    private entityService = new EntitiesService();
    private _documentService = new DocumentService();
    private _annotationsService = new AnnotationService();
    private _communicationService = new ComunicationService();
    private _parseFileService: FileParser = new FileParser();

    entityList: Entity[]=[];
    documentList: Document[] = [];

    firstEntityFieldList:Field[] = [];
    currentFirstEntitySecondField:string = '-1';
    currentFirstEntityFirstField:string = '-1';
    secondEntityFieldList:Field[] = [];

    

    constructor(props:Props){
        super(props);
        if(this.entityList.length === 0)
        {
            this.loadEntities();
        }

        this.initDocuments();

        document.addEventListener('keyup', e  => {
            e.stopPropagation();
            if(e.ctrlKey && e.key === 's'){
                this.handleSaveDraftAnnotations();
            }
        });

        document.addEventListener('mouseup', e => {
            e.stopPropagation();
            //e.stopImmediatePropagation();

            if(this.handleGetIsOverCorpus()){
                this.textSelection();
            }
            else
             this.isTagSelected = false;
             
        });

        this._communicationService.currentRefreshStatus.subscribe(status => {
            if(status)
            {
                this.showDocumentWithAnnotations();
            }
        });
    
    }

    handleSaveDraftAnnotations = () => {
        if(this._AnnotationsSelectedList.length > 0){
            this.updateDraftStatusSelected();
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

    updateDraftStatusSelected = () =>{
        this._AnnotationsSelectedList.forEach((annSelected) => {
            annSelected.status = 'Saved';
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
        
        if(e.target){
            console.log(this._tmpAnotationSelected);
            this.updateEntitySelected();
        }
        
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

        if(entitySelected === 1)
        fieldCodes = this._tmpAnotationSelected.fieldsFirstEntity;
        if(entitySelected === 2)
        fieldCodes = this._tmpAnotationSelected.fieldsSecondEntity;

        if(fieldCodes === undefined)
            fieldCodes = [];

        if(e.target.value !== '-1')
        {
            if(fieldCodes.length >= 1 && fieldCodes)
                fieldCodes[0] = e.target.value;

            if(fieldCodes.length === 0 && fieldCodes)
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
        
        if(entitySelected === 1)
        fieldCodes = this._tmpAnotationSelected.fieldsFirstEntity;
        if(entitySelected === 2)
        fieldCodes = this._tmpAnotationSelected.fieldsSecondEntity;

        if(fieldCodes === undefined)
            fieldCodes = [];
        if(e.target.value !== '-1')
        {
            if(fieldCodes.length === 2 && fieldCodes)
                fieldCodes[1] = e.target.value;

            if(fieldCodes.length === 1 && fieldCodes)
                fieldCodes.push(e.target.value);
        }else if(fieldCodes.length === 2)
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
            let fieldsSelected: Field[] = entity.FieldList!.filter((field) => field.selected === true);
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
        let numberOfTrue = selectedValues.filter((value) => value === true).length;
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
        
        
        var annotationResult = this._annotationsService.getByDocumentId(this._currentDocument?.id!);
        annotationResult.then(annotations => {  
            this._annotationsList = annotations;
          
            let annFilterByFields = annotations.filter((ann) => {
                let first = ann.fieldsFirstEntity!.some((field) => this.entityFields.includes(field)) || this.entityFields.includes('f_WOF_'+ann.firstEntityCode.split('_')[1]+'0');
                let second = ann.fieldsSecondEntity!.some((field) => this.entityFields.includes(field)) || this.entityFields.includes('f_WOF_'+ann.secondEntityCode.split('_')[1]+'0');
                return first || second && ann.status === 'Saved';
            });



            let draftAnnotations = annotations.filter((ann)=> {
                return ann.status === 'Draft';
            });

            this.refreshCurrentAnnotation();

            this._AnnotationsSelectedList = draftAnnotations;
            var corpusText = convertStringToDOM(corpus_section,this.textPlain,this._AnnotationsSelectedList, annFilterByFields, this.entityList);
            corpus_section.innerHTML = "";
            corpus_section.insertAdjacentHTML('beforeend',corpusText);
            const annotationsSpans = Array.from(document.getElementsByClassName('annotated-content'));
            annotationsSpans.forEach(span => {
                span.addEventListener('click', (event:any) => {
                    
                
                     this.isTagSelected = true;
                    
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
                                    
                                }     
                            });
                        }
                    }else if(span.getAttribute("id")?.includes("tmp")){
                        console.log('remover anotacion');
                        this._AnnotationsSelectedList = this._AnnotationsSelectedList.filter((tmpAnnotation) => basicFormatString(tmpAnnotation.text) !== basicFormatString(span.getAttribute("keywords")!));    
                        this.showDocumentWithAnnotations();
                    }                    
                  });
            });
            
            

            this.handleSetScrollCorpus(corpus_section);
        });
        
    }

    refreshCurrentAnnotation = () => {
        if(this._tmpAnotationSelected.id){
         
            this._annotationsService.get(this._tmpAnotationSelected.id).then(annotation => {
                if(annotation){
                    this.handleFirstEntitySelected(annotation.firstEntityId);
                    this.handleSecondEntitySelected(annotation.secondEntityId);
                    this._tmpAnotationSelected = annotation;
                    this._AnnotationSelected = annotation;  

                }   
                
                this.showDocumentWithAnnotations();
            });
        }
    };

    handleShowAnnotations = () => this.showDocumentWithAnnotations();

    handleSetScrollCorpus = (corpus_section:HTMLElement) => {
        var scrollpos = sessionStorage.getItem('scrollpos');
        if (scrollpos) {
            corpus_section.scrollTo(0,parseFloat(scrollpos));
        }
        this.forceUpdate();
    }

    handleGetIsOverCorpus = ():boolean => {
        var result:boolean = false;
        var isOver = sessionStorage.getItem('isOverCorpus');
        if (isOver) {
            if(isOver === 'true')
                result = true;
        }


        return result;
    }

    textSelection = () =>{
        var page_content = document.getElementById('document-container')!.innerText;
        var sel = window.getSelection()!;
       
        if(sel.rangeCount !== 0)
        {
            var range = sel.getRangeAt(0).cloneRange();
            var markerTextChar = range.cloneContents()!;
          
            if(markerTextChar.textContent!.length >= 2){
                var selectedIndex = page_content.indexOf(markerTextChar.textContent!);
    
                this._tmpAnotationSelected.id = undefined;
                this._tmpAnotationSelected.text = markerTextChar.textContent!;
                this._tmpAnotationSelected.start = selectedIndex;
                this._tmpAnotationSelected.end = selectedIndex + markerTextChar.textContent!.length;
                this._tmpAnotationSelected.documentId = this._currentDocument?.id!;

                this.searchAnnotationMatches();
            }
            else
            {
                sel.removeAllRanges();
            } 
        }
    }

    searchAnnotationMatches = () => {
        //creo las nuevas anotaciones
        this._AnnotationsSelectedList = [];
        if(this._tmpAnotationSelected.text !== "" ){
            this._AnnotationsSelectedList = findNewAnnotationsInText(this._tmpAnotationSelected,this._AnnotationsSelectedList,this.textPlain,this._currentDocument?.id!, this.getEntityById( this._tmpAnotationSelected.firstEntityId), this.getEntityById(this._tmpAnotationSelected.secondEntityId));
            this.handleSaveAnnotations();
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
            entityInfo = this.entityList.find(entity => entity.id === entityId);
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
      

    render(): React.ReactNode {
        
        return(<div className="container-main" onContextMenu={(e:any) => {e.preventDefault();}}>
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
                                <Checkbox size="small" checked={entity.selected} indeterminate={this.handleCheckSemiSelected(entity)} onChange={() => this.handleEntityCheckChange(entity)} className="area-entity-checkbox"/>
                                
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
            
            <CorpusComponent Entities={this.entityList} refreshData={this.refreshCurrentAnnotation} Annotation={this._tmpAnotationSelected} tagSelected={this.isTagSelected} AnnotationList={this._annotationsList} AnnotationsSelected={this._AnnotationsSelectedList} showAnnotations={this.handleShowAnnotations} handleNewDocument={this.handleFileChange}/>
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
                </div>
                </div>
            </div>
            </div>
        </div>
    </div>
    );
    }
}

export default Anotator;

