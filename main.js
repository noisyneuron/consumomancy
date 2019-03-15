const si = require('systeminformation');
const util = require('util')
const request = require('request');
const opn = require('opn');

var stats = {};
var vals = {};
var indices;
var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
var baseAsin = "B07CXDY7G1";

var t = si.time();

stats.time = t.current;
stats.uptime = t.uptime;

var cpu = si.currentLoad()
  .then(function(data) {
    // console.log(data);
    stats.cUserload = data.currentload_user;
    stats.cSysload = data.currentload_system;
    stats.cIdleload = data.currentload_idle;
    stats.cAvgload = data.avgload;
  })
  .catch(function(error) {
    console.log(error);
  })

var mem = si.mem()
  .then(function(data) {
    // console.log(data);
    stats.mFree = data.free;
    stats.mUsed = data.used;
    stats.mActive = data.active;
    stats.mAvailable = data.available;
  })
  .catch(function(error) {
    console.log(error);
  })

var net = si.networkConnections()
  .then(function(data) {
    // console.log(data.length);
    stats.nConnections = data.length;
  })
  .catch(function(error) {
    console.log(error);
  })

var proc = si.processes()
  .then(function(data) {
    // console.log(data);
    stats.nRunning = data.running;
    stats.nSleeping = data.sleeping;
  })
  .catch(function(error) {
    console.log(error);
  })


function generateNumbers() {
  var d2poss = [0,1,6,7];
  vals.d2 = d2poss[stats.time % d2poss.length];
  vals.d3 = stats.uptime % 36;
  vals.d4 = parseInt(stats.cUserload.toString().replace('.',''))  % 36;
  vals.d5 = parseInt(stats.cSysload.toString().replace('.',''))  % 36;
  vals.d6 = parseInt(stats.cIdleload.toString().replace('.',''))  % 36;
  vals.d7 = stats.mFree % 36;
  vals.d8 = stats.mUsed % 36;
  vals.d9 = stats.mActive % 36;
}

function generateAsin() {
  var asin = "B0";
  asin += vals.d2;
  asin += chars[vals.d2];
  asin += chars[vals.d3];
  asin += chars[vals.d4];
  asin += chars[vals.d5];
  asin += chars[vals.d6];
  asin += chars[vals.d7];
  asin += chars[vals.d8];
  return asin;
}

function generateIndices() {
  var singleStr = "";
  for (const [key, value] of Object.entries(stats)) {
    singleStr += value.toString().replace('.','');
  }
  indices = singleStr.split('');
  indices = new Set(indices);
  indices = Array.from(indices);
  indices = indices.filter(function(n) { return n >= 3; });
}


function getAmazon(asin, index, it) {
  var url = "https://www.amazon.com/dp/" + asin;
  // console.log(vals);
  // console.log(asin);
  request(url, function (error, response, body) {
    // console.log(response.statusCode);
    if(response && response.statusCode != 404) {
      opn(url);
      process.exit();
    } else {
      process.stdout.write(".");    
      if(it >= chars.length) {
        index += 1;
        it = 0;
      }
      if(index >= indices.length) {
        console.log("uhh... seems you have no future, no future needs. good bye.");
        process.exit();
      } else {
        var idx = parseInt(indices[index]);
        // console.log(asin.substring(idx + 1));
        var newAsin = asin.substr(0, idx) + chars[it] + asin.substr(idx + 1);
        // console.log(newAsin);
        setTimeout(function() {
          getAmazon(newAsin, index, it+1);
        }, 200);
      }
    }
  });
}


Promise.all([cpu, mem, net, proc])
  .then(function(data) {
    generateNumbers();
    generateIndices();
    // console.log(indices);
    // console.log(indices);
    process.stdout.write("Please wait while I determine who you are and what you need ...")
    var asin = generateAsin();  
    getAmazon(asin, 0, 0);
  })
  .catch(function(error) {
    console.log(error);
  })




