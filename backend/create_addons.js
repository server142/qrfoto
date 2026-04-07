const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

async function createAddons() {
    console.log('--- Rescate de Gigas: Creando Recargas ---');
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '131177',
            database: 'veltrix_events'
        });

        const addons = [
            { name: 'Recarga Básica 500MB', price: 199.00, storage: 500 },
            { name: 'Recarga Pro 1GB', price: 349.00, storage: 1000 }
        ];

        for (const addon of addons) {
            const id = uuidv4();
            await connection.execute(
                'INSERT INTO plans (id, name, type, price, storage_limit_mb, created_at, periodicity) VALUES (?, ?, ?, ?, ?, NOW(), ?)',
                [id, addon.name, 'Storage-addon', addon.price, addon.storage, 'one-time']
            );
            console.log(`✅ Creado: ${addon.name} ($${addon.price})`);
        }

        await connection.end();
        console.log('--- Proceso Completado con Éxito ---');
    } catch (err) {
        console.error('❌ Error inyectando recargas:', err.message);
    }
}

createAddons();
