#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Colors for better visibility
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Start Docker Compose
echo -e "${GREEN}Starting Docker Compose...${NC}"
docker-compose up -d

# Step 2: Wait for PostgreSQL to be ready
echo -e "${GREEN}Waiting for PostgreSQL to be ready...${NC}"
until docker exec timesheet_db pg_isready -U admin; do
    >&2 echo -e "${RED}PostgreSQL is unavailable - retrying...${NC}"
    sleep 2
done
echo -e "${GREEN}PostgreSQL is ready!${NC}"

# Step 3: Run database migrations
echo -e "${GREEN}Running database migrations...${NC}"
docker exec timesheet_api alembic upgrade head

# Step 4: Confirm success
echo -e "${GREEN}Database migration completed successfully!${NC}"
