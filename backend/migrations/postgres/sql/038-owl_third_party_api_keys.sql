DROP TABLE IF EXISTS owl_third_party_api_keys CASCADE;

CREATE TABLE owl_third_party_api_keys (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    api_key character varying(100) NOT NULL,
    api_secret character varying(255) NOT NULL,
    client_name character varying(255) NOT NULL,
    description text,
    status character varying(20) NOT NULL DEFAULT 'active'::character varying,
    last_used_at timestamp without time zone,
    expires_at timestamp without time zone,
    created_by uuid,
    remark text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);

DROP INDEX IF EXISTS idx_owl_third_party_api_keys_client_name CASCADE;
DROP INDEX IF EXISTS idx_owl_third_party_api_keys_status CASCADE;

CREATE INDEX idx_owl_third_party_api_keys_api_key ON owl_third_party_api_keys (api_key);
CREATE INDEX idx_owl_third_party_api_keys_client_name ON owl_third_party_api_keys (client_name);
CREATE INDEX idx_owl_third_party_api_keys_status ON owl_third_party_api_keys (status);
