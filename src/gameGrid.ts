import { Tile } from "./tile";
import { SubGrid } from "./subGrid";
import { subGridSmallSize } from "./utilObjects";

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

  //Créer les subGrid pour permettre la communication entre Tile.
  private generateSubGrid() {
    for (let y = 0; y < this.gridSize; y++) {
      let line: Array<SubGrid> = [];
      for (let x = 0; x < this.gridSize; x++) {
        let subGridID: string = `${x}-${y}`;
        let subGridTiles = this.getSubGridTiles(x, y);
        let smallSize = this.getSmallSize(x, y);
        let subGrid = new SubGrid(subGridID, subGridTiles, smallSize, this);
        line.push(subGrid);
      }
      this.subGrids.push(line);
    }
  }

  private getSubGridTiles(
    subGridX: number,
    subGridY: number
  ): Array<Array<Tile>> {
    let sy: number = Math.max(subGridY * this.subSize - 1, 0); //Never below 0
    let ey: number = Math.min(
      (subGridY + 1) * this.subSize + 1,
      this.tileGridSize
    ); //Never above tileGridSize
    let sx: number = Math.max(subGridX * this.subSize - 1, 0); //Never below 0
    let ex: number = Math.min(
      (subGridX + 1) * this.subSize + 1,
      this.tileGridSize
    ); //Never above tileGridSize
    return this.tiles.slice(sy, ey).map((i) => i.slice(sx, ex));
  }

  private getSmallSize(subGridX: number, subGridY: number): subGridSmallSize {
    let smallSize: subGridSmallSize = {
      sy: subGridY * this.subSize - 1 < 0 ? 0 : 1,
      sx: subGridX * this.subSize - 1 < 0 ? 0 : 1,
      ey: this.subSize + (subGridY * this.subSize - 1 < 0 ? 0 : 1),
      ex: this.subSize + (subGridX * this.subSize - 1 < 0 ? 0 : 1),
    };

    return smallSize;
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
