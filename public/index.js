var canvas = document.getElementById('canvas-map');
var ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;
var loading_div = document.getElementById("map-loading");
var currentAccount;
var map;

const socket = io();

socket.on('connect', () => {
    console.log("connected");
});

window.addEventListener('load', async function() {
    console.log("Connecting to Web3...");
    
    await connectWeb3();
    console.log("Connecting to MetaMask...");
    setInterval(function(){connectMetamask();}, 100);
    console.log("Displaying map...");
    await displayMap();
});


function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        console.log('Please connect to MetaMask.');
    } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0];
    }
}

function connectMetamask(){
    ethereum.request({ method: 'eth_requestAccounts' })
    .then(handleAccountsChanged)
    .catch((err) => {
    if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log('Please connect to MetaMask.');
    } else {
        console.error(err);
    }
    })
}

async function connectWeb3() {
    if (typeof web3 !== 'undefined') {
        web3js = new Web3(web3.currentProvider);
    } else {
        this.prompt("Please install Metamask to play!");
    }
    
    var cryptdomAddress = "0x2083e8a28E28Da608046442E0e8a2945d14cc4AB";
    cryptdom = new web3js.eth.Contract(cryptdomABI.abi, cryptdomAddress);
}

async function displayMap(){
    map = await cryptdom.methods.viewMap().call();
    await drawMap(map[1]);
}

async function drawMap(map){
    let id = 0;
    for(i=0;i<10;i++){
        for(j=0;j<10;j++){
            if(map[id].kingdomName != "")
                ctx.fillStyle = "rgb(" + map[id].r + "," + map[id].g + "," + map[id].b +")";
            else
                ctx.fillStyle = "rgb(190,190,190)";
            ctx.fillRect(j*50, i*50, 49, 49);
            id++;
        }
    }
}

async function buyLand(landId,kName,red,green,blue){
    return await cryptdom.methods.buyLand(landId,kName,red,green,blue).send({from:currentAccount, value:10});
}

async function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    land_index = Math.floor(x/50) + Math.floor(y/50)*10;
    await buyLand(land_index,"king",100,250,250);
    await displayMap();
}

canvas.addEventListener('mousedown', async function(e) {
    await getCursorPosition(canvas, e);
})