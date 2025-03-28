#!/usr/bin/env bash

set -euo pipefail

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE api;
    CREATE DATABASE mana;
    GRANT ALL PRIVILEGES ON DATABASE api TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE mana TO $POSTGRES_USER;
