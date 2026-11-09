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

## Providers

| Provider     | ID  |
| ------------ | --- |
| Hugging Face | hg  |
| Models Scope | ms  |
| Ollama       | ol  |

## Installing it

> PS: If you suspect one of these "automated" install will/are not working, try [manual install](#manual-installation)

### Binary options

You can check on [Releases](https://github.com/kauanmezavila/cgprism/releases/tag/v1.0.0) some options:

- Linux:
  - [x64](https://github.com/kauanmezavila/cgprism/releases/download/v1.0.0/cgprism-linux-x64)
  - [ARM64](https://github.com/kauanmezavila/cgprism/releases/download/v1.0.0/cgprism-linux-arm64)

- Linux Static:
  - [ARM64](https://github.com/kauanmezavila/cgprism/releases/download/v1.0.0/cgprism-linuxstatic-arm64)

- MacOS
  - [x64](https://github.com/kauanmezavila/cgprism/releases/download/v1.0.0/cgprism-macos-x64) [Unsigned]
  - [ARM64](https://github.com/kauanmezavila/cgprism/releases/download/v1.0.0/cgprism-macos-arm64) [Unsigned]

- Windows:
  - [x64](https://github.com/kauanmezavila/cgprism/releases/download/v1.0.0/cgprism-win-x64)

> "You got a mail!" If the binary don't work. Click [here](#report-001)

### Quick install

#### Linux

```bash
curl -fsSL https://raw.githubusercontent.com/kauanmezavila/cgprism/main/install.sh | bash
```

The automated installer uses apt, dnf, pacman, or zypper.
On macOS, install the requirements below and follow the [manual installation steps](#manual-installation).

#### Windows

```bash
irm https://raw.githubusercontent.com/kauanmezavila/cgprism/main/install.ps1 | iex
```

### Manual installation

Install the dependecies for your Linux distro:

```bash
# Debian / Ubuntu
sudo apt-get update
sudo apt-get install -y git git-lfs curl ca-certificates build-essential python3

# Fedora (use this on Fedora)
sudo dnf install -y git git-lfs curl gcc-c++ make python3

# Arch Linux (use this on Arch)
sudo pacman -S --needed git-lfs curl base-devel python

# openSUSE (use this on openSUSE)
sudo zypper install -y git git-lfs curl gcc-c++ make python3
```

On macOS, install [Homebrew](https://brew.sh/) if needed, then install Git, Git LFS and the Xcode command-line tools:

```bash
brew install git git-lfs
git lfs install
xcode-select --install
```

On macOS, download and install [Ollama](https://ollama.com/download). On Linux, install Ollama with its official installer:

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

If nvm is not available in the current terminal, open a new terminal or load it with `source ~/.nvm/nvm.sh`. After `pnpm setup`, open a new terminal so pnpm's global command path is active. Then clone and install CGPrism:

```bash
git clone https://github.com/kauanmezavila/cgprism.git
cd cgprism
pnpm install
pnpm add -g .
```

If the cgprism command is not found, run `pnpm setup` and restart the shell.

CGPrism stores the registry.db and downloaded repos in `~/.cgprism`. You can set `CGPRISM_HOME` to set another directory:

```bash
export CGPRISM_HOME=/mnt/data/cgprism
```

```powershell
$env:CGPRISM_HOME = 'D:\CGPrismData'
```

I recommend keeping this directory when updating or reinstalling CGPrism.

CGPrism also creates a separate StorageManager/storage.db SQLite database under this data directory for command history. It only records the last 100 commands runned with CGPrism.

## Commands

### Recomendation

Try every command using this light-weight model:

```bash
cgprism install hg@QuantFactory/SmolLM2-135M-Instruct-GGUF
```

It's incredible light and can run on CPU

> "You got a mail!" If you want a copy-paste test prompt. Click [here](#report-002)

### Version

To see the actual version

```bash
cgprism --version
```

### Doctor

To makes health checks on the infrastructure

```bash
cgprism doctor
```

### Update

To update the system, the depencies and the models on your pc

```bash
cgprism update
```

### List models

To list the models with some infos

```bash
cgprism list
```

### Commands history

The last 100 runned with CGPrism

```bash
cgprism history
```

### Install models

To install models

> **HINT: while installing you will need to prompt some infos about the model or press enter and select the defaults; in this version, changing the model name may result in not being able to create modelcards for some reason that i am still looking for**

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

| Flag                  | Function                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| --gls                 | Detect and install GLS pointers in the repo                                                                    |
| --gls --full --ollama | Will install and deploy ONE model with ollama (nightly function, still under development but probaly can work) |

### Uninstall models

To uninstall models

```bash
cgprism uninstall [PROVIDER_ID]@[MODEL_OWNER]/[MODEL_REPO_NAME]
```

- \*PROVIDER_ID: Use a provider ID of [providers](#providers)
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

A special tool to make some analyzes on your hardware for AI compatibility

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

To interact model-runtime relations, for now it can create modelcards and set models in ollama

```bash
cgprism model [[PROVIDER_ID]@[MODEL_OWNER]/[MODEL_REPO_NAME] or [MODEL_NAME]] [FLAGS]
```

- \*PROVIDER_ID: Use a provider ID of [providers](#providers)
- MODEL_OWNER: The owner of the repo
- MODEL_REPO_NAME: The model name repo
- MODEL_NAME: The name of the model
- \*FLAGS: [Flags](#flags-2) to select what to make

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

To run models in the inferences.

```bash
cgprism run [[PROVIDER_ID]@[MODEL_OWNER]/[MODEL_REPO_NAME] or [MODEL_NAME]] [FLAGS]
```

- \*PROVIDER_ID: Use a provider ID of [providers](#providers)
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

- \*`SEARCH_TERM`: A term used to search into the storage references.
- \*`FLAGS`: [Flags](#flags-4) to select the term in your searching

#### Examples

Search by name in db:

```bash
cgprism docs nemotrom --model
```

Search by provider in db:

```bash
cgprism docs hg --provider
```

Search by owner in db:

```bash
cgprism docs nvidia --owner
```

Search by architecture in db:

```bash
cgprism docs Qwen --architecture
```

#### Flags

| Flag             | Function                     |
| ---------------- | ---------------------------- |
| `--model`        | Search by name in db         |
| `--provider`     | Search by provider in db     |
| `--owner`        | Search by owner in db        |
| `--family`       | Search by family in db       |
| `--architecture` | Search by architecture in db |
| `--format`       | Search by format in db       |
| `--runtime`      | Search by runtime in db      |
| `--status`       | Search by status in db       |

## Mails

### Report-001

For some reason i was unable to sign the macOS executable, so if didn't, i highly recommend use [manual installation](#manual-installation)

---

From: @yao-pkg/pkg

To: You

**Warning Unable to sign the macOS executable**
Due to the mandatory code signing requirement, before the
executable is distributed to end users, it must be signed.
Otherwise, it will be immediately killed by kernel on launch.
An ad-hoc signature is sufficient.
To do that, run pkg on a Mac, or transfer the executable to a Mac
and run "codesign --sign - <executable>", or (if you use Linux)
install "ldid" utility to PATH and then run pkg again

---

### Report-002

Want a copy-paste test prompt to test CGPrism?

```bash
# Check the version
cgprism --version

# Check if everything okay
cgprism doctor

# Install a ultralight model
cgprism install hg@QuantFactory/SmolLM2-135M-Instruct-GGUF

# Select one of the models, check it docs
cgprism docs hg --provider

# See if your pc can handle it (probably can)
cgprism hardware --about
cgprism hardware --benchmark
cgprism hardware --actual

# Check again if everything is okay
cgprism doctor

# Create the model card on Ollama
cgprism model hg@ --new
cgprism model hg@ --create --ollama

# Run it, make some questions to the model
cgprism run hg@ --ollama

# Finished? Run this to uninstall the model, delete the registry, and delete the model in Ollama
cgprism uninstall hg

# See your command history
cgprism history
```

---
