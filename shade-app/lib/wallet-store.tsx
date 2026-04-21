import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authWithWallet, UserProfile } from '@/lib/api';
import { logger } from '@/lib/logger';

interface WalletContextType {
  phantomAddress: string | null;
  phantomSession: string | null;
  evmAddress: string | null;
  userProfile: UserProfile | null;
  connectPhantom: (address: string, session: string) => void;
  disconnectPhantom: () => void;
  connectEVM: (address: string) => void;
  disconnectEVM: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [phantomAddress, setPhantomAddress] = useState<string | null>(null);
  const [phantomSession, setPhantomSession] = useState<string | null>(null);
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const savedAddress = await AsyncStorage.getItem('phantom_address');
        const savedSession = await AsyncStorage.getItem('phantom_session');
        const savedEvmAddress = await AsyncStorage.getItem('evm_address');
        const savedProfile = await AsyncStorage.getItem('user_profile');

        if (savedAddress && savedSession) {
          setPhantomAddress(savedAddress);
          setPhantomSession(savedSession);
        }
        if (savedEvmAddress) {
          setEvmAddress(savedEvmAddress);
        }
        if (savedProfile) {
          setUserProfile(JSON.parse(savedProfile));
        }
      } catch (e) {
        logger.error('Failed to load wallet info', { error: e });
      }
    };
    loadWallet();
  }, []);

  const connectPhantom = async (address: string, session: string) => {
    setPhantomAddress(address);
    setPhantomSession(session);
    try {
      await AsyncStorage.setItem('phantom_address', address);
      await AsyncStorage.setItem('phantom_session', session);
      const { user } = await authWithWallet(address, 'phantom');
      setUserProfile(user);
      await AsyncStorage.setItem('user_profile', JSON.stringify(user));
      logger.info('Phantom auth success', { is_new: user.id });
    } catch (e) {
      logger.error('Failed to save Phantom wallet info', { error: e });
    }
  };

  const disconnectPhantom = async () => {
    setPhantomAddress(null);
    setPhantomSession(null);
    setUserProfile(null);
    try {
      await AsyncStorage.multiRemove(['phantom_address', 'phantom_session', 'user_profile']);
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
      logger.info('EVM auth success', { is_new: user.id });
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
