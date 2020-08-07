import Web3 from "web3";
import collectablesArtifact from "../../build/contracts/Collectables.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = collectablesArtifact.networks[networkId];

      this.meta = new web3.eth.Contract(
        collectablesArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];

      this.refreshPage();
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  refreshPage: async function() {
    const { web3 } = this;
    const { getCollectableTokenIds, getCollectableItem } = this.meta.methods;
    const tokenIds = await getCollectableTokenIds().call()
    const collectablesElement = document.getElementsByClassName("collectables")[0];

    let str = ''
    for(let id of tokenIds) {
      str += '<tr>'
      let item = await getCollectableItem(id).call()
      let price = web3.utils.fromWei(item[1].toString(), 'Ether')

      str += `<td>${id}</td><td>${item[0]}</td><td>${price}</td>`
      if (this.canBuy(item)) {
        str += `<td><button onclick="App.buyCollectable(${id}, ${price})">BUY</button></td>`
      } else {
        str += '<td>You are the owner!</td>'
      }
      str += '</tr>'
    }
    collectablesElement.innerHTML = str;
    this.setStatus('Page Loaded')
  },

  canBuy: function(item) {
    return this.account != item[2];
  },

  createCollectable: async function() {
    const { web3 } = this;
    const tokenId = document.getElementById("tokenId").value;
    const name = document.getElementById("name").value;
    const priceInEth = document.getElementById("price").value;
    const priceInWei = web3.utils.toWei(priceInEth, 'ether')
    const { createCollectable } = this.meta.methods;

    let msg
    this.setStatus("Minting new token... (please wait)");

    try {
      await createCollectable(tokenId, name, priceInWei).send({ from: this.account }).on('transactionHash', function(hash) {
        msg = `Collectable minted! Check on <a href="https://rinkeby.etherscan.io/tx/${hash}">Etherscan</a>`
      })
    }
    catch(e) {
      msg = e.message;
    }

    await this.refreshPage();
    this.setStatus(msg);
  },

  buyCollectable: async function (tokenId, price) {
    const { web3 } = this;
    const { buyCollectable } = this.meta.methods;
    let msg

    try {
      await buyCollectable(tokenId).send({from: this.account, value: web3.utils.toWei(price.toString(), 'ether') })
      msg = 'Transaction successful!'
    } catch (e) {
      msg = e.message
    }

    await this.refreshPage();
    this.setStatus(msg)
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },
};

window.App = App;

window.addEventListener("load", function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
    );
  }

  App.start();
});
