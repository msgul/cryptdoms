var express = require('express');
var app = express();
var path = require('path');
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 8080;
app.use(express.static(__dirname + '/public'))

var cryptdoms = require('./build/contracts/Cryptdoms.json'); //(with path)
var address = cryptdoms.networks["5777"].address
var abi = cryptdoms.abi;

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

io.on('connection', function (socket) {
    console.log(socket.id,"connected");
    socket.emit('contract', abi, address);

    socket.on('message', (sender,msg) => {
        io.emit('message',sender,msg);
        console.log(sender,msg);
    });
});

http.listen(port, function(){
    console.log("Running on port",port);
});
