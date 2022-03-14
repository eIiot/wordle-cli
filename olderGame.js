import fs, { write } from 'fs';
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const answers = JSON.parse(fs.readFileSync('json/answers.json','utf-8'));
const words = JSON.parse(fs.readFileSync('json/words.json','utf-8'));

const randomAnswer = () => {
  return answers[Math.floor(Math.random() * answers.length)];
};

function createGuessArray(guess,answer) {
  const guessArray = [];
  for (var i = 0; i < guess.length; i++) {
    var char = guess.charAt(i);
    if (char == answer.charAt(i)) {
      guessArray.push([char,"\x1b[32m"]);
    } else if (answer.includes(char)) {
      guessArray.push([char,"\x1b[33m"]);
    } else {
      guessArray.push([char,"\x1b[2m"]);
    };
  };
  return guessArray;
};

function writeConsole(guesses) {
  guesses.forEach(guess => {
    console.log(guess[0][1] + guess[0][0] + "\x1b[0m" + guess[1][1] + guess[1][0] + "\x1b[0m" + guess[2][1] + guess[2][0] + "\x1b[0m" + guess[3][1] + guess[3][0] + "\x1b[0m" + guess[4][1] + guess[4][0] + "\x1b[0m");
  });
};

function askForWord(guesses,state,answer,previousOutput) {
  console.clear();

  // if (guesses.length != 0) {
  //   writeConsole(guesses);
  // };

  if (state == "won") {
    rl.close();
  };
  
  if(previousOutput) console.log(previousOutput);
  rl.question(`Type guess ${guesses.length + 1} → `, function (guess) {
    if (guess.length < 5) { // if the guess is not 5 characters long
      askForWord(guesses,"playing",answer,"Not enough letters");
    } else if (guess.length > 5) { // if the guess is not 5 characters long
      askForWord(guesses,"playing",answer,"Too many letters");
    } else if (!words.includes(guess) && !answers.includes(guess)) { // if the guess is not a valid word
      askForWord(guesses,"playing",answer,"Not in word list");
    } else if (guess == answer) { // if the guess is the answer

      console.clear();

      guesses.push(createGuessArray(guess,answer));

      writeConsole(guesses);

      rl.close();
    } else {
      guesses.push(createGuessArray(guess,answer));

      // get number of correct letters
      var correct = 0;
      for (var i = 0; i < guess.length; i++) {
        if (guess.charAt(i) == answer.charAt(i)) {
          correct++;
        };
      };

      // get number of letters in the answer
      var inAnswer = 0;
      for (var i = 0; i < guess.length; i++) {
        if (answer.includes(guess.charAt(i))) {
          inAnswer++;
        };
      };

      askForWord(guesses,"playing",answer,`${guess}\n${correct} correct, ${inAnswer} in answer`);
    };
  });
}

rl.on('close', function () {
  process.exit(0);
});

askForWord([],"playing",randomAnswer());