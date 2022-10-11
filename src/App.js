import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import factoryContract from './contracts/Factory.json';

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [inputs, setInputs] = useState({});

  const abi = factoryContract.abi;
  const address = factoryContract.networks[0x61].address;
  const chain = {
    chainId: "0x61",
    chainName: "Binance Smart Chain Testnet",
    nativeCurrency: {
      name: "Build and Build",
      symbol: "tBNB",
      decimals: 18,
    },
    rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
    blockExplorerUrls: ["https://testnet.bscscan.com"],
    iconUrls: [
      "https://bin.bnbstatic.com/image/admin_mgs_image_upload/20201110/550eda20-1b9a-4bc7-9a65-e4a329e8bb57.png"
    ]
  };

  const shorter = (str) => str && str.length > 8 ? str.slice(0, 5) + "..." + str.slice(-4) : str;

  const handleChange = (event) => {
    const { ethereum } = window;
    const name = event.target.name;
    const value = event.target.value;
    setInputs(values => ({...values, [name]: value}));

    if (!currentAccount) {
      alert("Para começar, conecte sua MetaMask!");
      setInputs({});
    }

    if(currentAccount && ethereum.chainId !== "0x61") {
      setInputs({});
      if(window.confirm("Rede incorreta. Conectar-se à rede Binance Smart Chain?")) handleConnectWallet();      
    }
  }

  const handleConnectWallet = async () => {  
    const { ethereum } = window;

    if (!ethereum) {
      if(window.confirm("MetaMask não instalada. Instalar agora?")) document.location = "https://metamask.io/download/";
    } else {
      ethereum.request({
        method: "wallet_addEthereumChain",
        params: [chain],
      }).catch((error) => {
        console.log(error);
        alert("Ocorreu um erro. Certifique-se de que a MetaMask está pronta para uso!");
      });
      try {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        setCurrentAccount(accounts[0]);
      } catch (err) {
        console.log(err);
      }
    }    
  }

  const handleCreateTokenSubmit = async (event) => {
    event.preventDefault();
    try {
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      const contract = new ethers.Contract(address, abi, signer);
      if (ethereum && ethereum.chainId === "0x61") {
        console.log("Os tokens estão sendo cunhados... Aguarde!");
        let tokenTxn = await contract.deployNewERC20Token(
          inputs.name, {value: inputs.name},
          inputs.symbol, {value: inputs.symbol},
          inputs.gain, {value: inputs.gain},
          inputs.receivers, {value: inputs.receivers},
          inputs.amounts, {value: inputs.amounts}
        );
        setInputs({});
        alert(`Tokens ${inputs.symbol} - ${inputs.name} emitidos.`);
        await tokenTxn.wait();        
      } else {
        ethereum.request({
          method: "wallet_addEthereumChain",
          params: [chain],
        }).catch((error) => {
          console.log(error);
          alert("Ocorreu um erro. Certifique-se de que a MetaMask está pronta para uso!");
        });
      }
    } catch (err) {
      console.log(err);
      setInputs({});
    }        
  }

  const accountLabel = () => {
    return (
      <small>{shorter(ethers.utils.getAddress(currentAccount))}</small>
    )
  }

  const connectWalletButton = () => {
    return (
      <button type="button" onClick={handleConnectWallet} >
        Conectar MetaMask
      </button>
    )
  }

  useEffect(() => {    
    const checkWalletIsConnected = async () => {
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum, "any");    
      provider.on("network", (newNetwork, oldNetwork) => {
        if (oldNetwork) {
          window.location.reload();
        }    
      });
      const setAccountListener = (provider) => {
        provider.on("accountsChanged", (_) => {
          window.location.reload()
        });
      };
      if (ethereum) {        
        const accounts = await ethereum.request({ method: "eth_accounts" });
        setAccountListener(ethereum);       
        if (accounts.length !== 0) {          
          const account = accounts[0];
          setCurrentAccount(account);
        }        
      }
    }
    
    checkWalletIsConnected();
        
  },[abi, address]);

  return (
    <div className="text-center p-1">
      <div>
        <h1>Tokens de Créditos de Energia</h1>
      </div>
      <div className="text-right">
        {currentAccount ? accountLabel() : connectWalletButton()}
      </div>
      <div className="flex flex-row">
        <div className="w-1/2">
          <h2>Administrativo</h2>
          <div className="flex flex-row border border-green-500">
            <div className="w-1/2 border border-indigo-500 ">
              <form >
                <fieldset className="flex flex-col text-left">
                <legend>Emissão de créditos</legend>
                <label>Nome:</label>
                <input type="text" name="name" value={inputs.name || ""} onChange={handleChange}></input>
                <label>Símbolo:</label>
                <input type="text" name="symbol" value={inputs.symbol || ""} onChange={handleChange}></input>
                <label>Recompensa:</label>
                <input type="number" name="gain" value={inputs.gain || ""} onChange={handleChange}></input>
                <label>Geradores:</label>
                <input type="text" name="receivers" value={inputs.receivers || ""} onChange={handleChange}></input>
                <label>Quantidade:</label>
                <input type="text" name="amounts" value={inputs.amounts || ""} onChange={handleChange}></input>
                <button type="submit" onClick={handleCreateTokenSubmit}>Emitir Token</button>
                </fieldset>
              </form> 
            </div>
            <div className="flex flex-col w-1/2 border border-fuchsia-500">
              <button>Todos os Tokens</button>
              <div className="flex flex-col border border-black">
                <label>Linha 1</label>
                <label>Linha 2</label>
                <label>Linha 3</label>
                <label>Linha 1</label>
                <label>Linha 2</label>               
              </div>
              <form>
                <fieldset className="flex flex-col text-left">
                  <legend>Ver saldo</legend>
                  <label>Endereço:</label>
                  <input></input>
                  <button>Consultar</button>
                  <label>Saldo do contrato: 9999999</label>
                </fieldset>
              </form>              
            </div>         
          </div> 
        </div>
        <div className="w-1/2">
          <h2>Cliente</h2>
          <div className="flex flex-col border border-orange-500">
            <div className="w-full border border-gray-500 ">
              <form >
                <fieldset className="flex flex-row text-left">
                  <legend>Utilizar créditos</legend>
                  <label>Unidade Consumidora:</label>
                  <input></input>
                  <label>Quantidade:</label>
                  <input></input>
                  <button type="submit">Enviar</button>
                </fieldset>
              </form>
              <label>Nº do Recibo: 999999999</label> 
            </div>
            <div className="w-full flex flex-col border border-emerald-500">
            <form >
                <fieldset className="flex flex-row text-left">
                  <legend>Consultar validade</legend>
                  <label>Endereço:</label>
                  <input></input>
                  <button type="submit">Consultar</button>                  
                </fieldset>
              </form>
              <label>15/12/2027</label>
            </div>
            <div className="w-full flex flex-col border border-red-500">
            <form >
                <fieldset className="flex flex-row text-left">
                  <legend>Consultar Recibo</legend>
                  <label>Nº do Recibo:</label>
                  <input></input>
                  <button type="submit">Consultar</button>                  
                </fieldset>
              </form>
              <label>Data: 15/12/2027</label>
              <label>Unidade Consumidora: 99999999</label>
              <label>Quantidade: 999999</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
