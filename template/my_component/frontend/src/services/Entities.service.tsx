import { dbAnotadorInstance } from "../database/db";
import { Entity } from "../objects/Entity.interface";

export class EntitiesService{
    constructor (){}

    getList(id:number){
        const result = dbAnotadorInstance.entities.where({projectId: id}).toArray();

        return result;
    }

    getEntityById(entityId:number){
        const result = dbAnotadorInstance.entities.where({id:entityId}).toArray();
        return result;
    }

    update(entity: Entity){
        const result = dbAnotadorInstance.entities.update(entity.id!, entity);
        return result;
    }

    add(entity:Entity){
        const result = dbAnotadorInstance.entities.add(entity);
        return result;
    }

    async addSet(entities: Entity[]):Promise<number>{
        return await dbAnotadorInstance.entities.bulkAdd(entities).then(res => {return res;})
    }
    delete(key:number)
    {
        const result = dbAnotadorInstance.entities.delete(key);
        return result;
    }
}