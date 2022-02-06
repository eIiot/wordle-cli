import fs, { write } from 'fs';
import readline from "readline";

const cliArgs = process.argv.slice(2);

if (cliArgs[0] == "stats") {
  const user = JSON.parse(fs.readFileSync('user.json','utf-8'));

  const guessDistribution = [0,0,0,0,0,0,0];
  var wins = 0;

  user.history.games.forEach(game => {
    guessDistribution[game[0].length]++;
    if (game[1] == true) {
      wins++;
    };
  });

  console.log(`Played: ${user.history.games.length}`);
  // console.log("Average Length: " + Math.floor(totalWinLength / wins));
  console.log("Win %: " + Math.floor(wins / user.history.games.length * 100));
  
  console.log("Guess Distribution: ");
  
  // generate bar chart with ░ and ▒
  for (var i = 1; i < guessDistribution.length; i++) {
    var bar = "";
    for (var j = 0; j < guessDistribution[i]; j++) {
      bar += "░ ";
    }
    console.log(`${i}: ${bar}${guessDistribution[i]}`);
  };

  

  process.exit();
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const answers = JSON.parse(fs.readFileSync('answers.json','utf-8'));
const words = JSON.parse(fs.readFileSync('words.json','utf-8'));
let letters = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['z','x','c','v','b','n','m']
];

const wordleNum = Math.floor((new Date() - new Date(1624086000 * 1000)) / (1000 * 60 * 60 * 24));

let user = JSON.parse(fs.readFileSync('user.json','utf-8'));

if (user.game.wordleNum !== wordleNum) {
  // reset user game object
  user.game = {
    "guesses": [],
    "wordleNum": wordleNum,
    "state": "new"
  };

  // save user object
  fs.writeFileSync('user.json', JSON.stringify(user));
};

function updateUserGuesses(guesses) {
  const user = JSON.parse(fs.readFileSync('user.json','utf-8'));
  user.game.guesses = guesses;
  fs.writeFileSync('user.json', JSON.stringify(user));
};

function updateUserHistory(guesses,won) {
  const user = JSON.parse(fs.readFileSync('user.json','utf-8'));

  user.game.state = won ? "won" : "lost";

  let existingGames = user.history.games.find(function (game) {
    return game[2] == wordleNum;
  });
  
  if (!existingGames) {
    user.history.games.push([guesses,won,wordleNum]);
  };

  fs.writeFileSync('user.json', JSON.stringify(user));
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

  letters.forEach(row => {
    const lettersWithColors = [];
    
    // find all letters that have appeared in green
    row.forEach(letter => {
      if (guesses.flat(1).find(guess => guess[0] == letter && guess[1] == "\x1b[32m")) {
        lettersWithColors.push("\x1b[32m" + letter + "\x1b[0m");
      } else if (guesses.flat(1).find(guess => guess[0] == letter && guess[1] == "\x1b[33m")) {
        lettersWithColors.push("\x1b[33m" + letter + "\x1b[0m");
      } else if (guesses.flat(1).find(guess => guess[0] == letter && guess[1] == "\x1b[2m")) {
        lettersWithColors.push("\x1b[2m" + letter + "\x1b[0m");
      } else {
        lettersWithColors.push(letter);
      }
    });

    console.log(lettersWithColors.join(" "));
  });
}

function askForWord(guesses,state,answer,previousOutput) {
  console.clear();

  if (guesses.length != 0) {
    writeConsole(guesses);
  };

  if (state == "won") {
    rl.close();
  } else if (guesses.length == 6) {
    updateUserHistory(guesses,false);
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

      updateUserGuesses(guesses);

      updateUserHistory(guesses,true);

      rl.close();
    } else {
      guesses.push(createGuessArray(guess,answer));

      updateUserGuesses(guesses,answer);

      askForWord(guesses,"playing",answer);
    }
  });
}

rl.on('close', function () {
  process.exit(0);
});

askForWord(user.game.guesses,user.game.state,answers[wordleNum],"");