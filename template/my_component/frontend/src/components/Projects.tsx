import { Project } from "../objects/Project.interface";
import { ProjectsService } from "../services/Projects.service";
import { Props } from "./Anotador";
import React from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";



class Projects extends React.Component<Props>{

    //services
    private _projectService =  new ProjectsService();
    
    //object lists
    private projectList:Projects[] = [];


    constructor (props: Props){
        super(props);
    }

    //init
    this.initProjects();

    initProjects = () => {
        var result = this._projectService.getList();
        result.then(res => {
            this.projectList = res ? (res as Project[]): ([] as Project[])
            if(this.projectList.length > 0)
            {
                this.forceUpdate();
            }
        });
    }

    openProject = (id:number) => {

    }



    render(): React.ReactNode{
        return (
            <div className="projects-container">
                <Box 
                    sx={{
                        width: '100%',
                        display: 'grid',
                        gridTemplateColums: 'repeat(auto-fill,minmax(min(200px,100%), 1fr))',
                        gap: 2, 
                    }}
                >
                    {
                        this.projectList.map((project,index) => {
                            <Card>
                                <CardActionArea
                                    onClick = {() => this.openProject(project.id!)}
                                    sx = {{
                                        heigth: '100%'
                                    }}
                                >
                                    <CardContent sx={{ height: '100%' }}>
                                        <Typography variant="h5" component="div">
                                            {project.name}
                                        </Typography>
                                        <Typography variant="body2" component="div">
                                            {project.description}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>        
                        })
                    }
                    
                </Box>
            </div>
        );
    }
}