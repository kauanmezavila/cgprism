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
}

Write-Host "===== CGPrism Installer ====="

Require-Winget

# Install missing dependencies
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Install-Package "Git.Git"
}

if (-not (Get-Command git-lfs -ErrorAction SilentlyContinue)) {
    Install-Package "Git.LFS"
}

$NodeMajor = 0

if (Get-Command node -ErrorAction SilentlyContinue) {
    $NodeMajor = [int](node -p "process.versions.node.split('.')[0]")
}

if ($NodeMajor -lt 22) {
    Install-Package "OpenJS.NodeJS.LTS"
}

# Refresh PATH from environment
$env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") +
    ";" + [Environment]::GetEnvironmentVariable("Path", "User")

# Check whether Node.js is available
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js was installed. Restart PowerShell and run this script again."
    exit 0
}

if ([int](node -p "process.versions.node.split('.')[0]") -lt 22) {
    throw "Node.js 22+ is required. Restart PowerShell and retry."
}

# Install pnpm
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    npm install -g pnpm
}

git lfs install

# Clone or update repository
if (Test-Path "$InstallDir\.git") {
    git -C $InstallDir pull --ff-only
}
else {
    git clone $Repo $InstallDir
}

Set-Location $InstallDir

pnpm install

# Configure pnpm global bin
pnpm setup

pnpm add -g .

Write-Host "CGPrism installed successfully!"
Write-Host "Run: cgprism"