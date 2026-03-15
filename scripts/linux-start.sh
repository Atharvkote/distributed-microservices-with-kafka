#!/bin/bash

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Start Kafka
start_kafka() {
    log_info "Starting Kafka Brokers..."
    docker compose -p kafka-brokers -f kafka.compose.yml up -d
    [ $? -eq 0 ] && log_success "Kafka Brokers started." || log_error "Kafka start failed."
}

# Start Dependencies
start_deps() {
    log_info "Starting Microservices Dependencies..."
    docker compose -p micro-services-deps -f deps.compose.yml up -d
    [ $? -eq 0 ] && log_success "Dependencies started." || log_error "Dependencies start failed."
}

# Start Application
start_app() {
    log_info "Starting Application Services..."
    docker compose -p micro-services-app -f app.compose.yml up -d
    [ $? -eq 0 ] && log_success "Application started." || log_error "Application start failed."
}

# Start All
start_all() {
    log_info "Starting all services..."
    start_kafka
    start_deps
    start_app
}

clear
echo -e "${CYAN}====================================${NC}"
echo -e "${CYAN}   Microservices Startup Manager${NC}"
echo -e "${CYAN}====================================${NC}"
echo -e "${YELLOW}1.${NC} Start All"
echo -e "${YELLOW}2.${NC} Start Kafka"
echo -e "${YELLOW}3.${NC} Start Dependencies"
echo -e "${YELLOW}4.${NC} Start Application"
echo -e "${YELLOW}5.${NC} Start Multiple (kafka,deps,app)"
echo -e "${CYAN}====================================${NC}"

read -p "Enter choice: " choice

case $choice in
    1) start_all ;;
    2) start_kafka ;;
    3) start_deps ;;
    4) start_app ;;
    5)
        read -p "Enter services: " services
        IFS=',' read -ra LIST <<< "$services"
        for svc in "${LIST[@]}"; do
            svc=$(echo "$svc" | xargs)
            case $svc in
                kafka) start_kafka ;;
                deps) start_deps ;;
                app) start_app ;;
                *) log_warning "Unknown service: $svc" ;;
            esac
        done
        ;;
    *) log_error "Invalid option." ;;
esac

echo -e "${GREEN}Done.${NC}"