/**
 * Configuration et fonctions API
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

export interface ApiData {
  hello: string;
  supabase_configured: boolean;
}

/**
 * Récupère les données du endpoint root
 */
export async function getApiStatus(): Promise<ApiData> {
  const response = await fetch(`${API_URL}/`);
  
  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status}`);
  }
  
  return response.json();
}
