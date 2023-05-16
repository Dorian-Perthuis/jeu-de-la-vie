export interface MyWorkerMessage {
    type: string;
    payload?: any;
}

export interface subGridSize{
    widthStart?:number,
    heighStart?:number,
    width:number,
    heigh:number
}

export interface position{
    x:number,
    y:number
}

export interface subGridSmallSize{
    sy:number,
    sx:number,
    ey:number,
    ex:number,
}