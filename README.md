<div align="center">
  <h1>CGPrism</h1>
  <p>The local interface for AI management</p>
  <p><b>v0.0.8: The local AI enthusiast</b></p>
</div>

## What it is?

CGPrism is born to resolve all your problems with local AI models managment.
The tool is being build with JavaScript for main logic and SQLite for registry.

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

#### Linux and MacOS (unix-based)

```bash
curl -fsSL https://raw.githubusercontent.com/kauanmezavila/cgprism/main/install.sh | bash
```

#### Windows

```bash
irm https://raw.githubusercontent.com/kauanmezavila/cgprism/main/install.ps1 | iex
```

Requirements:

- [Git](https://git-scm.com/install)
- [Git LFS](https://git-lfs.com/)
- [Node.js 22 or newer](https://nodejs.org/en/download)
- [pnpm](https://pnpm.io/installation)
- [Ollama](https://ollama.com/download)

Clone and install CGPrism:

```bash
git clone https://github.com/kauanmezavila/cgprism.git
cd cgprism
pnpm install
pnpm add -g .
```

If the command is not found, run `pnpm setup` and restart the shell.

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

### Version

```bash
cgprism --version
```

### Doctor

```bash
cgprism doctor
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
