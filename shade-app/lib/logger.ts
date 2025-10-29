/**
 * Système de logging centralisé pour l'application
 */

class Logger {
  /**
   * Log de débogage
   * @param message - Message à afficher
   * @param data - Données optionnelles à logger
   */
  debug(message: string, data?: any) {
    console.log(`[DEBUG] ${message}`, data || '');
  }

  /**
   * Log d'information
   * @param message - Message à afficher
   * @param data - Données optionnelles à logger
   */
  info(message: string, data?: any) {
    console.info(`[INFO] ${message}`, data || '');
  }

  /**
   * Log d'avertissement
   * @param message - Message à afficher
   * @param data - Données optionnelles à logger
   */
  warn(message: string, data?: any) {
    console.warn(`[WARN] ${message}`, data || '');
  }

  /**
   * Log d'erreur
   * @param message - Message d'erreur
   * @param error - Objet d'erreur optionnel
   */
  error(message: string, error?: any) {
    console.error(`[ERROR] ${message}`, error || '');
  }
}

export const logger = new Logger();
