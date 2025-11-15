import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, baseSepolia, mainnet } from "wagmi/chains";
import { http } from "viem";

export const config = getDefaultConfig({
    appName: "CosmiFi",
    projectId: "3a882e00d37608ab3c3429584b7ed1d6",
    chains: [mainnet, base, baseSepolia],
    transports: {
        [mainnet.id]: http(),
        [base.id]: http(),
        [baseSepolia.id]: http("https://base-sepolia-rpc.publicnode.com")
    },
    ssr: true
});