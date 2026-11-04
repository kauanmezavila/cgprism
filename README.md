<div align="center">
  <h1>CGPrism</h1>
  <p>The local interface for AI management</p>
  <p><b>v0.0.2: Library Manager</b></p>
</div>

## What it is?

CGPrism is born to resolve all your problems with local AI models managment.
The tool is being build with JavaScript for main logic and SQLite for registry.

## What it CAN do now

- Install models repos from Hugging Face
- Install GLS pointers
- Uninstall providers/owners/repos/models
- Registring everything in a SQLite 3 DB

## What it CAN'T do now / What it WILL do in the future.

- Run models
- Search models
- TUI docs navigation
- More providers
- API integration to model usage
- Route for multiple models
- Easily agents creation

## Providers

| Provider     | ID  |
| ------------ | --- |
| Hugging Face | hg  |
| Models Scope | ms  |

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

| Flag  | Function                                    |
| ----- | ------------------------------------------- |
| --gls | Detect and install GLS pointers in the repo |

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
