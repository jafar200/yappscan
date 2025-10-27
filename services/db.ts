import { IDBPDatabase, openDB } from 'idb';
import { Branch, Order, Setting, User } from '../types';
import { BRANCHES, MOCK_ORDERS, USERS } from '../constants';

const DB_NAME = 'MenuSystemDB';
const DB_VERSION = 3;
const STORES = ['branches', 'orders', 'settings', 'users'];

const dbPromise: Promise<IDBPDatabase> = (async () => {
    const db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion) {
            if (!db.objectStoreNames.contains('branches')) {
                db.createObjectStore('branches', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('orders')) {
                const orderStore = db.createObjectStore('orders', { keyPath: 'id' });
                orderStore.createIndex('by-branch', 'branchId');
            }
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'key' });
            }
            if (oldVersion < 3) {
                if (!db.objectStoreNames.contains('users')) {
                    db.createObjectStore('users', { keyPath: 'id' });
                }
            }
        },
    });

    // Seed initial data only if the database is empty
    const branchesCount = await db.count('branches');
    if (branchesCount === 0) {
        console.log('Database is empty. Seeding initial data...');
        const tx = db.transaction(STORES, 'readwrite');
        const storesToSeed = {
            'branches': BRANCHES,
            'orders': MOCK_ORDERS,
            'settings': [
                { key: 'aboutUs', value: 'هنا تكتب نبذة عن المطعم أو المشروع. يمكنك تعديل هذا النص من صفحة الإعدادات في لوحة التحكم.' },
                { key: 'installed_tools', value: [] }
            ],
            'users': USERS
        };
        await Promise.all([
            ...storesToSeed.branches.map(item => tx.objectStore('branches').add(item as any)),
            ...storesToSeed.orders.map(item => tx.objectStore('orders').add(item as any)),
            ...storesToSeed.settings.map(item => tx.objectStore('settings').add(item as any)),
            ...storesToSeed.users.map(item => tx.objectStore('users').add(item as any)),
        ]);
        await tx.done;
        console.log('Seeding complete.');
    }

    return db;
})();


export const db = {
    async getAll(storeName: string): Promise<(Branch | Order | Setting | User)[]> {
        const db = await dbPromise;
        return db.getAll(storeName);
    },
    async get<T>(storeName: string, id: string): Promise<T | undefined> {
        const db = await dbPromise;
        return db.get(storeName, id);
    },
    async add(storeName: string, item: any) {
        const db = await dbPromise;
        const tx = db.transaction(storeName, 'readwrite');
        await tx.store.add(item);
        await tx.done;
    },
    async put(storeName: string, item: any) {
        const db = await dbPromise;
        const tx = db.transaction(storeName, 'readwrite');
        await tx.store.put(item);
        await tx.done;
    },
    async delete(storeName: string, id: string) {
        const db = await dbPromise;
        const tx = db.transaction(storeName, 'readwrite');
        await tx.store.delete(id);
        await tx.done;
    },
};

// Add idb to import map
declare global {
    interface Window {
        importmap: {
            imports: { [key: string]: string; }
        }
    }
}
if (window.importmap) {
    window.importmap.imports['idb'] = 'https://aistudiocdn.com/idb@^8.0.0';
}