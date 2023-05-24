import { GameGrid } from "./gameGrid";
import { Tile } from "./tile";
import { MyWorkerMessage, subGridSize } from "./utilObjects";

export class SubGrid {
  ID: string;
  tiles: Array<Array<Tile>> = [];
  sharedWorker: SharedWorker;
  bigSize: subGridSize;
  stable: boolean = true;
  active: boolean = false;
  gameGrid: GameGrid;

  constructor(
    ID: string,
    tiles: Array<Array<Tile>>,
    gameGrid: GameGrid
  ) {
    this.ID = ID;
    this.tiles = tiles;
    this.bigSize = { heigh: tiles.length, width: tiles[0].length };
    this.gameGrid = gameGrid;

    this.sharedWorker = new SharedWorker(new URL("./worker.ts", import.meta.url), {type:'module'});

    this.initWorker();
    this.assignWorker();
    this.assignSubgridID();
  }

  private initWorker() {
    this.sharedWorker.port.start();
    this.sharedWorker.port.addEventListener(
      "message",
      (mes: MessageEvent<MyWorkerMessage>) => {
        switch (mes.data.type) {
          case "active":
            this.setActive();
            break;
          case "inactive":
            this.setInactive();
            break;
        }
      }
    );
    this.sharedWorker.port.postMessage({
      type: "init",
      payload: {
        id: this.ID,
        bigSize: this.bigSize
      },
    });
  }

  private assignWorker() {
    for (let y = 0; y < this.bigSize.heigh; y++) {
      for (let x = 0; x < this.bigSize.width; x++) {
        let tile: Tile = this.tiles[y][x];
        let pos = { x: x, y: y };
        tile.addWorker(this.sharedWorker, pos);
      }
    }
  }

  private assignSubgridID() {
    for (let y = 1; y < this.bigSize.heigh-1; y++) {
      for (let x = 1; x < this.bigSize.width-1; x++) {
        let tile: Tile = this.tiles[y][x];
        let pos = { x: x, y: y };
        tile.setSubgridData(this.ID, pos);
      }
    }
  }

  start() {
    this.sharedWorker.port.postMessage({ type: "start" });
  }

  pause() {
    this.sharedWorker.port.postMessage({ type: "pause" });
  }

  startCalcul() {
    return new Promise((resolve) => {
      this.sharedWorker.port.onmessage = (
        mes: MessageEvent<MyWorkerMessage>
      ) => {
        if (mes.data.type == "calculFinish") {
          resolve(true);
        }
      };
      this.sharedWorker.port.postMessage({ type: "calculNeighbour" });
    });
  }

  updateTile() {
    return new Promise((resolve) => {
      this.sharedWorker.port.onmessage = (
        mes: MessageEvent<MyWorkerMessage>
      ) => {
        if (mes.data.type == "updatedTile") {
          resolve(true);
        }
      };
      this.sharedWorker.port.postMessage({ type: "updateTile" });
    });
  }

  updateActive() {
    return new Promise((resolve) => {
      this.sharedWorker.port.onmessage = (
        mes: MessageEvent<MyWorkerMessage>
      ) => {
        if (mes.data.type == "updatedActive") {
          resolve(true);
        }
      };
      this.sharedWorker.port.postMessage({ type: "updateActive" });
    });
  }

  private setActive() {
    if (!this.active) {
      this.active = true;
      this.gameGrid.himActive(this);
    }
  }

  private setInactive() {
    if (this.active) {
      this.active = false;
      this.gameGrid.himInactive(this);
    }
  }
}
