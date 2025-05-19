# Dev Container Configuration

This dev container includes tools and extensions configured for the WalletMesh Packages development environment.

## Included Tools

- Node.js 20
- pnpm 10.11.0
- Aider (AI coding assistant)
- ripgrep (fast text search)
- claude-code CLI
- quint (formal specification language)

## VS Code Extensions

- biomejs.biome - Code formatter/linter
- vitest.explorer - Test explorer
- bierner.markdown-mermaid - Mermaid diagram support
- github.vscode-github-actions - GitHub Actions support
- saoudrizwan.claude-dev - Claude AI integration
- rooveterinaryinc.roo-cline - Cline AI assistant
- informal.quint-vscode - Quint language support
- ms-azuretools.vscode-containers - Container management

Note: The `ms-vscode.vscode-typescript-next` extension (for experimental TypeScript features) was removed in favor of using the stable TypeScript version defined in package.json.

## Custom Mounts

The dev container pre-configures:
- Volume mount for pnpm store at `/home/vscode/.pnpm-store`
- Volume mount for node_modules to improve performance

## Usage

Open the project in VS Code and use the "Reopen in Container" command to start developing inside the container.