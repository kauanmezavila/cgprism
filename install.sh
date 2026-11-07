#!/usr/bin/env bash
set -Eeuo pipefail

REPO="https://github.com/kauanmezavila/cgprism.git"
INSTALL_DIR="${CGPRISM_DIR:-$HOME/.local/share/cgprism}"

info() { echo -e "\n[CGPrism] $*"; }
fail() { echo "[ERROR] $*" >&2; exit 1; }

# Detect Linux distribution
[[ "$(uname -s)" == "Linux" ]] || fail "Linux only. Use install.ps1 on Windows."

if [[ -f /etc/os-release ]]; then
    . /etc/os-release
else
    fail "Cannot detect Linux distribution."
fi

# Ask permission
read -r -p "Install missing dependencies automatically? [Y/n] " answer
[[ "$answer" =~ ^[Nn]$ ]] && exit 0

# Install dependencies
case "${ID:-}" in
    ubuntu|debian)
        sudo apt-get update
        sudo apt-get install -y git git-lfs curl ca-certificates

        # Install Node.js 22+ if missing or outdated
        if ! command -v node >/dev/null || \
           [[ "$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)" -lt 22 ]]; then
            curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
            sudo apt-get install -y nodejs
        fi
        ;;

    fedora)
        sudo dnf install -y git git-lfs nodejs npm curl
        ;;

    arch|manjaro)
        sudo pacman -Sy --needed --noconfirm git git-lfs nodejs npm curl
        ;;

    *)
        fail "Unsupported distribution: ${ID:-unknown}"
        ;;
esac

# Validate Node.js
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[[ "$NODE_MAJOR" -ge 22 ]] || fail "Node.js 22+ required."

# Install pnpm
if ! command -v pnpm >/dev/null 2>&1; then
    sudo npm install -g pnpm
fi

git lfs install

# Clone or update
if [[ -d "$INSTALL_DIR/.git" ]]; then
    info "Updating CGPrism..."
    git -C "$INSTALL_DIR" pull --ff-only
else
    info "Cloning CGPrism..."
    mkdir -p "$(dirname "$INSTALL_DIR")"
    git clone "$REPO" "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"

info "Installing dependencies..."
pnpm install

# Configure pnpm global directory for current user
PNPM_HOME="$HOME/.local/share/pnpm"
mkdir -p "$PNPM_HOME"
export PNPM_HOME
export PATH="$PNPM_HOME:$PATH"

pnpm config set global-bin-dir "$PNPM_HOME"
pnpm add -g .

info "CGPrism installation completed!"
info "Run: cgprism"