import { Button } from "@mui/material";
import { DataGrid, useGridApiRef,GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import React, { useState } from "react";

import { Entity } from '../objects/Entity.interface';
import { Field } from "../objects/Field.interface";

import { getEntityColor, NewEntity, NewField, ParseEntitiesCSV, ReadFileToText } from "../tools/FileReader";
import { Props } from "./Anotador";
import { EntitiesService } from '../services/Entities.service';
import { Annotation } from "../objects/Annotation.interface";




const entityService = new EntitiesService();

var entityList: Entity[] = [];
var entitySelected: Entity = {
    id: 0,
    Entity: "Mobility",
    Code: "e_1",
    Color: "#d0d176",
    Fields: 3,
    FieldList: [],
    Actions: 0,
    selected: true
};



const colorList:string[] = ['#d0d176','#e0e096','#f0f0b7','#ffffd7',
                            '#cf4945','#e16b61','#f18b7e','#ffab9d',
                            '#55b758','#78cf77','#99e796','#99e796',
                            '#7dabdf','#a0c6ea','#c1e2f5','#e1ffff',
                            '#c8a088','#debaa5','#ead1c2','#f5e8e0',
                            '#98799c','#b398b7','#ccb8ce','#e5d8e6',
                            '#98c7c7','#b7e7e7','#cff8f8','#e0fbfa',
                        ];

const columns: GridColDef[] = [
    {field: 'id'},
    {field: 'Entity', width: 200},
    {field: 'Color', width: 100,
        renderCell: (params: GridRenderCellParams<any, string>) => 
        (
            <div className="area-entity-rectangle" style={{background: params.value}}></div>
        )
    },
    {field: 'Fields', width: 100},
    {field: 'Actions', width: 200,
        renderCell: (params: GridRenderCellParams<any, number>) => 
        (
            <Button onClick={()=>{ var result:Entity|undefined = entityList.find((entity) => entity.id == params.id);
                if(result){
                    entitySelected = result;
                    showEntityInfo();
                }
            }}>Edit</Button>
        )}
];

const createEntityFields = (entityFields:Field[]) =>{
    let entityFieldDOMElement = document.getElementById("entity-selected-fields");
    if (entityFieldDOMElement){
        entityFieldDOMElement.innerHTML = '';
        entityFields.forEach((field) =>{
            let fieldContainer =  document.createElement('div');
            fieldContainer.setAttribute("class", "entity-rounded-pill");
            
            let fieldData = document.createElement('div');
            fieldData.setAttribute("class", "entity-field-name");
            fieldData.innerHTML = field.name;

            fieldContainer.append(fieldData);
            
            entityFieldDOMElement?.append(fieldContainer);
        }); 
 
    } 

};

const showEntityInfo = () =>
{
    if(validateExistsEntities())
    {
        let name = document.getElementById("entityName");
        if (name) name.innerHTML = entitySelected.Entity;
    
        let color = document.getElementById("entityColor");
        if (color) color.style.background = entitySelected.Color;
    
        let colorHEX = document.getElementById("entityColorHEX");
        if (colorHEX) colorHEX.innerHTML = entitySelected.Color;
    
        createEntityFields(entitySelected.FieldList!);
    }
};

const validateExistsEntities = ():boolean =>
{
    let entityListEmptyDOMElement = document.getElementById("entityEmptyList");
    let entityListDOMElement = document.getElementById("entityItemList");

    if(entityList.length == 0){
        if(entityListDOMElement && entityListEmptyDOMElement)
        {
            entityListDOMElement.style.display = "none";
            entityListEmptyDOMElement.style.display = "block";
        }
        return false;
    }
    else{
        if(entityListDOMElement && entityListEmptyDOMElement)
        {
            entityListDOMElement.style.display = "block";
            entityListEmptyDOMElement.style.display = "none";
        }
        return true;
    }
};

export default function EntitiesManager(props:Props){
        const apiRef = useGridApiRef();
        entitySelected = {
            id: 0,
            Entity: "Mobility",
            Code: "e_1",
            Color: "#ffffff",
            Fields: 3,
            FieldList: [],
            Actions: 0,
            selected: true
        };

        const updateDataGrid = () => {
            showEntityInfo();
            apiRef.current.setRows(entityList);              
        };


        const handleLoadEntities =  (entityId:number) => {
            var result = entityService.getList();
            result.then(res =>
                {
                    const allEntities = res? (res as Entity[]): ([] as Entity[]); 
                    entityList = allEntities;
                    let foundResult = entityList.find((entity) => entity.id == entityId);
                    if(foundResult) entitySelected = foundResult;
                    else
                        entitySelected = entityList[0];
                    updateDataGrid();
                });
        
        }

        const handleUpdateEntity=  (e:any) => {
            apiRef.current.updateRows([{id: entitySelected.id, Color: e.target.value}]);
            var entity =  entityList.find((entity) => entitySelected.id == entity.id);
            if(entity) {
                entity.Color = e.target.value;
                entityService.update(entity).then(res => {
                    handleLoadEntities(entity!.id!);
                });
            }
            showEntityInfo();
        }

        const handleAddEntity = (e:any) => {
            // Prevent the browser from reloading the page
            e.preventDefault();

            // Read the form data
            const form = e.target;
            const formData = new FormData(form);

            // You can pass formData as a fetch body directly:
            fetch('/some-api', { method: form.method, body: formData });

            // Or you can work with it as a plain object:
            const formJson = Object.fromEntries(formData.entries());
            
            var newEntity = NewEntity(formJson.entityName.toString(), entityList);
            entityService.add(newEntity).then(res => {
                handleLoadEntities(res);
            });
          };

        const handleAddField = (e:any) => {
            // Prevent the browser from reloading the page
            e.preventDefault();

            // Read the form data
            const form = e.target;
            const formData = new FormData(form);

            // You can pass formData as a fetch body directly:
            fetch('/some-api', { method: form.method, body: formData });

            // Or you can work with it as a plain object:
            const formJson = Object.fromEntries(formData.entries());
            
            entityList = NewField(formJson.fieldName.toString(), entityList, entitySelected);
            let tmpEntitySelected = entityList.find((entity) => entity.id == entitySelected.id);
            if(tmpEntitySelected) entitySelected = tmpEntitySelected;
         
            updateDataGrid();
          };

        const handleFileChange = async (e:any) => {
            // Check if user has entered the file
            if (e.target.files.length) {
                const inputFile = e.target.files[0];
    
                var csvContent = await ReadFileToText(inputFile);
                entityList = ParseEntitiesCSV(csvContent);
                await entityService.addSet(entityList);

                handleLoadEntities(0);
            }
        }

        if(props.EntityList){
            entityList = props.EntityList;
            entitySelected = entityList[0];
            showEntityInfo();
        }else{
            handleLoadEntities(0);
        }
     
        return (
            <div className="area-tool-container">
                <div className="area-entities-header">
                <div className="area-entities-header-content">
                    <i className="area-entities-title">Entities Manager</i>
                </div>
                    <div id="area-corpus-separator" className="separator"></div>
                </div>
                <div className="area-entities-content">
                    <div className="area-entities-inputs">
                        <div className="area-entities-manual">
                            <form method="post" onSubmit={handleAddEntity}>
                                <input 
                                    id="new-entity-name" 
                                    name="entityName"
                                    className="input-anotador-text input-entity-add" 
                                    type="text"
                                    placeholder="Name"/>
                                <button type="submit" className="button-standard button-standard-success ">Add</button>
                            </form>
                        </div>
                        <div className="area-entities-import">
                            <div className="container-input">
                                <input onChange={handleFileChange} type="file" name="file-1" id="entitiesFile" accept=".csv" className="inputfile inputfile-1" />
                                <label htmlFor="entitiesFile">
                                <svg xmlns="http://www.w3.org/2000/svg" className="iborrainputfile" width="20" height="17" viewBox="0 0 20 17"><path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"></path></svg>
                                <span className="iborrainputfile">Seleccionar archivo</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="area-entity-container">
                        <div className="area-entity-manager-list">
                            <DataGrid apiRef={apiRef} rows={entityList} columns={columns} ></DataGrid>
                        </div>
                        <div id="entityEmptyList">
                            Without Entities please add some record to use Anotador Tool.
                        </div>
                        <div id="entityItemList" className="area-entity-item-list" style={{display: "none"}}>
                            <div  className="entity-selected-data-name"><span id="entityName"></span></div>
                            <div  className="entity-container-selected-color">
                                    <div className="entity-color-data">
                                        <div className="data-field-container">
                                            <div className="entity-selected-data"><span className="entity-selected-info">Color:</span></div>
                                            <div id="entityColor" className="area-entity-rectangle" style={{background: entitySelected.Color}}></div>
                                        </div>
                                        <div className="data-field-container">
                                            <div className="entity-selected-data"><span className="entity-selected-info">HEX:</span></div>
                                            <div id="entityColorHEX" className="entity-selected-data">{entitySelected.Color}</div>
                                        </div>
                                    </div>
                                    <div  id="entity-color-list" className="entity-color-list">
                                    {
                                        colorList.map((item,index) => (
                                            <input key={'key_color_'+index} type="button" value={item} onClick={handleUpdateEntity} className="entity-color-item" style={{background: item}}></input>
                                        ))
                                    }
                                </div>
                            </div>
                            
                            <form method="post" onSubmit={handleAddField}>
                                <input id="new-field-name" name="fieldName" type="text" placeholder="New Field"  className="input-entity-add"/>
                                <button type="submit" className="button-standard button-standard-success ">Add Field</button>
                            </form>
                       
                            <div  id="entity-selected-fields" className="entity-selected-fields">

                                {
                                    entitySelected.FieldList!.map((field, index) => (
                                        <div key={'key_field_'+index} className="entity-rounded-pill">
                                            <div className="entity-field-name">{field.name}</div>
                                            <div className="entity-field-name"></div>
                                        </div>
                                    ))
                                }
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>
        );
};

