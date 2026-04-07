-- ============================================================
-- RESCATE DE GIGAS: Paquetes de Recarga de Almacenamiento
-- Ejecutar en el VPS: mysql -u root -p veltrix_events < create_addons.sql
-- ============================================================

INSERT INTO `plans` (id, name, type, price, storage_limit_mb, max_events, event_duration_days, has_custom_qr, has_bulk_download, has_custom_branding, currency, periodicity, created_at)
VALUES 
(UUID(), 'Recarga Básica 500MB', 'Storage-addon', 199.00, 500, 0, 0, 0, 0, 0, 'MXN', 'one-time', NOW()),
(UUID(), 'Recarga Pro 1GB',      'Storage-addon', 349.00, 1000, 0, 0, 0, 0, 0, 'MXN', 'one-time', NOW());

-- Verificar inserción
SELECT id, name, type, price, storage_limit_mb FROM plans WHERE type = 'Storage-addon';
