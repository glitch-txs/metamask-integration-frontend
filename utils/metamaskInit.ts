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
}

//Check if theres the provider, on mobile or needs to isntall metamask
//If the user is in metamask mobile app browser it will need to wait around 3s for the ethereum provider to function*
const checkMetamask = ()=>{
    if (typeof window != 'undefined'){
        if(window.ethereum){

            return true

        }else if(mobile){
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

            //Check it's not coinbase wallet provider:
            let provider = window.ethereum;
            // edge case if MM and CBW are both installed
            if (window.ethereum.providers?.length) {
              window.ethereum.providers.forEach(async (p: any) => {
                if (p.isMetaMask) provider = p;
              });
            }

            provider.request({ method: 'eth_accounts' })
            .then(async (accounts: string[])=>{
              if(typeof accounts[0] !== 'undefined'){
                console.log('you are connected with this account:',accounts[0])
                }

                //if there's an account then the user is connected to a specific chain
                provider.request({ method: 'eth_chainId' }).then((e: any)=> console.log(e))
            })

            eventListeners(provider)
    }
}

export const connectToMetamask = ()=>{
    const start = checkMetamask()
    if(start){
        //Check it's not coinbase wallet provider:
        let provider = window.ethereum;
        // edge case if MM and CBW are both installed
        if (window.ethereum.providers?.length) {
          window.ethereum.providers.forEach(async (p: any) => {
            if (p.isMetaMask) provider = p;
          });
        }

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