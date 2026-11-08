#!/usr/bin/env bash
set -Eeuo pipefail

REPO="https://github.com/kauanmezavila/cgprism.git"
INSTALL_DIR="${CGPRISM_DIR:-$HOME/.local/share/cgprism}"

NVM_VERSION="v0.40.3"
NODE_VERSION="22"

info() {
    echo -e "\n[CGPrism] $*"
}

fail() {
    echo "[ERROR] $*" >&2
    exit 1
}

# Detect Linux
[[ "$(uname -s)" == "Linux" ]] ||
    fail "Linux only. Use install.ps1 on Windows."

[[ -r /etc/os-release ]] ||
    fail "Cannot detect Linux distribution."

source /etc/os-release

DISTRO_ID="${ID,,}"
DISTRO_LIKE="${ID_LIKE,,}"

# Detect distribution family
detect_family() {
    # Linux Mint can report ID=linuxmint while ID_LIKE is missing or varies
    # between releases, so recognize it directly as an apt-based distro.
    case "$DISTRO_ID" in
        linuxmint|ubuntu|debian|pop|elementary|zorin)
            echo "debian"
            return
            ;;
        fedora|rhel|centos|rocky|almalinux)
            echo "fedora"
            return
            ;;
        arch|manjaro|endeavouros)
            echo "arch"
            return
            ;;
        opensuse*|suse*)
            echo "suse"
            return
            ;;
    esac

    # Fall back to ID_LIKE for other derivatives, whose release files name
    # their upstream family instead of listing every supported ID above.
    case " $DISTRO_LIKE " in
        *" debian "*|*" ubuntu "*) echo "debian" ;;
        *" fedora "*|*" rhel "*|*" centos "*) echo "fedora" ;;
        *" arch "*) echo "arch" ;;
        *" opensuse "*|*" suse "*) echo "suse" ;;
        *) echo "unknown" ;;
    esac
}

OS_FAMILY="$(detect_family)"

info "Detected OS: ${PRETTY_NAME:-$DISTRO_ID}"
info "OS family: $OS_FAMILY"

# Use sudo only when needed. The quick-install command pipes this script into
# bash, so reading confirmations from stdin would consume the script itself.
as_root() {
    if [[ "$EUID" -eq 0 ]]; then
        "$@"
    elif command -v sudo >/dev/null 2>&1; then
        sudo "$@"
    else
        fail "This step needs root privileges. Install sudo or run the script as root."
    fi
}

# Install system dependencies
case "$OS_FAMILY" in
    debian)
        # A broken third-party apt source should not prevent installation when
        # the needed package indexes are still available. apt-get install below
        # remains authoritative and will report if a required package is absent.
        if ! as_root apt-get update; then
            info "Warning: apt-get update reported repository errors; trying to install with available package indexes."
        fi
        as_root apt-get install -y \
            git git-lfs curl ca-certificates
        ;;

    fedora)
        as_root dnf install -y \
            git git-lfs curl ca-certificates
        ;;

    arch)
        as_root pacman -S --needed --noconfirm \
            git git-lfs curl ca-certificates
        ;;

    suse)
        as_root zypper install -y \
            git git-lfs curl ca-certificates
        ;;

    *)
        fail "Unsupported distribution: ${ID:-unknown}"
        ;;
esac

# Install NVM
export NVM_DIR="$HOME/.nvm"

if [[ ! -s "$NVM_DIR/nvm.sh" ]]; then
    info "Installing NVM..."

    curl -fsSL \
        "https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh" \
        | bash
fi

# Load NVM
[[ -s "$NVM_DIR/nvm.sh" ]] ||
    fail "NVM installation failed."

source "$NVM_DIR/nvm.sh"

# Install Node.js
info "Installing Node.js ${NODE_VERSION} through NVM..."

nvm install "$NODE_VERSION"
nvm use "$NODE_VERSION"
nvm alias default "$NODE_VERSION"

# Validate Node.js
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"

[[ "$NODE_MAJOR" -ge 22 ]] ||
    fail "Node.js 22+ required."

info "Node.js: $(node -v)"
info "npm: $(npm -v)"

# Install pnpm
info "Installing/updating pnpm..."

npm install -g pnpm

info "pnpm: $(pnpm -v)"

# Install or update Ollama
if command -v ollama >/dev/null 2>&1; then
    info "Updating Ollama..."
else
    info "Installing Ollama..."
fi

curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service if systemd is available
if command -v systemctl >/dev/null 2>&1; then
    if systemctl list-unit-files ollama.service \
        2>/dev/null | grep -q ollama.service; then

        as_root systemctl enable --now ollama
    fi
fi

# Verify Ollama
command -v ollama >/dev/null 2>&1 ||
    fail "Ollama installation failed."

info "Ollama: $(ollama --version)"

# Configure Git LFS
git lfs install

# Clone or update CGPrism
if [[ -d "$INSTALL_DIR/.git" ]]; then
    info "Updating CGPrism..."

    git -C "$INSTALL_DIR" pull --ff-only
else
    info "Cloning CGPrism..."

    mkdir -p "$(dirname "$INSTALL_DIR")"

    git clone "$REPO" "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"

# Install project dependencies
info "Installing CGPrism dependencies..."

pnpm install

# Configure pnpm global directory
PNPM_HOME="${PNPM_HOME:-$HOME/.local/share/pnpm}"

mkdir -p "$PNPM_HOME"

export PNPM_HOME
export PATH="$PNPM_HOME:$PATH"

pnpm config set global-bin-dir "$PNPM_HOME"

# Install CGPrism globally
info "Installing CGPrism globally..."

pnpm add -g .

# Persist the command path for common interactive shells. Avoid duplicate lines.
for profile in "$HOME/.profile" "$HOME/.bashrc" "$HOME/.zshrc"; do
    [[ -e "$profile" ]] || touch "$profile"
    if ! grep -Fq 'export PNPM_HOME=' "$profile"; then
        printf '\nexport PNPM_HOME=%q\nexport PATH="$PNPM_HOME:$PATH"\n' "$PNPM_HOME" >> "$profile"
    fi
done

# Validate installation
command -v cgprism >/dev/null 2>&1 ||
    fail "CGPrism command was not found after installation."

info "CGPrism installation completed!"
info "Node.js: $(node -v)"
info "pnpm: $(pnpm -v)"
info "Ollama is ready."
info "Run: cgprism"
