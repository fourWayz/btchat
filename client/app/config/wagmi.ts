import { createConfig, http } from 'wagmi'
import { base,citreaTestnet } from 'viem/chains'
import { injected, coinbaseWallet, walletConnect } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [citreaTestnet] as const, 
  transports: {
    [citreaTestnet.id]: http(), 
  },
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID!
    })
  ]
})