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
  record,
  copyParams = [
    'rejectReason',
    'username',
    'latitude',
    'longitude',
    'rate_plan_key',
    'phone'
  ]

rd.on('line', function(line) {
  lineObj = JSON.parse(line);
  id = lineObj.params && lineObj.params.id
  var params = lineObj.params;
  if (lineObj.status >= 300) return;
  var jumioIdScanReference = params && params['jumioIdScanReference'];
  if(jumioIdScanReference) {
    id = licenses[jumioIdScanReference] || params['merchantIdScanReference'];
  }

  if(!id) return;
  if(!statusMap[id]) statusMap[id] = {};
  record = statusMap[id];
  record.id = id;
  var controller_action = `${lineObj.controller}-${lineObj.action}`;
  record[controller_action] = lineObj['@timestamp'];
  if(params.license_reference_id)licenses[params.license_reference_id] = params.id;
  copyParams.forEach(function(v){
    if(params[v])record[v]=params[v];
  });

  if(params.accepted_t_and_c) record.accepted_t_and_c = lineObj['@timestamp']

});

function handleNormalMessageWithId(line){

}

rd.on('close',function(){
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
})
