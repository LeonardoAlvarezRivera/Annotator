import { Button } from "@mui/material";
import React, {useState} from "react";
import { Entity } from '../objects/Entity.interface';
import { EntitiesService } from "../services/Entities.service";
import { DataGrid, useGridApiRef,GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Field } from "../objects/Field.interface";
import { NewField } from "../tools/FileReader";



export type EntityDetailsProps = {
    EntitySelected:Entity,
    EntityList: Entity[],
    backHomeScreen: () => void,
}






const entityService = new EntitiesService();
const colorList:string[] = ['#d0d176','#e0e096','#f0f0b7','#ffffd7',
                            '#cf4945','#e16b61','#f18b7e','#ffab9d',
                            '#55b758','#78cf77','#99e796','#99e796',
                            '#7dabdf','#a0c6ea','#c1e2f5','#e1ffff',
                            '#c8a088','#debaa5','#ead1c2','#f5e8e0',
                            '#98799c','#b398b7','#ccb8ce','#e5d8e6',
                            '#98c7c7','#b7e7e7','#cff8f8','#e0fbfa',
                        ];

                        

export default function Details (props:EntityDetailsProps)  {

    var entitySelected: Entity = props.EntitySelected;
    var entityFields: Field[] = props.EntitySelected.FieldList!;
    var entityList: Entity[] = props.EntityList;
    const [color, setColor] = useState(entitySelected.Color);
    const apiRef = useGridApiRef();
    const columns: GridColDef[] = [
        {field: 'id'},
        {field: 'code', minWidth: 100},
        {field: 'name', flex: 1, minWidth: 200}
    ];


    
    const updateDataGrid = () => {
        apiRef.current.setRows(entitySelected.FieldList!);              
    };

    const handleUpdateEntity=  () => {
        entityService.update(entitySelected).then(res => {
            updateDataGrid();
        });
    }

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
        if(tmpEntitySelected){ 
            entitySelected = tmpEntitySelected;
            handleUpdateEntity();
            entityFields = entitySelected.FieldList!;
        }

    };

    const handleSaveChanges = (e:any) => {

        e.preventDefault();

        // Read the form data
        const form = e.target;
        const formData = new FormData(form);

        // You can pass formData as a fetch body directly:
        fetch('/some-api', { method: form.method, body: formData });

        // Or you can work with it as a plain object:
        const formJson = Object.fromEntries(formData.entries());

        var entity =  props.EntityList.find((entity) => entitySelected.id == entity.id);
        if(entity) {
            var newEntityName = formJson.entityName.toString();

            if(newEntityName != ''){
                entity.Entity = formJson.entityName.toString();
            }

            entity.Color = color;
            entityService.update(entity).then(res => {
                props.backHomeScreen();
            });
        }
    };

    
    return (

    <div className="area-entity-container">

        
        <div id="entityItemList" className="area-entity-item-list">
        <form  method="post" onSubmit={handleSaveChanges}>
            <div className="entity-selected-buttons">
                <Button type="submit" variant="contained" color="success">save</Button>
            </div>

            <div className="entity-selected-information">
                    <input id="new-field-name" name="entityName" type="text" placeholder="Entity Name"  className="input-entity-add"/>
                    <input type="color" value={color} onChange={e => setColor(e.target.value)} />
            </div>
            </form>

            <div className="entity-selected-fields-container">
                <div className="entity-selected-fields-title">
                    List of fields
                </div>

                <div className="entity-selected-fields-add">
                    <form  method="post" onSubmit={handleAddField}>
                        <input id="new-field-name" name="fieldName" type="text" placeholder="New Field"  className="input-entity-add"/>
                        <Button type="submit" variant="contained" color="primary">Add Field</Button>
                    </form>
                </div>
            </div>
        
            <div className="area-entity-container">
                <div className="area-entity-manager-list">
                    <DataGrid apiRef={apiRef} rows={entityFields} columns={columns} ></DataGrid>
                </div>
            </div>
            
            
        </div>
    </div>
      
    )
}

