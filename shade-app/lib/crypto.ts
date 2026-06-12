import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';
import { logger } from '@/lib/logger';

export const getEthBalance = async (address: string, providerUrl = 'https://eth.llamarpc.com') => {
    try {
        const network = ethers.Network.from(1);
        const provider = new ethers.JsonRpcProvider(providerUrl, network, { staticNetwork: network });
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
    } catch (error) {
        logger.warn('Could not fetch ETH balance', { error });
        return '0.0';
    }
};

export const getPolygonBalance = async (address: string, providerUrl = 'https://1rpc.io/matic') => {
    try {
        const network = ethers.Network.from(137);
        const provider = new ethers.JsonRpcProvider(providerUrl, network, { staticNetwork: network });
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
    } catch (error) {
        logger.warn('Could not fetch MATIC balance', { error });
        return '0.0';
    }
};

export const getSolBalance = async (address: string, clusterUrl = 'https://api.mainnet-beta.solana.com') => {
    try {
        const connection = new Connection(clusterUrl);
        const publicKey = new PublicKey(address);
        const balance = await connection.getBalance(publicKey);
        return (balance / LAMPORTS_PER_SOL).toFixed(4);
    } catch (error) {
        logger.warn('Could not fetch SOL balance', { error });
        return '0.0';
    }
};

export const shortenAddress = (address: string, chars = 4) => {
    if (!address) return '';
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};
