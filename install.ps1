$ErrorActionPreference = "Stop"

$Repo = "https://github.com/kauanmezavila/cgprism.git"
$InstallDir = "$env:LOCALAPPDATA\CGPrism"

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
if (-not (Get-Command git-lfs -ErrorAction SilentlyContinue)) {
    Install-Package "GitHub.GitLFS"
}

# Install Node.js 22+
$NodeMajor = 0

if (Get-Command node -ErrorAction SilentlyContinue) {
    $NodeMajor = [int](node -p "process.versions.node.split('.')[0]")
}

if ($NodeMajor -lt 22) {
    Install-Package "OpenJS.NodeJS.LTS"
}

Refresh-Path

# Verify Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js was installed. Restart PowerShell and run this script again."
    exit 0
}

$NodeMajor = [int](node -p "process.versions.node.split('.')[0]")

if ($NodeMajor -lt 22) {
    throw "Node.js 22+ is required. Restart PowerShell and retry."
}

# Install pnpm
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
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

# Clone or update repository
if (Test-Path "$InstallDir\.git") {
    Write-Host "Updating CGPrism..."
    git -C $InstallDir pull --ff-only
}
else {
    Write-Host "Cloning CGPrism..."
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
Write-Host "Check Ollama with:"
Write-Host "  ollama --version"