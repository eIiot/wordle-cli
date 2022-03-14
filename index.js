import fs from 'fs';

// randomly shuffle wordle.json and then send it to shuffled.json

fs.writeFileSync('shuffled.json', JSON.stringify(shuffle(JSON.parse(fs.readFileSync('wordle.json', 'utf8')))));