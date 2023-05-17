import { Tile } from "./tile";
import { SubGrid } from "./subGrid";

export class GameGrid {
  //Attributs
  element: Element;
  subSize: number;
  gridSize: number;
  tileGridSize: number;
  tiles: Array<Array<Tile>> = [];
  subGrids: Array<Array<SubGrid>> = [];
  activeSubgrids: Array<SubGrid> = [];
  updating: boolean = false;
  pause: boolean = false;

  constructor(element: Element, gridSize: number, subSize: number) {
    this.element = element;
    this.gridSize = gridSize;
    this.subSize = subSize;
    this.tileGridSize = this.subSize * this.gridSize;
    this.generateTiles();
    this.generateLife();
    this.updateTilesToBorderLess();
    this.generateSubGrid();
    this.setPause();
    this.mainLoop();
  }

  //Créer la grid de tile en HTMLElements.
  private generateTiles() {
    for (let y = 0; y < this.tileGridSize; y++) {
      //Créer un HTMLElement qui représente une ligne de tile.
      let line: Element = document.createElement("div");
      line.classList.add("line");

      for (let x = 0; x < this.tileGridSize; x++) {
        //Créer un HTMLElement qui représente une tile.
        let tile = document.createElement("div");
        tile.classList.add("tile");
        tile.id = `t-${x}-${y}`;

        line.appendChild(tile);
      }
      this.element.appendChild(line);
    }
  }

  //Ajoute le comportement d'une tile à chaque tile HTMLElement.
  private generateLife() {
    for (let y = 0; y < this.tileGridSize; y++) {
      let line: Array<Tile> = [];

      for (let x = 0; x < this.tileGridSize; x++) {
        let t = <Element>document.getElementById(`t-${x}-${y}`);
        let tile = new Tile(t);

        line.push(tile);
      }
      this.tiles.push(line);
    }
  }

  private updateTilesToBorderLess(){
    //Top
    let top = [...this.tiles[this.tileGridSize-1]];
    top.push(this.tiles[this.tileGridSize-1][0]);
    top.unshift(this.tiles[this.tileGridSize-1][this.tileGridSize-1]);

    //Bottom
    let bottom = [...this.tiles[0]];
    bottom.push(this.tiles[0][0]);
    bottom.unshift(this.tiles[0][this.tileGridSize-1]);

    //Left and Right
    this.tiles.forEach((line) =>{
      line.push(line[0]);
      line.unshift(line[this.tileGridSize-1]);
    });

    this.tiles.unshift(top);
    this.tiles.push(bottom);
  }

  //Créer les subGrid pour permettre la communication entre Tile.
  private generateSubGrid() {
    for (let y = 0; y < this.gridSize; y++) {
      let line: Array<SubGrid> = [];
      for (let x = 0; x < this.gridSize; x++) {
        let subGridID: string = `${x}-${y}`;
        let subGridTiles = this.getSubGridTiles(x, y);
        let subGrid = new SubGrid(subGridID, subGridTiles, this);
        line.push(subGrid);
      }
      this.subGrids.push(line);
    }
  }

  private getSubGridTiles(
    subGridX: number,
    subGridY: number
  ): Array<Array<Tile>> {
    let sy: number = subGridY * this.subSize;
    let ey: number = (subGridY + 1) * this.subSize + 2;
    let sx: number = subGridX * this.subSize;
    let ex: number = (subGridX + 1) * this.subSize + 2;
    return this.tiles.slice(sy, ey).map((i) => i.slice(sx, ex));
  }

  setStart() {
    this.pause = false;
    this.subGrids.forEach((line) => {
      line.forEach((subGrid) => {
        subGrid.start();
      });
    });
  }

  setPause() {
    this.pause = true;
    this.subGrids.forEach((line) => {
      line.forEach((subGrid) => {
        subGrid.pause();
      });
    });
  }

  himActive(subGrid: SubGrid) {
    if (this.activeSubgrids.indexOf(subGrid) == -1) {
      this.activeSubgrids.push(subGrid);
    }
  }

  himInactive(subGrid: SubGrid) {
    let index: number = this.activeSubgrids.indexOf(subGrid);
    if (index != -1) {
      this.activeSubgrids.splice(index, 1);
    }
  }

  async mainLoop() {
    window.setTimeout(async () => {
      if (!this.pause) {
        await this.update();
      }
      this.mainLoop();
    }, 50);
  }

  async update() {
    if (this.activeSubgrids.length != 0) {
      await Promise.all(
        this.activeSubgrids.map(async (sg) => {
          await sg.startCalcul();
        })
      );
      await Promise.all(
        this.activeSubgrids.map(async (sg) => {
          await sg.updateTile();
        })
      );

      await Promise.all(
        this.activeSubgrids.map(async (sg) => {
          await sg.updateActive();
        })
      );
    }
  }
}
