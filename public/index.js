var canvas = document.getElementById('canvas-map');
var ctx = canvas.getContext("2d");
const width = canvas.width;
const height = canvas.height;
var loading_div = document.getElementById("map-loading");
var h2 = document.getElementById("kingdom-h2");
var kg_col = document.getElementById("kg-col");
var kg_name = document.getElementById("kg-name");
var kg_div = document.getElementById("kingdom-div");
var top_list_a = document.getElementsByClassName("top-list");
var cre_kg = document.getElementById("create-kingdom");
var cur_kg = document.getElementById("current-kingdom");
var chat_tb = document.getElementById("chat-tb");
var chat_bd = document.getElementById("chat-body");
var currentAccount;
const map_size = 100;
var currentKingdom;
var adrToKingdom = [];
var map;
var attackMode = false;
var attackerLand;

const socket = io();

socket.on('connect', () => {
    console.log("connected");
    socket.on("contract", (contract_abi, contract_adr) => {
        // getting ABI file from server
        startApp(contract_abi, contract_adr);
    });

    socket.on('message', (sender,msg) => {
        chat_bd.innerText += sender + ": " + msg + "\n";
        chat_bd.scrollTop = chat_bd.scrollHeight;
    });
});

async function startApp(contract_abi, contract_adr){
    console.log("Connecting to Web3...");
    await connectWeb3(contract_abi, contract_adr);
    console.log("Connecting to MetaMask...");

    // to handle account change
    setInterval(function(){ connectMetamask(); }, 200);
    console.log("Displaying map...");
    await displayMap();
}

chat_tb.onkeydown = function(e) {
    if (e.key === 'Enter' || e.keyCode === 13) {
        if(chat_tb.value != ""){
            socket.emit('message',currentKingdom.kingdomName,chat_tb.value);
            chat_tb.value = "";
        }
        
    }
};

async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        console.log('Please connect to MetaMask.');
    } else if (accounts[0] !== currentAccount) {
        currentAccount = accounts[0];
        console.log("Account changed to",currentAccount);
        currentKingdom = await getKingdom(currentAccount);
        if(currentKingdom.isCreated == 1)
            await displayKingdom(currentKingdom);
        else{
            cur_kg.style.display = "none";
            cre_kg.style.display = "block";
        }
           
    }
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

async function connectWeb3(contract_abi, contract_adr) {
    if (typeof web3 !== 'undefined') {
        web3js = new Web3(web3.currentProvider);
    } else {
        this.prompt("Please install Metamask to play!");
    }

    cryptdom = new web3js.eth.Contract(contract_abi, contract_adr);

    cryptdom.events.LandBought({})
    .on('data', async function(event){
        result = event.returnValues;
        console.log(result._owner,"bought",result._landId);
        await displayMap();
    })
    .on('error', console.error);

    cryptdom.events.Battle({})
    .on('data', async function(event){
        result = event.returnValues;
        console.log(result._attacker,"attacked",result._defender,result._success);
        await displayMap();
    })
    .on('error', console.error);
}

async function displayMap(){
    map = await cryptdom.methods.viewMap().call();
    await drawMap(map[1]);
    

    for(i=0;i<map_size;i++){
        if(map[0][i] != 0)
            adrToKingdom[map[0][i]] = map[1][i];
    }

    await getKingdomList(map[0]);
}

async function drawMap(map){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let id = 0; 
    for(i=0;i<10;i++){
        for(j=0;j<10;j++){
            if(map[id].isCreated != 0)
                ctx.fillStyle = "rgba(" + map[id].r + "," + map[id].g + "," + map[id].b +",0.7)";
            else
                ctx.fillStyle = "rgb(190,190,190)";
            ctx.fillRect(j*50, i*50, 49, 49);
            id++;
        }
    }

}

async function getKingdomList(map){
    let adress_land_count = [];
    for(i=0;i<map_size;i++){
        if(map[i] != 0){
            if(!adress_land_count[map[i]]){
                adress_land_count[map[i]] = 1;  
            }else
                adress_land_count[map[i]]++;
        }
    }
    
    // Create items array
    var items = Object.keys(adress_land_count).map(function(key) {
        return [key, adress_land_count[key]];
    });
    // Sort the array based on the second element
    items.sort(function(first, second) {
        return second[1] - first[1];
    });
    // Create a new array with only the first 10 items
    let kingdom_list = items.slice(0, top_list_a.length);
    for(i=0;i < top_list_a.length;i++){
        if(kingdom_list[i]){
            top_list_a[i].innerText = adrToKingdom[kingdom_list[i][0]].kingdomName;

            // adding medal at the end of the text
            if(i == 0)
                top_list_a[i].innerHTML += " &#129351;";
            if(i == 1)
                top_list_a[i].innerHTML += " &#129352;";
            if(i == 2)
                top_list_a[i].innerHTML += " &#129353;";

            top_list_a[i].getElementsByTagName("span").innerText = kingdom_list[i];
            
            var span = document.createElement("span");
            span.innerText = kingdom_list[i][1];
            let r = adrToKingdom[kingdom_list[i][0]].r;
            let g = adrToKingdom[kingdom_list[i][0]].g;
            let b = adrToKingdom[kingdom_list[i][0]].b;
            top_list_a[i].style.backgroundColor = "rgba("+r+","+g+","+b+",0.31)";

            top_list_a[i].appendChild(span);


        }
        
    }
}

async function displayKingdom(kingdom){
    h2.innerText = "[ " + kingdom.kingdomName + " ]";
    cre_kg.style.display = "none";
    cur_kg.style.display = "block";
    kg_div.style.borderColor = "rgba(" + kingdom.r +","+kingdom.g+","+kingdom.b+",0.7)";
}

async function buyLand(landId,kName,red,green,blue){
    return await cryptdom.methods.buyLand(landId,kName,red,green,blue).send({from:currentAccount, value:10});
}

async function attackLand(myLand, otherLand){
    return await cryptdom.methods.attackLand(myLand, otherLand).send({from:currentAccount});
}

async function getCursorPosition(canvas, event) {

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    land_index = Math.floor(x/50) + Math.floor(y/50)*10;

    if(map[1][land_index].isCreated == 0){
        if(currentKingdom.isCreated){
            receipt = await buyLand(land_index,currentKingdom.kingdomName,currentKingdom.r,currentKingdom.g,currentKingdom.b);
            console.log(receipt);
            alert("Land bought! Tx Hash: " + receipt.transactionHash);
        }
        else
            prompt("Please create a kingdom!");
    } else {
        if(map[0][land_index].toLowerCase() == currentAccount){
            attackMode = true;
            attackerLand = land_index;
            console.log("Attacking from",attackerLand);
        } 
        else if(attackMode){
            console.log("Attacking",land_index);
            console.log(await attackLand(attackerLand, land_index));
        }
    }
    // other cases will be added
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
