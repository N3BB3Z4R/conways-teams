import { togglePause } from "./gameEngine.js";

const canvas = document.getElementById("gameCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

const CELL_SIZE = 4;

export function drawGrid(grid) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);  // Limpia el canvas antes de dibujar el siguiente frame.

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] === 1) {
        ctx.fillStyle = "red";  // Células del equipo rojo.
      } else if (grid[row][col] === 2) {
        ctx.fillStyle = "blue";  // Células del equipo azul.
      } else {
        continue;  // Si la celda está muerta, no la dibuja.
      }

      ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }

  // Dibujar las islas que se mueven y matan a las células. 
  // Puedes personalizar esto para cambiar la forma y el comportamiento de las islas.
  ctx.fillStyle = "grey";
  ctx.fillRect(150, 150, 50, 50);
  ctx.fillRect(400, 250, 60, 60);
  ctx.fillRect(600, 400, 40, 40);
  ctx.fillRect(800, 500, 50, 50);
  ctx.fillRect(1000, 600, 60, 60);
  ctx.fillRect(1200, 700, 40, 40);
}

export function drawResources(resources) {
  ctx.fillStyle = "yellow";
  resources.forEach(resource => {
    ctx.beginPath();
    ctx.arc(resource.y * CELL_SIZE + CELL_SIZE / 2, resource.x * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE, 0, 2 * Math.PI);
    ctx.fill();
  });
}