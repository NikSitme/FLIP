-- Additive schema: never drops or truncates existing project data.
CREATE SCHEMA IF NOT EXISTS renovation;
CREATE TABLE IF NOT EXISTS renovation.leads (
  request_id uuid PRIMARY KEY,
  payload jsonb NOT NULL,
  payload_hash text NOT NULL,
  phone_hash text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'delivered', 'failed', 'uncertain')),
  telegram_message_id bigint,
  attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  delivered_at timestamptz
);
ALTER TABLE renovation.leads ADD COLUMN IF NOT EXISTS staff_note text NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON renovation.leads(created_at);
CREATE INDEX IF NOT EXISTS leads_phone_created_idx ON renovation.leads(phone_hash, created_at);
