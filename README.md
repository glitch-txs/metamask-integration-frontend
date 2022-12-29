Some recommendations from the Metamask API documentation:

>You should only initiate a connection request in response to direct user action, such as clicking a button. You should always disable the "connect" button while the connection request is pending. You should never initiate a connection request on page load.

`etherem.on('connect', handler)` and `ethereum.on('disconnect', handler)`
are event listeners that are going to track the provider connection to the blockchain 
(this does NOT track the wallet's connection):

*On disconnect event listener:*
>The MetaMask provider emits this event if it becomes unable to submit RPC requests to any chain. In general, this will only happen due to network connectivity issues or some unforeseen error.
>
>Once disconnect has been emitted, the provider will not accept any new requests until the connection to the chain has been re-established, which requires reloading the page. You can also use the ethereum.isConnected() method to determine if the provider is disconnected
