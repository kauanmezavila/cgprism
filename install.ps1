```powershell
$ErrorActionPreference = "Stop"

$Repo = "https://github.com/kauanmezavila/cgprism.git"
$InstallDir = "$env:LOCALAPPDATA\CGPrism"
$NodeVersion = "22"

function Require-Winget {
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        throw "winget is missing. Install App Installer from Microsoft Store."
    }
}

function Install-Package($Id) {
    Write-Host "Installing $Id..."

    winget install --id $Id --exact `
        --accept-source-agreements `
        --accept-package-agreements

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install package: $Id"
    }
}

function Refresh-Path {
    $MachinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    $UserPath = [Environment]::GetEnvironmentVariable("Path", "User")

    $env:Path = "$MachinePath;$UserPath"
}

Write-Host "===== CGPrism Installer ====="

Require-Winget

# Install Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Install-Package "Git.Git"
}

# Install Git LFS
if (-not (git lfs version 2>$null)) {
    Install-Package "GitHub.GitLFS"
}

Refresh-Path

# Install NVM for Windows
if (-not (Get-Command nvm -ErrorAction SilentlyContinue)) {
    Write-Host "Installing NVM for Windows..."

    winget install nvm-windows `
        --accept-source-agreements `
        --accept-package-agreements

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install NVM for Windows."
    }

    Refresh-Path

    if (-not (Get-Command nvm -ErrorAction SilentlyContinue)) {
        Write-Host ""
        Write-Host "NVM was installed."
        Write-Host "Restart PowerShell and run this installer again."
        exit 0
    }
}

# Install and activate Node.js 22 through NVM
Write-Host "Installing Node.js $NodeVersion through NVM..."

nvm install $NodeVersion

if ($LASTEXITCODE -ne 0) {
    throw "Failed to install Node.js through NVM."
}

nvm use $NodeVersion

if ($LASTEXITCODE -ne 0) {
    throw "Failed to activate Node.js $NodeVersion."
}

Refresh-Path

# Verify Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js is unavailable. Restart PowerShell and retry."
}

$NodeMajor = [int](node -p "process.versions.node.split('.')[0]")

if ($NodeMajor -lt 22) {
    throw "Node.js 22+ is required. Current version: $(node -v)"
}

Write-Host "Node.js version: $(node -v)"
Write-Host "npm version: $(npm -v)"

# Install pnpm
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "Installing pnpm..."

    npm install -g pnpm

    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install pnpm."
    }
}

Refresh-Path

# Install Ollama
if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) {
    Install-Package "Ollama.Ollama"
}

Refresh-Path

# Verify Ollama
if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) {
    Write-Host "Ollama was installed, but is not available in PATH."
    Write-Host "Restart PowerShell and run: ollama --version"
}
else {
    Write-Host "Ollama detected:"
    ollama --version
}

# Initialize Git LFS
git lfs install

if ($LASTEXITCODE -ne 0) {
    throw "Failed to initialize Git LFS."
}

# Clone or update repository
if (Test-Path "$InstallDir\.git") {
    Write-Host "Updating CGPrism..."
    git -C $InstallDir pull --ff-only
}
else {
    Write-Host "Cloning CGPrism..."

    if (Test-Path $InstallDir) {
        throw "Install directory exists but is not a Git repository: $InstallDir"
    }

    git clone $Repo $InstallDir
}

if ($LASTEXITCODE -ne 0) {
    throw "Failed to clone or update CGPrism."
}

Set-Location $InstallDir

# Install dependencies
Write-Host "Installing CGPrism dependencies..."

pnpm install

if ($LASTEXITCODE -ne 0) {
    throw "Failed to install CGPrism dependencies."
}

# Configure pnpm global bin
pnpm setup

if ($LASTEXITCODE -ne 0) {
    throw "Failed to configure pnpm."
}

# Install CGPrism globally
pnpm add -g .

if ($LASTEXITCODE -ne 0) {
    throw "Failed to install CGPrism globally."
}

Write-Host ""
Write-Host "================================"
Write-Host "CGPrism installed successfully!"
Write-Host "================================"
Write-Host ""
Write-Host "Run CGPrism with:"
Write-Host "  cgprism"
Write-Host ""
Write-Host "Check Node.js with:"
Write-Host "  node --version"
Write-Host ""
Write-Host "Check Ollama with:"
Write-Host "  ollama --version"
```