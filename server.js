
var express = require('express');
const { connect } = require('http2');
var app = express();
var path = require('path');
// var bodyParser = require('body-parser');
var http = require('http').createServer(app);
var io = require('socket.io')(http);
app.use(express.static(__dirname + '/public'))
var port = process.env.PORT || 8080;

/*
Web3 = require("web3");
cryptdom_contract = require("./build/contracts/Cryptdom.json");

const web3 = new Web3("ws://localhost:9545");
let cryptdom = new web3.eth.Contract(cryptdom_contract.abi, "0x2083e8a28E28Da608046442E0e8a2945d14cc4AB");
async function test_func(){
    let map = await cryptdom.methods.viewMap().call()
    console.log(map);
}
*/
//test_func();

var ABI = require('./build/contracts/Cryptdoms.json').abi; //(with path)

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

io.on('connection', function (socket) {
    console.log(socket.id,"connected");
    socket.emit('abi',ABI);
});

http.listen(port, function(){
    console.log("Running on port",port);
});
