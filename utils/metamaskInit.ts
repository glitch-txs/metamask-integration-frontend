import {isOnMobile } from './handleMobile'

declare global{
    interface Window {
        ethereum?: any;
      }
}

type ConnectInfo = {
    chainId: string
}

//debuggers
const message = (msg: string)=>{
  const el = document.getElementById('display')
  if(el)
  el.innerHTML = msg
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
        if(window.ethereum){
          //Check it's not coinbase wallet provider:
          let provider = window.ethereum;
          // edge case if MM and CBW are both installed
          if (window.ethereum.providers?.length) {
            window.ethereum.providers.forEach(async (p: any) => {
              if (p.isMetaMask) provider = p;
            });
          }
          eventListeners(provider)
          message('provider metamask is installed')
          return provider
        }
        else if(mobile){
            console.log('deeplink?')
            message('mobile')
            return false
        }else{
            console.log('install Metamask')
            message('install metamask')
            return false
        }
    }
}

export const metamaskInit = ()=>{
    const provider = checkMetamask()
    if (Boolean(provider)){
      checkAccountAndChainId(provider)
    }
}

export const connectToMetamask = async ()=>{
    const provider = checkMetamask()
    if(Boolean(provider)){

        const requestConnection = async ()=>{
            await provider
            .request({ method: 'eth_requestAccounts' })
            .then((e: any)=> {
              message('connected')
              console.log(e, 'you are now connected - get account / chain id')})
            .catch((err: any) => {
              if (err.code === 4001) {
                // EIP-1193 userRejectedRequest error
                // If this happens, the user rejected the connection request.
                console.log('Please connect to MetaMask.');
              } else {
                console.error(err);
                message('failed to connect')
              }
            });
          }

          // metamask will ask firt to switch to the desired chain network, if user doesn't have the network it will
          // add request to add it automatically, after the user is in the intended network it will ask him to connect.
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x89' }],
          }).then(requestConnection).catch(async (er: any)=>{
            message(er.code.toString())
            if(er.code === 4902 || er?.data?.originalError?.code == 4902){
              
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: '0x89',
                      chainName: 'Polygon',
                      rpcUrls: ['https://polygon-rpc.com/'],
                    },
                  ],
                })
                .then(requestConnection)
                .catch((er: any)=>message(er.message.toString()))
            }
          })
    }
}