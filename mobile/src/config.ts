import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * URL du backend.
 *
 * Sur un TÉLÉPHONE physique, `localhost` = le téléphone, pas ton ordi → on doit
 * viser l'IP LAN de la machine de dev. On la récupère automatiquement depuis le
 * serveur Metro d'Expo (même IP que celle qu'Expo Go utilise déjà).
 *
 * Priorité : EXPO_PUBLIC_API_URL > IP du serveur Metro > défaut plateforme.
 * Pour forcer manuellement : EXPO_PUBLIC_API_URL=http://192.168.1.27:8000 npm run mobile
 */
const BACKEND_PORT = 8000;

function metroHost(): string | null {
  // Selon la version d'Expo, l'info est à différents endroits.
  const c = Constants as any;
  const hostUri: string | undefined =
    c.expoConfig?.hostUri ||
    c.expoGoConfig?.debuggerHost ||
    c.manifest2?.extra?.expoGo?.debuggerHost ||
    c.manifest?.debuggerHost;
  if (!hostUri) return null;
  const host = String(hostUri).split(':')[0].trim();
  return host && host !== 'localhost' && host !== '127.0.0.1' ? host : null;
}

function defaultApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  const host = metroHost();
  if (host) return `http://${host}:${BACKEND_PORT}`;
  if (Platform.OS === 'android') return `http://10.0.2.2:${BACKEND_PORT}`;
  return `http://localhost:${BACKEND_PORT}`;
}

export const API_URL = defaultApiUrl().replace(/\/$/, '');
export const WS_URL = API_URL.replace(/^http/, 'ws') + '/ws';

/** Schéma de deep link de l'app (doit matcher app.json → scheme). */
export const APP_SCHEME = 'shade';
