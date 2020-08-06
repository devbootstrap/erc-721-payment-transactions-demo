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

      // console.log('address', deployedNetwork.address)
      this.meta = new web3.eth.Contract(
        collectablesArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];

      console.log(accounts[0])

      this.refreshPage();
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  refreshPage: async function() {
    const { name, getCollectableTokenIds, getCollectableItem } = this.meta.methods;

    const tokenIds = await getCollectableTokenIds().call()

    // console.log('TOKEN IDS', tokenIds)
    const collectablesElement = document.getElementsByClassName("collectables")[0];
    let str = ''
    for(let id of tokenIds) {
      console.log('id', id)
      let item = await getCollectableItem(id).call()
      console.log(item)
      str += `<li>TokenId: ${id} | Name: ${item[0]} | Price: ${item[1]}</li>`
    }
    collectablesElement.innerHTML = str;
  },

  createCollectable: async function() {
    const tokenId = document.getElementById("tokenId").value;
    const name = document.getElementById("name").value;
    const price = parseInt(document.getElementById("price").value);

    this.setStatus("Minting new token... (please wait)");

    const { createCollectable } = this.meta.methods;
    await createCollectable(tokenId, name, price).send({ from: this.account });

    this.setStatus("Transaction complete!");
    this.refreshPage();
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
