var canvas = document.getElementById('canvas-map');
var ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;
var loading_div = document.getElementById("map-loading");
var h2 = document.getElementById("kingdom-h2");
var kg_col = document.getElementById("kg-col");
var kg_name = document.getElementById("kg-name");
var kg_div = document.getElementById("kingdom-div");
var currentAccount;
var currentKingdom;
var cryptdomABI;
var map;

const socket = io();

socket.on('connect', () => {
    console.log("connected");
    socket.on("abi", ABI => {
        // getting ABI file from server
        startApp(ABI);
    });
});

async function startApp(ABI){
    console.log("Connecting to Web3...");
    await connectWeb3();
    console.log("Connecting to MetaMask...");

    // to handle account change
    setInterval(function(){ connectMetamask(); }, 200);
    console.log("Displaying map...");
    await displayMap();
}

async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        console.log('Please connect to MetaMask.');
    } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0];
        console.log("Account changed to",currentAccount);
        currentKingdom = await getKingdom(currentAccount);
        if(currentKingdom.isCreated == 1)
            await displayKingdom(currentKingdom);
        else
            h2.innerText = "Please create a kingdom";
    }
}

async function displayKingdom(kingdom){
    h2.innerText = "Kingdom: " + kingdom.kingdomName;
    kg_div.style.backgroundColor = "rgb(" + kingdom.r +","+kingdom.g+","+kingdom.b+")";
    h2.style.color = "rgb(" +(255-kingdom.r)+","+(255-kingdom.g)+","+(255-kingdom.b)+")";
}

function connectMetamask(){
    ethereum.request({ method: 'eth_requestAccounts' })
    .then(handleAccountsChanged)
    .catch((err) => {
    if (err.code === 4001) {
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
    console.log(map);
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

    if(map[1][land_index].isCreated == 0){
        if(currentKingdom.isCreated)
        await buyLand(land_index,currentKingdom.kingdomName,currentKingdom.r,currentKingdom.g,currentKingdom.b);
    else
        prompt("Please create a kingdom!");
    }
    // other cases will be added

    await displayMap();
}

async function getKingdom(address){
    return await cryptdom.methods.getKingdomByAddress(address).call();
}

canvas.addEventListener('mousedown', async function(e) {
    await getCursorPosition(canvas, e);
})

function createKingdom()
{
    currentKingdom = {};
    currentKingdom.isCreated = 1;
    currentKingdom.kingdomName = kg_name.value;
    colors = getColors();
    currentKingdom.r = colors[0];
    currentKingdom.g = colors[1];
    currentKingdom.b = colors[2];
    displayKingdom(currentKingdom);
}

function getColors() {
    const color = kg_col.value;
    colors = [];
    colors.push(parseInt(color.substr(1,2), 16));
    colors.push(parseInt(color.substr(3,2), 16));
    colors.push(parseInt(color.substr(5,2), 16));
    return colors;
}
  
