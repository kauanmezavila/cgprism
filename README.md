<div align="center">
  <h1>CGPrism</h1>
  <p>The local interface for AI management</p>
  <p><b>v0.0.6: Llama Better Specialist</b></p>
</div>

## What it is?

CGPrism is born to resolve all your problems with local AI models managment.
The tool is being build with JavaScript for main logic and SQLite for registry.

## What it CAN do now

- Install models repos from Hugging Face
- Install GLS pointers
- Uninstall providers/owners/repos/models
- Registring everything in a SQLite 3 DB
- TUI docs navigation
- Run models

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

First, install all the technologys if you dont have:

- [git](https://git-scm.com/install)
- [Node.js](https://nodejs.org/en/download)
- [pnpm](https://pnpm.io/installation)

```bash
git install gls
git clone https://github.com/kauanmezavila/cgprism.git
cd cgprism

chmod +x src/cli/main.js # Run this only in Unix based systems

pnpm install -g .
```

## Commands

### Version

```bash
cgprism --version
```

### List models

```bash
cgprism list
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

### Manage runtime models

```bash
cgprism model [[PROVIDER_ID]@[MODEL_OWNER]/[MODEL_REPO_NAME] or [MODEL_NAME]] [FLAGS]
```

- PROVIDER_ID: Use a provider ID of [providers](#providers)
- MODEL_OWNER: The owner of the repo
- MODEL_REPO_NAME: The model name repo
- MODEL_NAME: The name of the model
- FLAGS: [Flags](#flags-1) to diferent options

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
- FLAGS: [Flags](#flags-2) to diferent options

#### Example

Run a logged model (with Modelfile in CGPrism DB) with Ollama, opens a interactive menu to you choose which model.

```bash
cgprism run hg@ --ollama
```

> **Hint:** Hey!, downloaded a model in other provider and want to run with Ollama? Try to [create a model card](#manage-runtime-models)

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
- `FLAGS`: [Flags](#flags-3) to optmize your searching

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
