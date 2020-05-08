const jishoApi = require('unofficial-jisho-api');
const jisho = new jishoApi();
const rp = require('request-promise');
const $ = require('cheerio');
const fs = require('fs');
var colors = require('colors');
const cTable = require('console.table');

const splitLines = str => str.split(/\r?\n/);
console.clear();
const getProverbsMaster = () => {
  fs.readFile('proverbs.txt', "utf8", function (err, data) {
    if (err) throw err;
    proverbs = splitLines(data);
    console.log(proverbs, proverbs.length);  
    getDetailsProvers(proverbs);
  });
}
  
const getDetailsProvers = async (proverbs) => {
  for (let index = 0; index < proverbs.length; index++) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    jisho.searchForPhrase(proverbs[index]).then((data) => {
      process.stdout.write(index + '  '.padEnd(3))
      data.index = 0;
      let json = JSON.stringify(data.data, null, 2);
      console.log(`status: ${data.meta.status} query: ${data.data[0].slug}`);
      fs.appendFile('proverbs_v2.json', json + ',\n', function (err) {
            if (err) throw err;
          });
      })
    .catch(function(err){
      //handle error
      // process.stdout.write(index + '  ');
      console.log(err.message);
    });
  }
}

// getProverbsMaster();

const getProverbs = async () => {
  for(let page = 1; page < 41; page++){
    await new Promise(resolve => setTimeout(resolve, 500));
    const url = 'https://jisho.org/search/%23words%20%23proverb?page=' + page;
    rp(url)
    .then(function(html){
      //success!
      let spans = $('span.text', html);
      for(let i = 1; i < 21; i++){
        let text = spans[i].children.map((span) => {
        // console.log(span);
        if(span.type === 'tag'){
          return(span.children[0].data)
        }
        else{
          return(span.data);
        }
      }).join('');
      text = text.replace(/\n/g,'');
      text = text.replace(/ /g,'');
      // console.log(page, i, text);
      fs.appendFile('proverbs.txt', text + '\n', function (err) {
        if (err) throw err;
        console.log(`Saved p${page}.${i}: ${text}`);
      });
      }
    })
    .catch(function(err){
      //handle error
      console.log(err.message);
    });
  }
}

// getProverbs();

const sortProverbs = async () => {
  let rawdata = fs.readFileSync('proverbs.json');
  let proverbs = JSON.parse(rawdata);
  proverbs = proverbs.filter((p) => p.otherForms && p.otherForms.length > 0);
  proverbs = removeDuplicates(proverbs, 'query');
  proverbs = proverbs.map((p) => {
    p.meanings = p.meanings[0];
    if(!p.meanings.definition){
      console.log(p.index);
    }
    let defenition = p.meanings.definition;
    p.meanings.definition = defenition.split('; ');
    p.meanings.definition = p.meanings.definition.map(definition => {
      return(definition.charAt(0).toUpperCase() + definition.slice(1));
    });
    return p;
  })
  let elements = [];
  proverbs.forEach(proverb => {
    elements.push({id: proverb.index, proverb: proverb.query, kana: proverb.otherForms[0].kana, meaning: proverb.meanings.definition[0]})
  });
  console.table(elements);
  console.log(proverbs.length);

  fs.writeFileSync('sortedProverbs.json', JSON.stringify(proverbs, null, 2),{encoding:'utf8',flag:'w'})
}
// sortProverbs();

function removeDuplicates(myArr, prop) {
  return myArr.filter((obj, pos, arr) => {
      let bool = arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos
      console.log(bool, obj[prop]);
      return bool;
  })
}

const sortProverbs_v2 = async () => {
  let rawdata = fs.readFileSync('proverbs_v2.json');
  let proverbs = JSON.parse(rawdata);

  proverbs = removeDuplicates(proverbs, 'slug');
  proverbs = proverbs.map(p => {
    if(p.senses.length > 1){
      console.log(p);
    }
    p.senses[0].english_definitions = p.senses[0].english_definitions.map(definition => {
      return(definition.charAt(0).toUpperCase() + definition.slice(1));
    })
    return p;
  })
  
  fs.writeFileSync('sortedProverbs_v2.json', JSON.stringify(proverbs, null, 2),{encoding:'utf8',flag:'w'})
}
sortProverbs_v2();
