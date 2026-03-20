const words = [
  "mejor preparados para la entrevista",
  "con expectativas más claras",
  "que mejor entienden el negocio"
];

let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

const textElement = document.getElementById("dynamic-text");

function typeEffect() {
  const currentWord = words[wordIndex];
  
  if (isDeleting) {
    charIndex--;
  } else {
    charIndex++;
  }

  textElement.textContent = currentWord.substring(0, charIndex);

  let speed = isDeleting ? 30 : 60; // borrar más rápido

  if (!isDeleting && charIndex === currentWord.length) {
    speed = 500; // pausa cuando termina
    isDeleting = true;
  } 
  else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    wordIndex = (wordIndex + 1) % words.length;
    speed = 200;
  }

  setTimeout(typeEffect, speed);
}

// iniciar
typeEffect();
