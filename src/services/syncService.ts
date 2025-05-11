
import { updateAccountBalance } from './accountsService';

// Process pending POS transactions
export const syncPendingPosTransactions = (): void => {
  if (navigator.onLine) {
    try {
      // Get pending transactions
      const pendingTransactions = JSON.parse(localStorage.getItem('pendingPosTransactions') || '[]');
      
      if (pendingTransactions.length > 0) {
        console.log(`Processing ${pendingTransactions.length} pending POS transactions`);
        
        // Process each transaction
        pendingTransactions.forEach(transaction => {
          // For each payment in the transaction
          transaction.payments.forEach((payment: any) => {
            // Update account balance
            updateAccountBalance(payment.method, payment.amount, 'increase');
          });
          
          // Update shift information if needed (would require more complex sync logic)
        });
        
        // Clear pending transactions
        localStorage.setItem('pendingPosTransactions', JSON.stringify([]));
        
        // Notify that sync is complete
        window.dispatchEvent(new CustomEvent('syncComplete'));
      }
    } catch (error) {
      console.error('Error syncing pending POS transactions:', error);
    }
  }
};

// Check for pending operations on app start and when coming online
export const initializeSyncService = (): void => {
  // Initial check
  if (navigator.onLine) {
    syncPendingPosTransactions();
  }
  
  // Listen for online events
  window.addEventListener('online', () => {
    console.log('Device is online, starting sync process...');
    syncPendingPosTransactions();
  });
};

// Initialize IndexedDB for offline storage (more robust than localStorage)
export const initializeOfflineStorage = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open('tellerposOfflineDB', 1);
      
      request.onupgradeneeded = (event) => {
        const db = request.result;
        
        // Create stores for different data types if they don't exist
        if (!db.objectStoreNames.contains('posTransactions')) {
          db.createObjectStore('posTransactions', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('accountTransfers')) {
          db.createObjectStore('accountTransfers', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('accountOperations')) {
          db.createObjectStore('accountOperations', { autoIncrement: true });
        }
      };
      
      request.onsuccess = () => {
        console.log('Offline database initialized successfully');
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('Error initializing offline database:', request.error);
        // Fall back to localStorage if IndexedDB fails
        resolve();
      };
    } catch (error) {
      console.error('Error setting up offline storage:', error);
      // Continue even if offline storage setup fails
      resolve();
    }
  });
};
