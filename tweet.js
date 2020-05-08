const fs = require('fs');
const boxen = require('boxen');

let rawdata = fs.readFileSync('sortedProverbs_v2.json');
let proverbs = JSON.parse(rawdata);

var proverbId = Math.floor(Math.random() * proverbs.length);
var item = proverbs[proverbId];
// console.log(item.senses);
const generateTweet = (oneEng = false) => {

  let english = 'Eng: ' + item.senses[0].english_definitions[0] + '.';
  if(item.senses[0].english_definitions.length > 1 && !oneEng){
    english = 'Eng 1: ' + item.senses[0].english_definitions[0] + '.';
    english += '\n' + 'Eng 2: ' + item.senses[0].english_definitions[item.senses[0].english_definitions.length - 1] + '.';
  }
  
  let tweet = 
`${item.japanese[0].word}。
${item.japanese[0].reading}。

${english}

Random proverb ${proverbId + 1}`;

  return tweet;
}

tweet = generateTweet();
if(tweet.length > 280){
  tweet = generateTweet(true);
}

let log = 
`{
-------------
${tweet}
-------------

Length: ${tweet.length}
Date: ${new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}
${Date.now()}
}`;
console.log(process.env.PASSWORD);
fs.appendFile('log.txt', log + '\n', function (err) {
  if (err) throw err;
  console.log(log);
});