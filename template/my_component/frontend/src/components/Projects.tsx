import { Project } from '../objects/Project.interface';
import { ProjectsService } from "../services/Projects.service";
import React from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import EntitiesManager from "./EntitiesManager";
import Anotator from './Anotator';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { TextField } from '@mui/material';
import ProjectDetails from './ProjectDetails';


export type DefaultProps = {
   Component : string
   };
class Projects extends React.Component<DefaultProps, {page:string, openDialog:boolean}>{

    
    //services
    private _projectService =  new ProjectsService();
    
    //object lists
    _projectList:Project[] = [];
    _selectedProject: Project =  {
        name: "",
        description: ""
    };


    constructor (props: DefaultProps){
        super(props);
        this.state = {
         page: 'projects',
         openDialog: false   
        }
        this.initProjects();
        
    }

    //init

    initProjects = () => {
        var result = this._projectService.getList();
        result.then(res => {
            this._projectList = res? (res as Project[]): ([] as Project[]);
            if(this._projectList.length > 0)
            {
                this.forceUpdate();
            }
        
            this.forceUpdate();
        });
    }

    openCorpus = (project:Project) => {
        this._selectedProject = project;
        this.setState({ page: 'annotations'});
    }

    openProject = (project:Project) => {
        this._selectedProject = project;
        this.setState({ page: 'project'});
    }

    openProjects = ()=>{
        this.setState({page: 'projects', openDialog: false});
    }

    openEntities = (project:Project) => {
        this._selectedProject = project;
        this.setState({ page: 'entitiesManager', openDialog:false});
    }

    handleClickOpen = () => {
        this.setState({openDialog:true});
      };
    
    handleClose = () => {
        this.setState({openDialog:false});
      };
    render(): React.ReactNode{
        return (
            
            <div className="area-tool-container">
                {
                    this.state.page === "projects" && <div className="area-tool-container">
                    <Dialog
                        open={this.state.openDialog}
                        onClose={this.handleClose}
                        PaperProps={{
                        component: 'form',
                        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                            event.preventDefault();
                            const formData = new FormData(event.currentTarget);
                            const formJson = Object.fromEntries((formData as any).entries());
                            const projectName = formJson.name;
                            const projectDescription = formJson.description;
                            var resultAdd = this._projectService.add({name: projectName, description: projectDescription});

                            resultAdd.then(res => {
                                this.initProjects();
                                this.handleClose();
                            });
                            
                        },
                        }}
                    >
                        <DialogTitle>New Project</DialogTitle>
                        <DialogContent>
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="name"
                            name="name"
                            label="Name"
                            type="text"
                            fullWidth
                            variant="standard"
                        />
                        <TextField
                            
                            margin="dense"
                            id="description"
                            name="description"
                            label="Description"
                            type="text"
                            fullWidth
                            variant="standard"
                        />
                        </DialogContent>
                        <DialogActions>
                        <Button onClick={this.handleClose}>Cancel</Button>
                        <Button variant='contained' type="submit">Create</Button>
                        </DialogActions>
                    </Dialog>
                    <div className="area-entities-header">
                    <div className="area-entities-header-content">
                        <i className="area-entities-title">Projects</i>
                        <div style={{display: 'contents', width: '100%', height: 'fit-content'}} className='area-projects-button-add'>
                            <Button style={{position: 'absolute', right: '15px', top: '30px'}} variant="contained"  size='small' onClick={this.handleClickOpen}>
                                New Project
                            </Button>
                        </div>
                        
                    </div>
                        <div id="area-corpus-separator" className="separator"></div>
                    </div>
                    <Box 
                        sx={{
                            width: '100%',
                            display: 'grid',
                            margin: '10px',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))',
                            gap: 2, 
                        }}
                    >
                        {
                            this._projectList.map((project,index) => (
                                <Card sx = {{
                                    heigth: '100%'
                                }}>
                                    
                                        <CardContent onClick={() => this.openProject(project)} sx={{ height: 'fit-content' }}>
                                            <Typography variant="h5" component="div">
                                                {project.name}
                                            </Typography>
                                            <Typography variant="body2" style={{height: '41px'}} component="div">
                                                {project.description}
                                            </Typography>
                                        </CardContent>
                                        <CardActions>
                                        <Button 
                                            variant="outlined"
                                            onClick={() => this.openCorpus(project)}
                                            size="small">
                                                Corpus
                                        </Button>
                                        <Button 
                                            variant="outlined"
                                            onClick={() => this.openEntities(project)}
                                            size="small">
                                                Entities
                                        </Button>
                                    </CardActions>   
                                </Card>        
                            ))
                        }
                        
                    </Box>
            
                    </div>
                }
                {
                    this.state.page === "entitiesManager" && <EntitiesManager Project={this._selectedProject} backProjects= {this.openProjects}/>
                }
                {
                    this.state.page === "annotations" && <Anotator Project={this._selectedProject} backProjects= {this.openProjects} />
                }

{
                    this.state.page === "project" && <ProjectDetails Project={this._selectedProject} backProjectsScreen= {this.openProjects} />
                }
            </div>
        );
    }
}

export default Projects;