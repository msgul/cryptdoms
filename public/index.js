var canvas = document.getElementById('canvas-map');
var ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;

const socket = io();

socket.on('connect', () => {
    console.log("connected");
});

var userAccount;

async function connect() {
    var cryptdomAddress = "0xb5dBB480De92D0C4C10Ed5d23A6FDeEF93E37352";
    cryptdom = new web3js.eth.Contract(cryptdomABI.abi, cryptdomAddress);

    var map = await viewMap();
    console.log(map[1]);
    drawMap(map[1]);
}

async function viewMap(){
    return await cryptdom.methods.viewMap().call();
}

function drawMap(map){
    let id = 0;
    for(i=0;i<10;i++){
        for(j=0;j<10;j++){
            ctx.fillStyle = "rgb(" + map[id].r + "," + map[id].g + "," + map[id].b +")";
            ctx.fillRect(i*50, j*50, 49, 49);
            id++;
        }
    }
}

window.addEventListener('load', async function() {
    if (typeof web3 !== 'undefined') {
        web3js = new Web3(web3.currentProvider);
    } else {
        this.prompt("Please install Metamask to play!");
    }
    connect();
});