import { GameGrid } from "./gameGrid";

let root = document.documentElement;
let playground = document.getElementsByClassName("playground")[0];
let btnPause = document.getElementById("btnPause")!;
let btnStart = document.getElementById("btnStart")!;
let gameGrid = new GameGrid(playground, 15, 5);
let tileSize = 30;

btnPause.addEventListener("click", () => {
    gameGrid.setPause();
});
btnStart.addEventListener("click", () =>{
    gameGrid.setStart();
});

document.addEventListener("wheel", (e) => {
    if (e.deltaY < 0) {
        console.log("wheel down");
        tileSize +=3;
        root.style.setProperty("--tileSize", tileSize + "px");
    }else{
        console.log("wheel up");
        tileSize -=3;
        root.style.setProperty("--tileSize", tileSize + "px");
    }  
});

document.addEventListener("keypress", (e)=> {
    if (e.key === "z") {
    const currentTop = parseInt((<HTMLElement>playground).style.top) || 0;
    (<HTMLElement>playground).style.top = currentTop + 10 + "px";
    }

    if(e.key === "s"){
    const currentTop = parseInt((<HTMLElement>playground).style.top) || 0;
    (<HTMLElement>playground).style.top = currentTop - 10 + "px";
    }

    if(e.key === "q"){
    const currentLeft = parseInt((<HTMLElement>playground).style.left) || 0;
    (<HTMLElement>playground).style.left = currentLeft + 10 + "px";
    }

    if(e.key === "d"){
    const currentLeft = parseInt((<HTMLElement>playground).style.left) || 0;
    (<HTMLElement>playground).style.left = currentLeft - 10 + "px";

    }
});