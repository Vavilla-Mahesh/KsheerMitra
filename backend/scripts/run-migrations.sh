#!/bin/bash

# KsheerMitra Database Migration Script
# This script runs all database migrations in order

set -e  # Exit on error

echo "======================================"
echo "KsheerMitra Database Migration Script"
echo "======================================"
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Error: .env file not found!"
    echo "Please create .env file with database credentials."
    exit 1
fi

# Check required environment variables
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_NAME" ]; then
    echo "Error: Missing required environment variables!"
    echo "Please ensure DB_HOST, DB_USER, and DB_NAME are set in .env"
    exit 1
fi

echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  User: $DB_USER"
echo "  Database: $DB_NAME"
echo ""

# Function to run a migration
run_migration() {
    local migration_file=$1
    local migration_name=$(basename $migration_file)
    
    echo "Running migration: $migration_name"
    
    if [ -n "$DB_PASSWORD" ]; then
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f $migration_file
    else
        psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f $migration_file
    fi
    
    if [ $? -eq 0 ]; then
        echo "✓ Migration $migration_name completed successfully"
        echo ""
    else
        echo "✗ Migration $migration_name failed!"
        exit 1
    fi
}

# Check if database exists
echo "Checking if database exists..."
if [ -n "$DB_PASSWORD" ]; then
    DB_EXISTS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")
else
    DB_EXISTS=$(psql -h $DB_HOST -U $DB_USER -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")
fi

if [ "$DB_EXISTS" != "1" ]; then
    echo "Database '$DB_NAME' does not exist."
    read -p "Do you want to create it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ -n "$DB_PASSWORD" ]; then
            PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
        else
            psql -h $DB_HOST -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
        fi
        echo "✓ Database created successfully"
        echo ""
    else
        echo "Aborting migration."
        exit 1
    fi
fi

# Run migrations in order
echo "Starting migrations..."
echo ""

run_migration "migrations/001_initial_schema.sql"
run_migration "migrations/002_enhanced_features.sql"

echo "======================================"
echo "All migrations completed successfully!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Run 'npm install' to install dependencies"
echo "2. Run 'npm start' to start the server"
echo "3. Admin and delivery boy users will be created automatically on first start"
echo ""
