import {BehaviorSubject} from 'rxjs';

export class ComunicationService{
    bndRefreshAnnotations: boolean = false;
    private refreshStage = new BehaviorSubject(this.bndRefreshAnnotations);
    currentRefreshStatus = this.refreshStage.asObservable();

    constructor(){}

    refreshAnnotations(bnd: boolean){
        this.refreshStage.next(bnd);
    }
}