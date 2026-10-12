-- Private demonstration record only. Parameters are validated and hashed by scripts/db.mts.
-- Never sent to Telegram or displayed publicly. Existing submissions are preserved.
INSERT INTO renovation.leads(request_id, payload, payload_hash, phone_hash, staff_note)
VALUES ($1, $2, $3, $4, 'Демонстрационная запись seed. Не является обращением клиента.')
ON CONFLICT (request_id) DO NOTHING;
