var fileName = process.argv[2];
var format = process.argv[3];
var _ = require('lodash')
var json2csv = require('json2csv');


var fs = require('fs'),
  readline = require('readline');

var rd = readline.createInterface({
  input: fs.createReadStream(fileName)
});


var statusMap = {},
  licenses = {},
  lineObj,
  id,
  record;

var inspectProperties = [];

var keyCollectionMap = new Map();

function handleLine(line){
  lineObj = JSON.parse(line);
  var keys = _.keys(lineObj);
  inspectProperties.forEach(function(v){
    var innerKeys = _.keys(lineObj[v]);
    innerKeys.forEach(function(key){
      keys.push(`${v}.${key}`);
    })
  })
  if(!keyCollectionMap.has(keys))keyCollectionMap.set(keys,[]);
  var storage = keyCollectionMap.get(keys);
  storage.push(lineObj);

}

function handleNormalMessageWithId(line){

}

rd.on('close',function(){

  debugger;
  var dataArray = _.values(statusMap);

  if(format && format === 'json'){
    console.log(JSON.stringify(statusMap));
    return;
  }

  var fields = [];
  dataArray.forEach(function(record){
    fields = _.union(fields, _.keys(record));
  });

  json2csv({ data: dataArray, fields: fields }, function(err, csv) {
    if (err) console.log(err);
    console.log(csv);
  });
});

rd.on('line', handleLine);
