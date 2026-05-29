import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authWithWallet, UserProfile } from '@/lib/api';
import { serializeSecret, deserializeSecret } from '@/lib/phantom';
import { logger } from '@/lib/logger';

interface WalletContextType {
  phantomAddress: string | null;
  phantomSession: string | null;
  phantomSharedSecret: Uint8Array | null;
  phantomDappPublicKey: string | null;
  evmAddress: string | null;
  userProfile: UserProfile | null;
  connectPhantom: (address: string, session: string, sharedSecret: Uint8Array, dappPublicKey: Uint8Array) => void;
  disconnectPhantom: () => void;
  connectEVM: (address: string) => void;
  disconnectEVM: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [phantomAddress, setPhantomAddress] = useState<string | null>(null);
  const [phantomSession, setPhantomSession] = useState<string | null>(null);
  const [phantomSharedSecret, setPhantomSharedSecret] = useState<Uint8Array | null>(null);
  const [phantomDappPublicKey, setPhantomDappPublicKey] = useState<string | null>(null);
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const [savedAddress, savedSession, savedSecret, savedDappKey, savedEvmAddress, savedProfile] =
          await AsyncStorage.multiGet([
            'phantom_address',
            'phantom_session',
            'phantom_shared_secret',
            'phantom_dapp_public_key',
            'evm_address',
            'user_profile',
          ]);

        if (savedAddress[1] && savedSession[1]) {
          setPhantomAddress(savedAddress[1]);
          setPhantomSession(savedSession[1]);
        }
        if (savedSecret[1]) {
          setPhantomSharedSecret(deserializeSecret(savedSecret[1]));
        }
        if (savedDappKey[1]) {
          setPhantomDappPublicKey(savedDappKey[1]);
        }
        if (savedEvmAddress[1]) {
          setEvmAddress(savedEvmAddress[1]);
        }
        if (savedProfile[1]) {
          setUserProfile(JSON.parse(savedProfile[1]));
        }
      } catch (e) {
        logger.error('Failed to load wallet info', { error: e });
      }
    };
    loadWallet();
  }, []);

  const connectPhantom = async (
    address: string,
    session: string,
    sharedSecret: Uint8Array,
    dappPublicKey: Uint8Array,
  ) => {
    const serializedSecret = serializeSecret(sharedSecret);
    const serializedDappKey = serializeSecret(dappPublicKey);

    setPhantomAddress(address);
    setPhantomSession(session);
    setPhantomSharedSecret(sharedSecret);
    setPhantomDappPublicKey(serializedDappKey);

    try {
      await AsyncStorage.multiSet([
        ['phantom_address', address],
        ['phantom_session', session],
        ['phantom_shared_secret', serializedSecret],
        ['phantom_dapp_public_key', serializedDappKey],
      ]);
      const { user } = await authWithWallet(address, 'phantom');
      setUserProfile(user);
      await AsyncStorage.setItem('user_profile', JSON.stringify(user));
      logger.info('Phantom auth success', { address });
    } catch (e) {
      logger.error('Failed to save Phantom wallet info', { error: e });
    }
  };

  const disconnectPhantom = async () => {
    setPhantomAddress(null);
    setPhantomSession(null);
    setPhantomSharedSecret(null);
    setPhantomDappPublicKey(null);
    setUserProfile(null);
    try {
      await AsyncStorage.multiRemove([
        'phantom_address',
        'phantom_session',
        'phantom_shared_secret',
        'phantom_dapp_public_key',
        'user_profile',
      ]);
    } catch (e) {
      logger.error('Failed to remove Phantom wallet info', { error: e });
    }
  };

  const connectEVM = async (address: string) => {
    setEvmAddress(address);
    try {
      await AsyncStorage.setItem('evm_address', address);
      const { user } = await authWithWallet(address, 'evm');
      setUserProfile(user);
      await AsyncStorage.setItem('user_profile', JSON.stringify(user));
      logger.info('EVM auth success', { address });
    } catch (e) {
      logger.error('Failed to save EVM wallet info', { error: e });
    }
  };

  const disconnectEVM = async () => {
    setEvmAddress(null);
    setUserProfile(null);
    try {
      await AsyncStorage.multiRemove(['evm_address', 'user_profile']);
    } catch (e) {
      logger.error('Failed to remove EVM wallet info', { error: e });
    }
  };

  return (
    <WalletContext.Provider
      value={{
        phantomAddress,
        phantomSession,
        phantomSharedSecret,
        phantomDappPublicKey,
        evmAddress,
        userProfile,
        connectPhantom,
        disconnectPhantom,
        connectEVM,
        disconnectEVM,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
