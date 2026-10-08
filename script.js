"use strict";

const modes = {
  easy: { max: 50, attempts: 10 },
  classic: { max: 100, attempts: 7 },
  expert: { max: 500, attempts: 9 },
};

const form = document.querySelector("#guess-form");
const input = document.querySelector("#guess-input");
const guessButton = document.querySelector("#guess-button");
const newGameButton = document.querySelector("#new-game-button");
const feedback = document.querySelector("#feedback-message");
const feedbackText = feedback.querySelector("span:last-child");
const numberOrb = document.querySelector("#number-orb");
const gamePrompt = document.querySelector("#game-prompt");
const gameSubprompt = document.querySelector("#game-subprompt");
const rangeLabel = document.querySelector("#range-label");
const attemptsLeftLabel = document.querySelector("#attempts-left");
const attemptsTotalLabel = document.querySelector("#attempts-total");
const attemptsTrack = document.querySelector("#attempts-track");
const attemptsFill = document.querySelector("#attempts-fill");
const history = document.querySelector("#guess-history");
const historyCount = document.querySelector("#history-count");
const bestScore = document.querySelector("#best-score");
const roundNumber = document.querySelector("#round-number");
const difficultyButtons = document.querySelectorAll(".difficulty-button");

let mode = "easy";
let secretNumber;
let attemptsLeft;
let guesses = [];
let round = 1;
let gameOver = false;

function getBestScore() {
  try {
    const score = Number(localStorage.getItem(`number-nova-best-${mode}`));
    return Number.isInteger(score) && score > 0 ? score : null;
  } catch (error) {
    console.warn("Could not read the saved personal best.", error);
    return null;
  }
}

function saveBestScore(score) {
  try {
    localStorage.setItem(`number-nova-best-${mode}`, String(score));
  } catch (error) {
    console.warn("Could not save the personal best.", error);
  }
}

function updateBestScore() {
  const score = getBestScore();
  bestScore.textContent = score === null ? "—" : String(score);
}

function updateAttempts() {
  const total = modes[mode].attempts;
  attemptsLeftLabel.textContent = String(attemptsLeft);
  attemptsTotalLabel.textContent = String(total);
  attemptsTrack.setAttribute("aria-valuemax", String(total));
  attemptsTrack.setAttribute("aria-valuenow", String(attemptsLeft));
  attemptsFill.style.width = `${(attemptsLeft / total) * 100}%`;
}

function setFeedback(message, type = "") {
  feedbackText.textContent = message;
  feedback.classList.remove("is-error", "is-success");
  if (type) feedback.classList.add(`is-${type}`);
}

function startGame(incrementRound = false) {
  if (incrementRound) round += 1;
  const settings = modes[mode];
  secretNumber = Math.floor(Math.random() * settings.max) + 1;
  attemptsLeft = settings.attempts;
  guesses = [];
  gameOver = false;

  roundNumber.textContent = String(round).padStart(2, "0");
  rangeLabel.textContent = `1 and ${settings.max}`;
  gameSubprompt.replaceChildren(document.createTextNode("Pick a number between "), rangeLabel);
  input.min = "1";
  input.max = String(settings.max);
  input.value = "";
  input.disabled = false;
  guessButton.disabled = false;
  numberOrb.textContent = "?";
  numberOrb.classList.remove("reveal");
  gamePrompt.textContent = "A secret number is waiting...";
  history.replaceChildren();
  history.append(Object.assign(document.createElement("span"), {
    className: "history-empty",
    textContent: "Your guesses will appear here",
  }));
  historyCount.textContent = "0 GUESSES";
  setFeedback("Make your first guess to get a clue.");
  updateAttempts();
  updateBestScore();
}

function addGuessToHistory(guess, result) {
  const emptyMessage = history.querySelector(".history-empty");
  if (emptyMessage) emptyMessage.remove();

  const chip = document.createElement("span");
  chip.className = `guess-chip ${result === "low" ? "is-low" : result === "correct" ? "is-correct" : ""}`;
  chip.textContent = `${guess} ${result === "low" ? "↑" : result === "high" ? "↓" : "✦"}`;
  chip.setAttribute(
    "aria-label",
    `${guess}, ${result === "low" ? "too low" : result === "high" ? "too high" : "correct"}`,
  );
  history.append(chip);
  historyCount.textContent = `${guesses.length} ${guesses.length === 1 ? "GUESS" : "GUESSES"}`;
}

function celebrate() {
  const colors = ["#d7ff70", "#a18aff", "#78c3ff", "#fff1a8"];
  for (let index = 0; index < 38; index += 1) {
    const piece = document.createElement("span");
    piece.className = "celebration";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[index % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.45}s`;
    piece.style.transform = `rotate(${Math.random() * 180}deg)`;
    document.body.append(piece);
    piece.addEventListener("animationend", () => piece.remove(), { once: true });
  }
}

function finishGame(won) {
  gameOver = true;
  input.disabled = true;
  guessButton.disabled = true;
  numberOrb.textContent = String(secretNumber);
  numberOrb.classList.add("reveal");

  if (won) {
    gamePrompt.textContent = "You found the signal!";
    gameSubprompt.innerHTML = `The secret number was <strong>${secretNumber}</strong>.`;
    setFeedback(`Brilliant! You got it in ${guesses.length} ${guesses.length === 1 ? "guess" : "guesses"}.`, "success");
    const previousBest = getBestScore();
    if (previousBest === null || guesses.length < previousBest) {
      saveBestScore(guesses.length);
      updateBestScore();
    }
    celebrate();
  } else {
    gamePrompt.textContent = "The signal slipped away.";
    gameSubprompt.innerHTML = `The secret number was <strong>${secretNumber}</strong>.`;
    setFeedback("Out of guesses. The cosmos is ready for a rematch.");
  }
}

function handleGuess(event) {
  event.preventDefault();
  if (gameOver) return;

  const guess = Number(input.value);
  const max = modes[mode].max;

  if (!input.value.trim() || !Number.isInteger(guess) || guess < 1 || guess > max) {
    setFeedback(`Enter a whole number from 1 to ${max}.`, "error");
    input.focus();
    return;
  }

  if (guesses.includes(guess)) {
    setFeedback("You already tried that number. Pick a new one.", "error");
    input.select();
    return;
  }

  guesses.push(guess);
  attemptsLeft -= 1;

  if (guess === secretNumber) {
    addGuessToHistory(guess, "correct");
    updateAttempts();
    finishGame(true);
    return;
  }

  const result = guess < secretNumber ? "low" : "high";
  addGuessToHistory(guess, result);
  updateAttempts();

  if (attemptsLeft === 0) {
    finishGame(false);
  } else if (result === "low") {
    setFeedback("A little higher — your number is too low.");
  } else {
    setFeedback("Come down a bit — your number is too high.");
  }

  input.value = "";
  input.focus();
}

form.addEventListener("submit", handleGuess);
newGameButton.addEventListener("click", () => startGame(true));

difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (mode === button.dataset.mode) return;
    mode = button.dataset.mode;
    difficultyButtons.forEach((option) => {
      const selected = option === button;
      option.classList.toggle("selected", selected);
      option.setAttribute("aria-pressed", String(selected));
    });
    round = 1;
    startGame();
  });
});

startGame();
