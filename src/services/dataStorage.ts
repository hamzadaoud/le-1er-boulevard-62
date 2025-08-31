import { Drink, Order, TimeLog, User, Activity, Revenue } from '../types';

// Service pour la sauvegarde locale des données en JSON
export class DataStorageService {
  private static instance: DataStorageService;
  
  private constructor() {}
  
  public static getInstance(): DataStorageService {
    if (!DataStorageService.instance) {
      DataStorageService.instance = new DataStorageService();
    }
    return DataStorageService.instance;
  }

  // Méthodes pour exporter toutes les données en JSON
  public exportAllData(): string {
    const data = {
      drinks: this.getDrinks(),
      orders: this.getOrders(),
      timeLogs: this.getTimeLogs(),
      agents: this.getAgents(),
      activities: this.getActivities(),
      revenues: this.getRevenues(),
      tables: this.getTables(),
      tableOrders: this.getTableOrders(),
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  // Méthodes pour importer des données depuis JSON
  public importAllData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      // Valider la structure des données
      if (!this.validateDataStructure(data)) {
        throw new Error('Structure de données invalide');
      }
      
      // Importer toutes les données
      if (data.drinks) localStorage.setItem('drinks', JSON.stringify(data.drinks));
      if (data.orders) localStorage.setItem('orders', JSON.stringify(data.orders));
      if (data.timeLogs) localStorage.setItem('timeLogs', JSON.stringify(data.timeLogs));
      if (data.agents) localStorage.setItem('agents', JSON.stringify(data.agents));
      if (data.activities) localStorage.setItem('activities', JSON.stringify(data.activities));
      if (data.tables) localStorage.setItem('tables', JSON.stringify(data.tables));
      if (data.tableOrders) localStorage.setItem('tableOrders', JSON.stringify(data.tableOrders));
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'importation des données:', error);
      return false;
    }
  }

  // Télécharger les données en fichier JSON
  public downloadDataAsJSON(): void {
    const jsonData = this.exportAllData();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `cafe-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  // Sauvegarder automatiquement les données à intervalles réguliers
  public startAutoSave(intervalMinutes: number = 30): void {
    setInterval(() => {
      this.saveToLocalStorage();
    }, intervalMinutes * 60 * 1000);
  }

  // Sauvegarder dans localStorage avec validation
  private saveToLocalStorage(): void {
    try {
      const data = this.exportAllData();
      localStorage.setItem('cafe_backup', data);
      console.log('Sauvegarde automatique effectuée');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde automatique:', error);
    }
  }

  // Valider la structure des données
  private validateDataStructure(data: any): boolean {
    return (
      typeof data === 'object' &&
      data !== null &&
      (data.drinks === undefined || Array.isArray(data.drinks)) &&
      (data.orders === undefined || Array.isArray(data.orders)) &&
      (data.timeLogs === undefined || Array.isArray(data.timeLogs))
    );
  }

  // Méthodes d'accès aux données
  private getDrinks(): Drink[] {
    try {
      return JSON.parse(localStorage.getItem('drinks') || '[]');
    } catch {
      return [];
    }
  }

  private getOrders(): Order[] {
    try {
      return JSON.parse(localStorage.getItem('orders') || '[]');
    } catch {
      return [];
    }
  }

  private getTimeLogs(): TimeLog[] {
    try {
      return JSON.parse(localStorage.getItem('timeLogs') || '[]');
    } catch {
      return [];
    }
  }

  private getAgents(): User[] {
    try {
      return JSON.parse(localStorage.getItem('agents') || '[]');
    } catch {
      return [];
    }
  }

  private getActivities(): Activity[] {
    try {
      return JSON.parse(localStorage.getItem('activities') || '[]');
    } catch {
      return [];
    }
  }

  private getRevenues(): Revenue[] {
    try {
      return JSON.parse(localStorage.getItem('revenues') || '[]');
    } catch {
      return [];
    }
  }

  private getTables(): any[] {
    try {
      return JSON.parse(localStorage.getItem('tables') || '[]');
    } catch {
      return [];
    }
  }

  private getTableOrders(): any[] {
    try {
      return JSON.parse(localStorage.getItem('tableOrders') || '[]');
    } catch {
      return [];
    }
  }
}

// Instance globale
export const dataStorage = DataStorageService.getInstance();