import { Button } from "@mui/material";
import { DataGrid, useGridApiRef,GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import React, {useState} from "react";

import { Entity } from '../objects/Entity.interface';
import { Field } from "../objects/Field.interface";

import {  NewEntity, NewField, ParseEntitiesCSV, ReadFileToText } from "../tools/FileReader";
import { Props } from "./Anotador";
import { EntitiesService } from '../services/Entities.service';
import Details from "./EntityDetails";





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

export default function EntitiesManager(props:Props){

    const [page, setPage] = useState("entities");
    const [entityId, setEntityId] = useState(entitySelected);
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

        const columns: GridColDef[] = [
            {field: 'id'},
            {field: 'Code', minWidth: 100},
            {field: 'Entity', flex: 1, minWidth: 200},
            {field: 'Color', minWidth: 100,
                renderCell: (params: GridRenderCellParams<any, string>) => 
                (
                    <div className="area-entity-rectangle" style={{background: params.value}}></div>
                )
            },
            {field: 'Fields', minWidth: 100},
            {field: 'Actions', flex: 0.3, minWidth: 200,
                renderCell: (params: GridRenderCellParams<any, number>) => 
                (
                    <Button onClick={()=>{ var result:Entity|undefined = entityList.find((entity) => entity.id == params.id);
                        if(result){
                            entitySelected = result;
                            SetFieldsId();
                            setEntityId(entitySelected);
                            setPage("details");
                        }
                    }}>Edit</Button>
                )}
        ];

        const SetFieldsId = () => {

            entitySelected.FieldList!.forEach((field, index) => {
                if(!field.id)
                {
                    field.id = index + 1;
                }
            });
        };
        const updateDataGrid = () => {
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

        const handleBackHome=  () => {
            setPage("entities");
            handleLoadEntities(0);
            
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
        }else{
            handleLoadEntities(0);
        }
     
        return (
            <div className="area-tool-container">
                <div className="area-entities-header">
                <div className="area-entities-header-content">
                     { page === "entities" && <i className="area-entities-title">Entities Manager</i>}
                     { page === "details" &&
                                <div  className="entity-selected-data-name"><span className="entity-selected-back" onClick={handleBackHome}>Entity List </span><span> / {entityId.Entity}</span></div>
                     }
                </div>
                    <div id="area-corpus-separator" className="separator"></div>
                </div>

                {page === "entities" &&
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
                    </div>
                </div>
                }
                {
                    page === "details" && <Details EntitySelected={entityId} EntityList={entityList} backHomeScreen={handleBackHome}/>
                }
            </div>
        );
};

