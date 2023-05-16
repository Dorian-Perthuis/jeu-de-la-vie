import { MyWorkerMessage, subGridSize, subGridSmallSize } from "./utilObjects";

let ID: string;
let tiles : Array<Array<TileWorker>> = [];
let tileNeigbours : Array<Array<number>> = [];

let getSize:subGridSize;
let sendSize: subGridSmallSize;
let subgridPort:MessagePort;
let tilesPort:MessagePort;
let isTileAlive: boolean;
let isUpdating:boolean;



addEventListener('connect', (event:any) => {
    const port = event.ports[0];
    port.start();

    port.addEventListener('message', (mes: MessageEvent<MyWorkerMessage>) => {
        switch (mes.data.type){
            case "init":
                subgridPort = port;
                ID = mes.data.payload.id;
                getSize = mes.data.payload.bigSize;
                sendSize = mes.data.payload.smallSize;
                tiles = [...Array(getSize.heigh)].map(() => Array(getSize.width).fill(undefined));
                tileNeigbours = [...Array(getSize.heigh)].map(()=> Array(getSize.width).fill(0));
            break;
            case "start":

                tilesPort.postMessage({type:"start"});
            break;
            case "pause":
                tilesPort.postMessage({type:"pause"});
            break;
            case "initTile":
                tilesPort = port;
                let tile: TileWorker = {
                    id:mes.data.payload.id,
                    isAlive: false,
                    nbNeigbour: 0,
                    pos:{
                        x:mes.data.payload.pos.x,
                        y:mes.data.payload.pos.y
                    }
                };
                tiles[mes.data.payload.pos.y][mes.data.payload.pos.x] = tile;
            break;
            case "turnAlive":
                setTileAlive(mes.data.payload.pos.y, mes.data.payload.pos.x, true);
            break;
            case "turnDead":
                setTileAlive(mes.data.payload.pos.y, mes.data.payload.pos.x, false);
            break;
            case "unaffected":
                let x = mes.data.payload.pos.x; 
                let y = mes.data.payload.pos.y; 
                setTileAlive(y, x, tiles[y][x].isAlive);
            break;
            case "calculNeighbour":
                calculNeighbour();
            break;
            case "updateTile":
                isTileAlive = false;
                isUpdating = true;
                tilesPort.postMessage({type:"update"});
            break;
            case "updateActive":
                updateActive();
            break;
            default:
                console.log(`Erreur message type : ${mes.data.type}`);
            break;
        }
    });
});

function calculNeighbour(){
        resetNeighbour();
        calcNeighbour();
        sendNeighbour();
        subgridPort.postMessage({type:"calculFinish"});
}

function calcNeighbour(){
    for(let i=0; i<getSize.heigh;i++){
        for(let j=0; j <getSize.width;j++){
            if(tiles[i][j].isAlive){
                shareNeighbour(tiles[i][j].pos.x, tiles[i][j].pos.y);
            }
        }
    }
}

function sendNeighbour(){
    tilesPort.postMessage({type:"nbNeighbour", payload:{sgID:ID, neigbourArray:tileNeigbours}})
}

function resetNeighbour(){
    tileNeigbours = [...Array(getSize.heigh)].map(()=> Array(getSize.width).fill(0));
}

function setTileAlive(y:number, x:number, state:boolean){
    tiles[y][x].isAlive = state;

    if(state && !isTileAlive){
        isTileAlive = true;
        subgridPort.postMessage({type:"active"});
    }

    if(y === getSize.heigh-1 && x === getSize.width-1 && isUpdating){
        isUpdating = false;
        subgridPort.postMessage({type:"updatedTile"});
    }
}

function updateActive(){
    if(!isTileAlive){
        subgridPort.postMessage({type:"inactive"});
    }
    subgridPort.postMessage({type:"updatedActive"});
}


function shareNeighbour(x:number, y:number){
    if(x-1 >= 0 && y-1 >=0){
        tileNeigbours[y-1][x-1] += 1;
    }    
    if(y-1 >= 0){
        tileNeigbours[y-1][x] += 1;
    }
    if(x+1 < getSize.width && y-1 >=0){
        tileNeigbours[y-1][x+1] +=1;
    }
    if(x+1 < getSize.width){
        tileNeigbours[y][x+1] +=1;
    }
    if(x+1 < getSize.width && y+1 < getSize.heigh){
        tileNeigbours[y+1][x+1] +=1;
    }
    if(y+1 < getSize.heigh){
        tileNeigbours[y+1][x] +=1;
    }
    if(x-1 >= 0 && y+1 < getSize.heigh){
        tileNeigbours[y+1][x-1] +=1;
    }    
    if(x-1 >= 0){
        tileNeigbours[y][x-1] +=1;
    }
}

interface TileWorker{
    id:string,
    isAlive:boolean,
    nbNeigbour: number,
    pos:point
}

interface point{
    x:number,
    y:number
}