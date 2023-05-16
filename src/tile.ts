import { MyWorkerMessage, position } from "./utilObjects";

export class Tile{
    //Attributs
    element: Element;
    workers: SharedWorker[] = [];
    nbNeighbour:number = 0;
    alive:boolean = false;
    subgridID! : string;
    positionMainSG!: position; 
    pause:boolean = true;

    //Position relative par rapport à chaque worker
    relPos: position[] = [];


    constructor(element:Element){
        this.element = element;
        this.addEventListener();
    }

    private addEventListener(){

        //this.element.addEventListener("mousedown", this.clickHandler.bind(this));
        this.element.addEventListener("click", this.clickHandler.bind(this));
    }
    private initWorkerListener(worker:SharedWorker){
        worker.port.addEventListener("message",(mes: MessageEvent<MyWorkerMessage>)=>{
            switch (mes.data.type){
                case "nbNeighbour":
                    if(this.subgridID == mes.data.payload.sgID){
                        this.nbNeighbour = mes.data.payload.neigbourArray[this.positionMainSG.y][this.positionMainSG.x];
                    }        
                break;
                case "update":
                    this.testAlive();
                break;
                case "resetNeighbour":
                    this.nbNeighbour = 0;
                break;
                case "pause":
                    this.pause = true;
                break;
                case "start":
                    this.pause = false;
                break;
            }
        });
    }

    private clickHandler(){
        if(this.pause){
            this.born();
        }
    }


    private testAlive(){
        if(!this.alive && this.nbNeighbour==3){
            this.born();
        }else if(this.alive && (this.nbNeighbour > 3 || this.nbNeighbour < 2)){
            this.death();
        }else{
            this.unaffected();
        }
    }

    private born(){
        this.element.classList.add("alive");
        this.alive = true;
        this.workers.forEach((w, index) => {
            w.port.postMessage({type:"turnAlive", payload:{pos:this.relPos[index]}});
        });
    }
    private death(){
        this.element.classList.remove("alive");
        this.alive = false;
        this.workers.forEach((w, index) => {
            w.port.postMessage({type:"turnDead", payload:{pos:this.relPos[index]}});
        });
    }

    private unaffected(){
        this.workers.forEach((w, index) => {
            w.port.postMessage({type:"unaffected", payload:{pos:this.relPos[index]}});
        });
    };

    addWorker(worker:SharedWorker, relativePos:position){
        this.workers.push(worker);
        this.initWorkerListener(worker);
        this.relPos.push(relativePos);
        worker.port.postMessage({type:"initTile", payload:{pos:relativePos, id:this.element.id}});
    }

    setSubgridData(subgridID:string, pos:position){
        this.subgridID = subgridID;
        this.positionMainSG = pos;
        }
}

