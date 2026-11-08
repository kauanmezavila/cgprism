<div align="center">
  <h1>CGPrism</h1>
  <p>The local interface for AI management</p>
  <p><b>v1.0.0: The local AI enthusiast</b></p>
</div>

## What it is?

CGPrism is born to resolve all your problems with local AI models managment.
The tool is being build with JavaScript for main logic and SQLite for registry.

> PS: Some things are a little weird and may not work well

## What it CAN do now

- [Install](#install-models) model repositories from [3 providers](#providers)
- Automatic Git LFS detection
- Register models in an DB
- [Install](#install-models) and register models directly from Ollama
- [Create](#manage-runtime-models) Modelfiles for registered models
- [Deploy](#manage-runtime-models) downloaded models to Ollama
- [Run](#run-models) registered models with Ollama (probally may need [previous configuration, just two commands](#manage-runtime-models))
- [List](#list-models) registered models
- [Uninstall](#uninstall-models) models, repositories, owners, or providers
- [Inspect](#hardware-and-model-compatibility) hardware information
- [Estimate](#hardware-and-model-compatibility) models compatibility using hardware heuristics
- [Benchmark](#hardware-and-model-compatibility) hardware using heuristic analysis
- [Search](#see-repo-documentation) local documentation by name, provider, owner, and etc.
- [CGPrism Doctor](#doctor) for integreti analyzes
- Configure custom data storage with CGPRISM_HOME
- [Navigate documentation](#see-repo-documentation) through the terminal
- [Commands history](#commands-history)

## What it CAN'T do now / What it WILL do in the future.

- Search models
- More providers
- API integration to model usage
- Route for multiple models
- Easily agents creation

## Providers

| Provider     | ID  |
| ------------ | --- |
| Hugging Face | hg  |
| Models Scope | ms  |
| Ollama       | ol  |

## Installing it

### Quick install

#### Linux

```bash
curl -fsSL https://raw.githubusercontent.com/kauanmezavila/cgprism/main/install.sh | bash
```

The automated installer supports Linux distributions using apt, dnf, pacman, or zypper.
On macOS, install the requirements below and use the manual installation steps.

#### Windows

```bash
irm https://raw.githubusercontent.com/kauanmezavila/cgprism/main/install.ps1 | iex
```

### Manual installation

Install the system packages for your Linux distribution. These include compiler tools for native Node.js dependencies such as SQLite:

```bash
# Debian / Ubuntu
sudo apt-get update
sudo apt-get install -y git git-lfs curl ca-certificates build-essential python3

# Fedora (use this block instead on Fedora)
sudo dnf install -y git git-lfs curl gcc-c++ make python3

# Arch Linux (use this block instead on Arch)
sudo pacman -S --needed git-lfs curl base-devel python

# openSUSE (use this block instead on openSUSE)
sudo zypper install -y git git-lfs curl gcc-c++ make python3
```

On macOS, install [Homebrew](https://brew.sh/) if needed, then install Git and Git LFS and the Xcode command-line tools:

```bash
brew install git git-lfs
git lfs install
xcode-select --install
```

On macOS, download and install the Ollama app from [ollama.com/download](https://ollama.com/download). On Linux, install Ollama with its official installer:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Install Node.js 22 or newer with [nvm](https://github.com/nvm-sh/nvm) on Linux or macOS, then install pnpm:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.41.0/install.sh | bash
# Open a new terminal, then:
nvm install 22
nvm use 22
npm install -g pnpm
pnpm setup
```

If nvm is not available in the current terminal, open a new terminal or load it with source ~/.nvm/nvm.sh. After pnpm setup, open a new terminal so pnpm's global command path is active. Then clone and install CGPrism:

```bash
git clone https://github.com/kauanmezavila/cgprism.git
cd cgprism
pnpm install
pnpm add -g .
```

If the cgprism command is not found, run pnpm setup and restart the shell.

CGPrism stores the registry.db and downloaded repos in .cgprism in the home directory. You can set `CGPRISM_HOME` to set another directory:

```bash
export CGPRISM_HOME=/mnt/data/cgprism
```

```powershell
$env:CGPRISM_HOME = 'D:\CGPrismData'
```

I recommend keeping this directory when updating or reinstalling CGPrism.

CGPrism also creates a separate `StorageManager/storage.db` SQLite database under this data directory for command history. It is independent of `registry.db`. Commands are recorded automatically, and `cgprism history` displays the most recent 100 entries.

If you are upgrading an older version and want to keep using its existing models and registry, set CGPRISM_HOME to that version src/data. Alternatively, move the Models folder and registry.db into the new .cgprism directory.

## Commands

### Recomendation

Try every command using this model:

```bash
cgprism install hg@QuantFactory/SmolLM2-135M-Instruct-GGUF
```

### Version

```bash
cgprism --version
```

### Doctor

```bash
cgprism doctor
```

### Update

```bash
cgprism update
```

### List models

```bash
cgprism list
```

### Commands history

```bash
cgprism history
```

### Install models

```bash
cgprism install [PROVIDER_ID]@[MODEL_OWNER]/[MODEL_REPO_NAME] [FLAGS]
```

- \*PROVIDER_ID: Use a provider ID of [providers](#providers)
- \*MODEL_OWNER: The owner of the repo
- \*MODEL_REPO_NAME: The model name repo
- FLAGS: [Flags](#flags) to optmize your installing

#### Example

```bash
cgprism install ms@MiniMax/MiniMax-M3.1-Flash.git --gls
```

#### Flags

| Flag                  | Function                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------- |
| --gls                 | Detect and install GLS pointers in the repo                                              |
| --gls --full --ollama | Will install and deploy ONE model with ollama (repos with multiple models may fail here) |

### Uninstall models

```bash
cgprism uninstall [PROVIDER_ID]@[MODEL_OWNER]/[MODEL_REPO_NAME] [FLAGS]
```

- PROVIDER_ID: Use a provider ID of [providers](#providers)
- MODEL_OWNER: The owner of the repo
- MODEL_REPO_NAME: The model name repo

#### Examples

Uninstall the model from provider + an owner

```bash
cgprism uninstall ms@MiniMax/MiniMax-M3.1-Flash.git
```

Uninstall all repos from a owner

```bash
cgprism uninstall ms@MiniMax
```

Uninstall all repos form a provider

```bash
cgprism uninstall ms
```

### Hardware and model compatibility

```bash
cgprism hardware [FLAGS]
```

- FLAGS: [Flags](#flags-1) to options

#### Flags

| Flag        | Function                                                             |
| ----------- | -------------------------------------------------------------------- |
| --about     | Hardaware infos                                                      |
| --actual    | Judges if the installed models can run based on an heuristic analyse |
| --benchmark | Makes an heuristic analyse in the system                             |

### Manage runtime models

```bash
cgprism model [[PROVIDER_ID]@[MODEL_OWNER]/[MODEL_REPO_NAME] or [MODEL_NAME]] [FLAGS]
```

- PROVIDER_ID: Use a provider ID of [providers](#providers)
- MODEL_OWNER: The owner of the repo
- MODEL_REPO_NAME: The model name repo
- MODEL_NAME: The name of the model
- FLAGS: [Flags](#flags-2) to diferent options

#### Example

Create a new Modelfile in the HuggingFace provider dir, opens a interactive menu to you choose which model.

```bash
cgprism model hg@ --new
```

Allows you to create a new model into Ollama using a Modelfile

```bash
cgprism model hg@ --create --ollama
```

#### Flags

| Flag              | Function                                                |
| ----------------- | ------------------------------------------------------- |
| --new             | Creates a new Modelfile                                 |
| --create --ollama | Create a new model in Ollama using a previous Modelcard |

### Run models

```bash
cgprism run [[PROVIDER_ID]@[MODEL_OWNER]/[MODEL_REPO_NAME] or [MODEL_NAME]] [FLAGS]
```

- PROVIDER_ID: Use a provider ID of [providers](#providers)
- MODEL_OWNER: The owner of the repo
- MODEL_REPO_NAME: The model name repo
- MODEL_NAME: The name of the model
- FLAGS: [Flags](#flags-3) to diferent options

#### Example

Run a logged model (with Modelfile in CGPrism DB) with Ollama, opens a interactive menu to you choose which model.

```bash
cgprism run hg@ --ollama
```

> **Hint:** Hey! Downloaded a model in other provider and want to run with Ollama? Try to [create a model card](#manage-runtime-models)

#### Flags

| Flag     | Function                                                    |
| -------- | ----------------------------------------------------------- |
| --ollama | Runs a model from Ollama with modelcard logged with CGPrism |

### See repo documentation

Look the .md's in the repo on your terminal

```bash
cgprism docs [SEARCH_TERM] [FLAGS]
```

- `SEARCH_TERM`: A term used to search into the storage references.
- `FLAGS`: [Flags](#flags-4) to optmize your searching

#### Examples

Search by name in .db:

```bash
cgprism docs nemotrom --model
```

Search by provider:

```bash
cgprism docs hg --provider
```

Search by owner:

```bash
cgprism docs nvidia --owner
```

Search by architecture:

```bash
cgprism docs Qwen --architecture
```

#### Flags

| Flag             | Function     |
| ---------------- | ------------ |
| `--model`        | name in db   |
| `--provider`     | provider     |
| `--owner`        | owner        |
| `--family`       | family       |
| `--architecture` | architecture |
| `--format`       | format       |
| `--runtime`      | runtime      |
| `--status`       | status       |
