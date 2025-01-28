import { dbAnotadorInstance } from "../database/db"
import { Project } from "../objects/Project.interface";

export class ProjectsService{
    constructor (){}

    getList(){
        const result = dbAnotadorInstance.projects.toArray();

        return result;
    }

    getProjectById(projectId: number){
        const result = dbAnotadorInstance.projects.where({id:projectId}).toArray();
        return result;
    }

    update(project: Project){
        const result = dbAnotadorInstance.projects.update(project.id!, project);
        return result;
    }

    add(project:Project){
        const result = dbAnotadorInstance.projects.add(project);
        return result;
    }
}