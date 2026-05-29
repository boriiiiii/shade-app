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
    const detail = error?.error?.message ?? error?.message ?? (typeof error === 'string' ? error : null);
    const output = detail ? `${message}\n${detail}` : message;
    console.error(output);
  }
}

export const logger = new Logger();
