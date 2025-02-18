import { Button } from "@mui/material";
import React, { useState } from "react";
import { Project } from "../objects/Project.interface";
import { ProjectsService } from "../services/Projects.service";



export type ProjectDetailsProps = {
    Project:Project,
    backProjectsScreen: () => void,
}

export default function ProjectDetails (props:ProjectDetailsProps)  {
    
   const [name, setName] = useState(props.Project.name);
   const [description, setDescription] = useState(props.Project.description);
   
   const projectService = new ProjectsService();
   var projectSelected: Project = props.Project;
    

    const handleUpdateProject=  () => {
        projectService.update(projectSelected).then(res => {
            props.backProjectsScreen();
        });
    }


    const handleSaveChanges = (e:any) => {

        e.preventDefault();

        // Read the form data
        const form = e.target;
        const formData = new FormData(form);

        // You can pass formData as a fetch body directly:
        fetch('/some-api', { method: form.method, body: formData });

        // Or you can work with it as a plain object:
        const formJson = Object.fromEntries(formData.entries());

        projectSelected.name = formJson.Name.toString();
        projectSelected.description = formJson.Description.toString();

        handleUpdateProject();
    };

    
    return (
        <div className="area-tool-container">
            <div className="area-entities-header">
                <div className="area-entities-header-content">
                    <div  className="entity-selected-data-name"><span className="entity-selected-back" onClick={props.backProjectsScreen}>Projects </span><span> / Details</span></div>     
                </div>
                    <div id="area-corpus-separator" className="separator"></div>
                </div>

            <div  className="area-entities-content">
                <div id="entityItemList" className="area-entity-item-list">
                    <form  method="post" onSubmit={handleSaveChanges}>
                    <div className="entity-selected-buttons">
                        <Button type="submit" variant="contained" color="success">save</Button>
                    </div>

                    <div className="entity-selected-information">
                            <input id="new-field-name" name="Name" type="text" placeholder="Name"  className="input-entity-add input-half" value={name} onChange={(e) => setName(e.target.value)}/>
                            <textarea id="new-field-name" name="Description" rows={4} cols={5} placeholder="Description"  className="input-entity-add  input-full" value={description} onChange={(e) => setDescription(e.target.value)}/>
                    </div>
                    </form>
                    
                </div>
            </div>
        </div>
    


   
      
    )
}

