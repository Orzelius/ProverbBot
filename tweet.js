const fs = require('fs');
const boxen = require('boxen');
var Twitter = require('twitter');
 
var client = new Twitter({
  consumer_key: process.env.API_key,
  consumer_secret: process.env.API_secret_key,
  access_token_key: process.env.Access_token,
  access_token_secret: process.env.Access_token_secret
});

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

Random proverb no. ${proverbId + 1}`;

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

client.post('statuses/update', {status: tweet},  function(error, tweet, response) {
  if(error) throw error; // Raw response object.
  else console.log('Success!');
});


