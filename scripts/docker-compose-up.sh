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
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Get docker and gateways directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DOCKER_DIR="$PROJECT_DIR/docker"
GATEWAY_DIR="$PROJECT_DIR/gateways"
ORIGINAL_DIR="$(pwd)"

# Start Gateway
start_gateway() {
    log_info "Starting KONG API Gateway..."
    cd "$GATEWAY_DIR"
    docker compose -p gateway -f gateway.compose.yml up -d
    [ $? -eq 0 ] && log_success "KONG API Gateway started successfully." || log_error "KONG API Gateway start failed."
    cd "$ORIGINAL_DIR"
}
}

# Start Dependencies
start_deps() {
    log_info "Starting Microservices Dependencies..."
    cd "$DOCKER_DIR"
    docker compose -p micro-services-deps -f deps.compose.yml up -d
    [ $? -eq 0 ] && log_success "Dependencies started successfully." || log_error "Dependencies start failed."
    cd "$ORIGINAL_DIR"
}

# Start Kafka Brokers
start_kafka() {
    log_info "Starting Kafka Brokers..."
    cd "$DOCKER_DIR"
    docker compose -p kafka -f kafka.compose.yml up -d
    [ $? -eq 0 ] && log_success "Kafka Brokers started successfully." || log_error "Kafka Brokers start failed."
    cd "$ORIGINAL_DIR"
}

# Start Application
start_app() {
    log_info "Starting Application Services..."
    cd "$DOCKER_DIR"
    docker compose -p micro-services-app -f app.compose.yml up -d
    [ $? -eq 0 ] && log_success "Application started successfully." || log_error "Application start failed."
    cd "$ORIGINAL_DIR"
}

# Start All
start_all() {
    echo ""
    log_info "Starting all services in sequence..."
    echo ""
    start_gateway
    echo ""
    start_deps
    echo ""
    start_kafka
    echo ""
    start_app
    echo ""
}

clear
echo -e ""
echo -e "${CYAN}====================================${NC}"
echo -e "${CYAN}   Microservices Startup Manager${NC}"
echo -e "${CYAN}====================================${NC}"
echo -e ""
echo -e "${YELLOW}  1. Start All Services${NC}"
echo -e "  2. Start Gateway Only"
echo -e "  3. Start Dependencies Only"
echo -e "  4. Start Kafka Brokers Only"
echo -e "  5. Start Application Only"
echo -e "  6. Start Custom Services (comma-separated)"
echo -e ""
echo -e "${CYAN}====================================${NC}"
echo -e ""

read -p "Enter your choice: " choice

case $choice in
    1) start_all ;;
    2) start_gateway ;;
    3) start_deps ;;
    4) start_kafka ;;
    5) start_app ;;
    6)
        echo ""
        read -p "Enter services to start (e.g., gateway,deps,app): " services
        echo ""
        IFS=',' read -ra LIST <<< "$services"
        for svc in "${LIST[@]}"; do
            svc=$(echo "$svc" | xargs)
            case $svc in
                gateway) start_gateway; echo "" ;;
                deps) start_deps; echo "" ;;
                kafka) start_kafka; echo "" ;;
                app) start_app; echo "" ;;
                *) log_warning "Unknown service: $svc" ;;
            esac
        done
        ;;
    *) log_error "Invalid option. Please enter 1-5." ;;
esac

echo -e "${GREEN}All operations completed!${NC}"
echo -e ""