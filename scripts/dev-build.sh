#!/bin/bash

# dev-build.sh - Development build script with mock/live support

set -e  # Exit on any error

# Default values
MODE="live"  # Default to live mode
SCRIPT_NAME="dev-build.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Help message
show_help() {
    echo -e "${BLUE}Usage: $SCRIPT_NAME [OPTIONS]${NC}"
    echo ""
    echo "Development build script with mock/live data support"
    echo ""
    echo "Options:"
    echo "  -m, --mock     Build with mock data"
    echo "  -l, --live     Build with live data (default)"
    echo "  -h, --help     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $SCRIPT_NAME           # Build with live data"
    echo "  $SCRIPT_NAME --mock    # Build with mock data"
    echo "  $SCRIPT_NAME --live    # Build with live data"
    echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--mock)
            MODE="mock"
            shift
            ;;
        -l|--live)
            MODE="live"
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Error: Unknown option $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Print banner
echo -e "${BLUE}===========================================${NC}"
echo -e "${BLUE}  Dashboard Development Build Script${NC}"
echo -e "${BLUE}===========================================${NC}"
echo ""

# Show current mode
if [[ "$MODE" == "mock" ]]; then
    echo -e "${YELLOW}Building in MOCK data mode${NC}"
    echo -e "${YELLOW}This will use generated mock data for all services${NC}"
else
    echo -e "${GREEN}Building in LIVE data mode${NC}"
    echo -e "${GREEN}This will connect to real services${NC}"
fi
echo ""

# Check if package.json exists
if [[ ! -f "package.json" ]]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Check if node_modules exists
if [[ ! -d "node_modules" ]]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Build the project
echo -e "${BLUE}Building the project...${NC}"
if [[ "$MODE" == "mock" ]]; then
    npm run build:mock
else
    npm run build:live
fi

# Check if build was successful
if [[ $? -eq 0 ]]; then
    echo ""
    echo -e "${GREEN}✅ Build completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "  - To start the server: npm run start:$MODE"
    echo -e "  - To run in development: npm run dev:$MODE"
    echo ""
    echo -e "${BLUE}Mode: $MODE${NC}"
else
    echo ""
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

exit 0