"use client"

import type React from "react"
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { WagmiProvider } from "wagmi"
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"

// Define Lisk networks
const lisk = {
  id: 1135,
  name: "Lisk",
  nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.api.lisk.com"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://blockscout.lisk.com" },
  },
} as const

const liskSepolia = {
  id: 4202,
  name: "Lisk Sepolia",
  nativeCurrency: { name: "Ethereum", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.sepolia-api.lisk.com"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://sepolia-blockscout.lisk.com" },
  },
  testnet: true,
} as const

const config = getDefaultConfig({
  appName: "LuckyMotorsEnsure Lottery",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "your-project-id",
  chains: [lisk, liskSepolia, mainnet, polygon, optimism, arbitrum, base],
  ssr: true,
})

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={{
            blurs: {
              modalOverlay: "small",
            },
            colors: {
              accentColor: "#3b82f6",
              accentColorForeground: "white",
              actionButtonBorder: "rgba(255, 255, 255, 0.04)",
              actionButtonBorderMobile: "rgba(255, 255, 255, 0.08)",
              actionButtonSecondaryBackground: "rgba(255, 255, 255, 0.08)",
              closeButton: "rgba(224, 232, 255, 0.6)",
              closeButtonBackground: "rgba(255, 255, 255, 0.08)",
              connectButtonBackground: "#1f2937",
              connectButtonBackgroundError: "#ef4444",
              connectButtonInnerBackground:
                "linear-gradient(0deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.15))",
              connectButtonText: "#ffffff",
              connectButtonTextError: "#ffffff",
              connectionIndicator: "#10b981",
              downloadBottomCardBackground:
                "linear-gradient(126deg, rgba(255, 255, 255, 0) 9.49%, rgba(171, 171, 171, 0.04) 71.04%), #1a1b1f",
              downloadTopCardBackground:
                "linear-gradient(126deg, rgba(171, 171, 171, 0.2) 9.49%, rgba(255, 255, 255, 0) 71.04%), #1a1b1f",
              error: "#ef4444",
              generalBorder: "rgba(255, 255, 255, 0.08)",
              generalBorderDim: "rgba(255, 255, 255, 0.04)",
              menuItemBackground: "rgba(224, 232, 255, 0.1)",
              modalBackdrop: "rgba(0, 0, 0, 0.5)",
              modalBackground: "#1f2937",
              modalBorder: "rgba(255, 255, 255, 0.08)",
              modalText: "#ffffff",
              modalTextDim: "rgba(224, 232, 255, 0.3)",
              modalTextSecondary: "rgba(255, 255, 255, 0.6)",
              profileAction: "rgba(224, 232, 255, 0.1)",
              profileActionHover: "rgba(224, 232, 255, 0.2)",
              profileForeground: "#1f2937",
              selectedOptionBorder: "rgba(224, 232, 255, 0.1)",
              standby: "#fbbf24",
            },
            fonts: {
              body: "Inter, system-ui, sans-serif",
            },
            radii: {
              actionButton: "12px",
              connectButton: "12px",
              menuButton: "12px",
              modal: "24px",
              modalMobile: "28px",
            },
            shadows: {
              connectButton: "0px 8px 32px rgba(0, 0, 0, 0.32)",
              dialog: "0px 8px 32px rgba(0, 0, 0, 0.32)",
              profileDetailsAction: "0px 2px 6px rgba(37, 41, 46, 0.04)",
              selectedOption: "0px 2px 6px rgba(0, 0, 0, 0.24)",
              selectedWallet: "0px 2px 6px rgba(0, 0, 0, 0.12)",
              walletLogo: "0px 2px 16px rgba(0, 0, 0, 0.16)",
            },
          }}
          modalSize="compact"
          initialChain={lisk}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
