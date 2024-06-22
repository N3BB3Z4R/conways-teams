import { initializeGrid, updateGrid, gameInterval } from "./gameEngine.js";

let gameState = 'stopped';
export let gameSpeed = 1;

export function startGame() {
  if (gameState === 'stopped') {
    gameState = 'running';
    initializeGrid();
  }
}

export function pauseGame() {
  if (gameState === 'running') {
    gameState = 'paused';
    clearInterval(gameInterval);
  }
}

export function resumeGame() {
  if (gameState === 'paused') {
    gameState = 'running';
    gameInterval = setInterval(updateGrid, 1000 / gameSpeed);
  }
}

export function resetGame() {
  initializeGrid();
}

export function getGameState() {
  return gameState;
}

export function changeSpeed(newSpeed) {
  gameSpeed = newSpeed;
  if (gameState === 'running') {
    clearInterval(gameInterval);
    gameInterval = setInterval(updateGrid, 1000 / gameSpeed);
  }
}
// import { initializeGrid, updateGrid } from "./gameEngine.js";
// // let isGameRunning = false;
// let gameState = 'stopped';
// let gameInterval;
// export let gameSpeed = 1;

// export function startGame() {
//   if (gameState === 'stopped') {
//     // isGameRunning = true;
//     gameState = 'running';
//     // Iniciar la lógica del juego aquí, por ejemplo, llamando a initializeGrid() y comenzando el bucle de juego
//     initializeGrid();
//     setInterval(updateGrid, 30);
//     gameInterval = setInterval(updateGrid, 1000 / gameSpeed);
//   }
// }

// export function pauseGame() {
//   if (gameState === 'running') {
//     // isGameRunning = false;
//     gameState = 'paused';
//     clearInterval(gameInterval);
//     // Pausar la lógica del juego aquí, por ejemplo, deteniendo el bucle de juego
//   }
// }

// export function resumeGame() {
//   gameState = 'running';
//   // Implementa la lógica para reanudar el juego
//   gameInterval = setInterval(updateGrid, 1000 / gameSpeed);
// }

// export function resetGame() {
//   // Reiniciar la lógica del juego aquí, por ejemplo, reiniciando la grilla y las estadísticas
//   initializeGrid();
// }

// export function getGameState() {
//   return gameState;
// }

// export function changeSpeed(newSpeed) {
//   gameSpeed = newSpeed;
//   if (getGameState() === 'running') {
//     clearInterval(gameInterval);
//     gameInterval = setInterval(updateGrid, 1000 / gameSpeed);
//   }
//   updateControlPanel();
// }