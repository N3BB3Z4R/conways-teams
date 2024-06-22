// Importaciones y configuración inicial
import { drawGrid, drawResources } from "./renderer.js";
import { startGame, getGameState, pauseGame, resumeGame, gameSpeed, changeSpeed } from './stateManager.js';

const rows = Math.floor(window.innerHeight / 4);
const cols = Math.floor(window.innerWidth / 4);
// const GRID_SIZE = 100;
const RESOURCE_COUNT = 5;
export const TEAMS = { EMPTY: 0, RED: 1, BLUE: 2, STORM: 3 };
const MUTATION_CHANCE = 0.001; // 0.1% de probabilidad de mutación
const RESOURCE_SPAWN_CHANCE = 0.05; // 5% de probabilidad de aparición de nuevo recurso
const RESOURCE_DESPAWN_CHANCE = 0.02; // 2% de probabilidad de desaparición de recurso
const STORM_CHANCE = 0.1; // 0.1% de probabilidad de tormenta

let interactionCount = 0; // Contador de interacciones entre celulas


function updateResources(newGrid) {
  // Eliminar recursos
  resources = resources.filter(() => Math.random() > RESOURCE_DESPAWN_CHANCE);

  // Añadir nuevos recursos
  while (resources.length < RESOURCE_COUNT && Math.random() < RESOURCE_SPAWN_CHANCE) {
    resources.push({
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
      team: TEAMS.EMPTY
    });
  }

  // Actualizar equipos y puntuaciones
  resources.forEach(resource => {
    const cellTeam = newGrid[resource.x][resource.y];
    if (cellTeam !== TEAMS.EMPTY && resource.team !== cellTeam) {
      resource.team = cellTeam;
      scores[cellTeam]++;
    }
  });
}

function mutate(team) {
  return Math.random() < MUTATION_CHANCE ? (team === TEAMS.RED ? TEAMS.BLUE : TEAMS.RED) : team;
}

function createStorm() {
  if (Math.random() < STORM_CHANCE) {
    const stormX = Math.floor(Math.random() * rows);
    const stormY = Math.floor(Math.random() * cols);
    const stormRadius = Math.floor(Math.random() * 10) + 5;

    for (let i = Math.max(0, stormX - stormRadius); i < Math.min(rows, stormX + stormRadius); i++) {
      for (let j = Math.max(0, stormY - stormRadius); j < Math.min(cols, stormY + stormRadius); j++) {
        if (Math.random() < 0.7) { // 70% de probabilidad de que una célula sea afectada por la tormenta
          grid[i][j] = TEAMS.STORM; // Cambiamos a STORM en lugar de EMPTY
        }
      }
    }
  }
}

let grid = new Array(rows).fill(null).map(() => new Array(cols).fill(TEAMS.EMPTY));
let resources = [];
let scores = { [TEAMS.RED]: 0, [TEAMS.BLUE]: 0 };

// Inicialización del juego
export function initializeGrid() {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const randomTeam = Math.floor(Math.random() * 3);
      grid[i][j] = randomTeam;
    }
  }
  initializeResources();
}

function initializeResources() {
  resources = [];
  for (let i = 0; i < RESOURCE_COUNT; i++) {
    resources.push({
      x: Math.floor(Math.random() * rows),
      y: Math.floor(Math.random() * cols),
      team: TEAMS.EMPTY
    });
  }
}

let gameInterval;
let lastUpdateTime = 0;
const UPDATE_INTERVAL = 1000 / 60; // 60 FPS

function gameLoop(currentTime) {
  if (getGameState() === 'running') {
    if (currentTime - lastUpdateTime > UPDATE_INTERVAL / gameSpeed) {
      updateGrid();
      lastUpdateTime = currentTime;
    }
    drawGrid(grid);
    drawResources(resources);
  }
  requestAnimationFrame(gameLoop);
}


// Lógica principal del juego
export function updateGrid() {
  const newGrid = new Array(rows).fill(null).map(() => new Array(cols).fill(TEAMS.EMPTY));
  let localInteractionCount = 0;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const currentCell = grid[i][j];
      const neighbors = countNeighbors(grid, i, j);

      // Reglas de Conway modificadas
      // if (currentCell === TEAMS.STORM) {
      //   newGrid[i][j] = TEAMS.EMPTY;
      // } else if (currentCell === TEAMS.EMPTY) {
      //   if (neighbors.red === 3) newGrid[i][j] = mutate(TEAMS.RED);
      //   else if (neighbors.blue === 3) newGrid[i][j] = mutate(TEAMS.BLUE);
      // } else if (currentCell === TEAMS.RED) {
      //   if (neighbors.red < 2 || neighbors.red > 3) newGrid[i][j] = TEAMS.EMPTY;
      //   else newGrid[i][j] = mutate(TEAMS.RED);
      // } else if (currentCell === TEAMS.BLUE) {
      //   if (neighbors.blue < 2 || neighbors.blue > 3) newGrid[i][j] = TEAMS.EMPTY;
      //   else newGrid[i][j] = mutate(TEAMS.BLUE);
      // }
      if (currentCell === TEAMS.STORM) {
        newGrid[i][j] = TEAMS.EMPTY;
        localInteractionCount++;
      } else if (currentCell === TEAMS.EMPTY) {
        if (neighbors.red === 3) {
          newGrid[i][j] = mutate(TEAMS.RED);
          localInteractionCount++;
        } else if (neighbors.blue === 3) {
          newGrid[i][j] = mutate(TEAMS.BLUE);
          localInteractionCount++;
        }
      } else if (currentCell === TEAMS.RED) {
        if (neighbors.red < 2 || neighbors.red > 3) {
          newGrid[i][j] = TEAMS.EMPTY;
          localInteractionCount++;
        } else {
          newGrid[i][j] = mutate(TEAMS.RED);
          if (newGrid[i][j] !== TEAMS.RED) localInteractionCount++;
        }
      } else if (currentCell === TEAMS.BLUE) {
        if (neighbors.blue < 2 || neighbors.blue > 3) {
          newGrid[i][j] = TEAMS.EMPTY;
          localInteractionCount++;
        } else {
          newGrid[i][j] = mutate(TEAMS.BLUE);
          if (newGrid[i][j] !== TEAMS.BLUE) localInteractionCount++;
        }
      }

      // Lógica para las islas que matan a las células (ajustada a las nuevas dimensiones)
      if ((i >= rows / 6 && i <= rows / 5) && (j >= cols / 6 && j <= cols / 5) ||
        (i >= rows / 2.5 && i <= rows / 2.17) && (j >= cols / 4 && j <= cols / 3.22)) {
        newGrid[i][j] = TEAMS.EMPTY;
      }
    }
  }

  // Actualizar el contador global de interacciones
  interactionCount += localInteractionCount;

  // Actualizar recursos y puntuaciones
  updateResources(newGrid);

  // Crear tormenta
  createStorm();

  grid = newGrid;
  drawGrid(grid);
  drawResources(resources);
  updateControlPanel();
}

export function getInteractionCount() {
  return interactionCount;
}

function countNeighbors(grid, x, y) {
  const neighbors = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0], [1, 0],
    [-1, 1], [0, 1], [1, 1]
  ];
  let countRed = 0;
  let countBlue = 0;
  for (const [dx, dy] of neighbors) {
    const newX = x + dx;
    const newY = y + dy;
    if (newX >= 0 && newX < rows && newY >= 0 && newY < cols) {
      if (grid[newX][newY] === TEAMS.RED) countRed++;
      if (grid[newX][newY] === TEAMS.BLUE) countBlue++;
    }
  }
  return { red: countRed, blue: countBlue };
}

function countTeamCells() {
  let redCount = 0;
  let blueCount = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === TEAMS.RED) {
        redCount++;
      } else if (grid[i][j] === TEAMS.BLUE) {
        blueCount++;
      }
    }
  }
  return {
    red: redCount,
    blue: blueCount
  };
}

let lastControlUpdateTime = 0;
const CONTROL_UPDATE_INTERVAL = 500; // Actualiza cada 500ms

function updateControlPanel() {
  const currentTime = performance.now();
  if (currentTime - lastControlUpdateTime < CONTROL_UPDATE_INTERVAL) {
    return;
  }
  lastControlUpdateTime = currentTime;

  const counts = countTeamCells();
  const controlPanel = document.getElementById('control-panel');
  const buttons = document.getElementById('game-menus');
  const gameState = getGameState();

  controlPanel.innerHTML = `
    Population: ${counts.red + counts.blue}<br>
    Red Team: Cells ${counts.red}, Score ${scores[TEAMS.RED]}<br>
    Blue Team: Cells ${counts.blue}, Score ${scores[TEAMS.BLUE]}<br>
    Game Speed: ${gameSpeed.toFixed(1)}x<br>
    Resources: ${resources.length}<br>
    Interactions: ${getInteractionCount()}<br>
  `;

  buttons.innerHTML = gameState === 'running'
    ? `<button id="pauseButton">Pause</button>`
    : `<button id="resumeButton">Resume</button>`;

  buttons.innerHTML += `
    <button id="speedUpButton">Speed Up</button>
    <button id="slowDownButton">Slow Down</button>
  `;

  // Usar delegation para manejar todos los clicks en los botones
  buttons.addEventListener('click', handleButtonClick);
}

// Controles del juego
function handleButtonClick(event) {
  const button = event.target;
  if (button.tagName !== 'BUTTON') return;

  switch (button.id) {
    case 'pauseButton':
    case 'resumeButton':
      togglePause();
      break;
    case 'speedUpButton':
      changeSpeed(Math.min(5, gameSpeed + 0.25));
      break;
    case 'slowDownButton':
      changeSpeed(Math.max(0.5, gameSpeed - 0.25));
      break;
  }
}

export function togglePause() {
  const newState = getGameState() === 'running' ? 'paused' : 'running';
  newState === 'running' ? resumeGame() : pauseGame();
  updateControlPanel();
}

document.addEventListener('DOMContentLoaded', () => {
  startGame();
  requestAnimationFrame(gameLoop);
});


export { gameInterval };
