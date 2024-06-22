// import { togglePause } from "./gameEngine.js";
import { TEAMS } from "./gameEngine.js";

const canvas = document.getElementById("gameCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

const CELL_SIZE = 4;
let lastFrameTime = performance.now();
let fps = 0;

// Pre-create color arrays for better performance
const redColor = new Uint8ClampedArray([255, 70, 0, 255]);
const blueColor = new Uint8ClampedArray([40, 40, 255, 255]);
const emptyColor = new Uint8ClampedArray([20, 30, 20, 255]);
const stormColor = new Uint8ClampedArray([0, 255, 0, 255]); // Verde para las tormentas
const resourceColor = new Uint8ClampedArray([255, 255, 0, 255]); // Amarillo para los recursos
const blockColor = new Uint8ClampedArray([100, 100, 100, 255]); // Gris para los bloques
const textColor = new Uint8ClampedArray([255, 255, 100, 255]); // Blanco para el texto
let imageData = ctx.createImageData(canvas.width, canvas.height);

const MIN_ISLANDS = 3;
const MAX_ISLANDS = 25;
const MIN_ISLAND_SIZE = 20;
const MAX_ISLAND_SIZE = 150;
const PADDING = 20; // Espacio mínimo entre islas y bordes

function generateRandomIslands(canvasWidth, canvasHeight) {
  const islands = [];
  const numIslands = Math.floor(Math.random() * (MAX_ISLANDS - MIN_ISLANDS + 1)) + MIN_ISLANDS;

  for (let i = 0; i < numIslands; i++) {
    let island;
    let overlap;
    do {
      const width = Math.floor(Math.random() * (MAX_ISLAND_SIZE - MIN_ISLAND_SIZE + 1)) + MIN_ISLAND_SIZE;
      const height = Math.floor(Math.random() * (MAX_ISLAND_SIZE - MIN_ISLAND_SIZE + 1)) + MIN_ISLAND_SIZE;
      const x = Math.floor(Math.random() * (canvasWidth - width - 2 * PADDING)) + PADDING;
      const y = Math.floor(Math.random() * (canvasHeight - height - 2 * PADDING)) + PADDING;

      island = { x, y, width, height };
      overlap = islands.some(existingIsland => isOverlapping(island, existingIsland));
    } while (overlap);

    islands.push(island);
  }

  return islands;
}

function isOverlapping(island1, island2) {
  return !(island1.x + island1.width + PADDING < island2.x ||
    island2.x + island2.width + PADDING < island1.x ||
    island1.y + island1.height + PADDING < island2.y ||
    island2.y + island2.height + PADDING < island1.y);
}

// Modifica la función drawGrid para usar las islas generadas
let islands = [];


export function drawGrid(grid) {
  const currentTime = performance.now();
  const deltaTime = currentTime - lastFrameTime;
  fps = Math.round(1000 / deltaTime);
  lastFrameTime = currentTime;

  const data = imageData.data;

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const cellValue = grid[row][col];
      const index = (row * CELL_SIZE * canvas.width + col * CELL_SIZE) * 4;

      // Dibuja el color segun el valor de la celda
      let color;
      if (cellValue === TEAMS.RED) {
        color = redColor;
      } else if (cellValue === TEAMS.BLUE) {
        color = blueColor;
      } else if (cellValue === TEAMS.STORM) {
        color = stormColor;
      } else {
        color = emptyColor;
      }

      for (let i = 0; i < CELL_SIZE; i++) {
        for (let j = 0; j < CELL_SIZE; j++) {
          const pixelIndex = index + (i * canvas.width + j) * 4;
          data.set(color, pixelIndex);
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Dibujar las islas que se mueven y matan a las células.
  
  // Genera nuevas islas si aún no existen
  if (islands.length === 0) {
    islands = generateRandomIslands(canvas.width, canvas.height);
  }

  // Dibuja las islas
  ctx.fillStyle = "grey";
  islands.forEach(island => {
    ctx.fillRect(island.x, island.y, island.width, island.height);
  });

  drawFPS();
}

export function drawResources(resources) {
  ctx.fillStyle = "yellow";
  resources.forEach(resource => {
    ctx.beginPath();
    ctx.arc(resource.y * CELL_SIZE + CELL_SIZE / 2, resource.x * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE, 0, 2 * Math.PI);
    ctx.fill();
  });
}

function drawFPS() {
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText(`FPS: ${fps}`, 10, 20);
}