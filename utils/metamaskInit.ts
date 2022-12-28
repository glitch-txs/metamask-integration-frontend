import {isOnMobile } from './handleMobile'

declare global{
    interface Window {
        ethereum?: any;
      }
}

type ConnectInfo = {
    chainId: string
}

//True if user is on mobile
const mobile = isOnMobile()

//Check account and chain id:
const checkAccountAndChainId = (provider: any)=>{
  provider.request({ method: 'eth_accounts' })
  .then(async (accounts: string[])=>{
    if(typeof accounts[0] !== 'undefined'){
      console.log('you are connected with this account:',accounts[0])
      }

      //if there's an account then the user is connected to a specific chain
      provider.request({ method: 'eth_chainId' }).then((e: any)=> console.log(e))
  })
}

//Check it's not coinbase wallet provider:
const checkCoinBase = ()=>{
  let provider = window.ethereum;
  // edge case if MM and CBW are both installed
  if (window.ethereum.providers?.length) {
    window.ethereum.providers.forEach(async (p: any) => {
      if (p.isMetaMask) provider = p;
    });
  }
  return provider
}

//Init Metamask API event listeners
const eventListeners = (provider: any)=>{
    provider.on("accountsChanged", (accounts: string[]) => {
        console.log('new address:',accounts[0]);
        if(typeof accounts[0] == 'undefined'){
            console.log('user disconnected')
        }
    });

    provider.on("chainChanged", (chainId: number) => {
        console.log(chainId)
        //restart states
    });

    provider.on('connect', (connectInfo: ConnectInfo)=>{
        console.log('provider is connected in:', connectInfo)
    });

    provider.on('disconnect', (err: any)=>{
        console.log('the provider is desconnected from blockchain, refresh the dapp and check your internet connection')
        console.error(err)
    });

    // In case the user leaves the website to go to another website and changes the the settings
    const windowFocus = ()=>{
      checkAccountAndChainId(provider)
    }
    window.addEventListener('focus',windowFocus)
}

//Check if theres the provider, on mobile or needs to isntall metamask
//If the user is in metamask mobile app browser it will need to wait around 3s for the ethereum provider to function*
const checkMetamask = ()=>{
    if (typeof window != 'undefined'){
        if(window.ethereum) return true
        else if(mobile){
            console.log('deeplink?')
            return false
        }else{
            console.log('install Metamask')
            return false
        }
    }
}

export const metamaskInit = ()=>{
    const start = checkMetamask()
    if (start){
      const provider = checkCoinBase()
      checkAccountAndChainId(provider)
      eventListeners(provider)
    }
}

export const connectToMetamask = ()=>{
    const start = checkMetamask()
    if(start){
      const provider = checkCoinBase()

        provider
        .request({ method: 'eth_requestAccounts' })
        .then((e: any)=> console.log(e, 'you are now connected - get account / chain id'))
        .catch((err: any) => {
          if (err.code === 4001) {
            // EIP-1193 userRejectedRequest error
            // If this happens, the user rejected the connection request.
            console.log('Please connect to MetaMask.');
          } else {
            console.error(err);
          }
        });

        eventListeners(provider)
    }
}