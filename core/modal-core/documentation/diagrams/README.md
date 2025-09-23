# WalletMesh Diagrams

This section contains all diagrams used throughout the WalletMesh documentation. Having them centralized here allows for easier maintenance and reuse while ensuring consistency across the documentation.

## Directory Structure

```mermaid
graph TD
    A[diagrams] --> B[architecture]
    A --> C[workflows]
    A --> D[class-relationships]
    
    B --> B1[component-diagrams]
    B --> B2[system-overview]
    B --> B3[integration-patterns]
    
    C --> C1[connection-flows]
    C --> C2[transaction-flows]
    C --> C3[error-flows]
    
    D --> D1[core-classes]
    D --> D2[provider-classes]
    D --> D3[transport-classes]
```

## Architecture Diagrams

### System Overview

```mermaid
flowchart TD
    subgraph Application Layer
        A[Web Application] --> B[Framework Implementation]
        B --> C[Modal Controller]
    end
    
    subgraph Core Layer
        C --> D[State Management]
        C --> E[Provider System]
        C --> F[Transport Layer]
        
        D --> G[State Store]
        E --> H[Wallet Connectors]
        F --> I[Communication Protocols]
    end
    
    subgraph Integration Layer
        H --> J[Wallet Providers]
        I --> K[External Systems]
    end
    
    style Application Layer fill:#e1f5fe,stroke:#01579b
    style Core Layer fill:#f3e5f5,stroke:#4a148c
    style Integration Layer fill:#e8f5e9,stroke:#1b5e20
```

### Component Relationships

```mermaid
classDiagram
    class Modal {
        +connect()
        +disconnect()
        +sendTransaction()
    }
    
    class Provider {
        +type: string
        +isConnected: boolean
        +connect()
        +disconnect()
    }
    
    class State {
        +status: Status
        +accounts: string[]
        +chain: string
        +update()
    }
    
    class Transport {
        +send()
        +receive()
        +isConnected: boolean
    }
    
    Modal --> Provider
    Modal --> State
    Modal --> Transport
```

## Workflow Diagrams

### Connection Flow

```mermaid
sequenceDiagram
    participant User
    participant App
    participant Modal
    participant Provider
    participant Wallet
    
    User->>App: Click Connect
    App->>Modal: connect()
    Modal->>Provider: initialize()
    Provider->>Wallet: request connection
    Wallet-->>User: Prompt for approval
    User-->>Wallet: Approve
    Wallet-->>Provider: Connected
    Provider-->>Modal: Update state
    Modal-->>App: Connection complete
```

### Transaction Flow

```mermaid
sequenceDiagram
    participant User
    participant App
    participant Modal
    participant Provider
    participant Network
    
    User->>App: Submit Transaction
    App->>Modal: sendTransaction()
    Modal->>Provider: prepare transaction
    Provider->>User: Request signature
    User->>Provider: Approve
    Provider->>Network: Submit
    Network-->>Provider: Confirm
    Provider-->>Modal: Update state
    Modal-->>App: Transaction complete
```

## Class Relationship Diagrams

### Core Classes

```mermaid
classDiagram
    class ModalController {
        -provider: Provider
        -state: State
        -transport: Transport
        +connect()
        +disconnect()
        +sendTransaction()
    }
    
    class Provider {
        <<interface>>
        +type: string
        +connect()
        +disconnect()
    }
    
    class State {
        -store: Store
        +getState()
        +setState()
        +subscribe()
    }
    
    class Transport {
        <<interface>>
        +connect()
        +disconnect()
        +send()
    }
    
    ModalController --> Provider
    ModalController --> State
    ModalController --> Transport
```

### Provider Classes

```mermaid
classDiagram
    class BaseProvider {
        <<abstract>>
        +type: string
        +connect()
        +disconnect()
    }
    
    class InjectedProvider {
        +connect()
        +disconnect()
        -detectProvider()
    }
    
    class WalletConnectProvider {
        +connect()
        +disconnect()
        -initBridge()
    }
    
    BaseProvider <|-- InjectedProvider
    BaseProvider <|-- WalletConnectProvider
```

## Usage Guidelines

### 1. Diagram Maintenance

When updating diagrams:
1. Edit the source in this directory
2. Update any copies in other documentation
3. Ensure consistency with implementation
4. Verify visual clarity and readability

### 2. Creating New Diagrams

When adding new diagrams:
1. Follow existing naming conventions
2. Use consistent styling
3. Add to appropriate subdirectory
4. Update this index document
5. Include clear descriptions

### 3. Style Guidelines

```mermaid
%%{init: {'theme': 'neutral', 'themeVariables': {
  'primaryColor': '#e1f5fe',
  'primaryBorderColor': '#01579b',
  'secondaryColor': '#f3e5f5',
  'secondaryBorderColor': '#4a148c'
}}}%%
flowchart TD
    A[Primary Element] --> B[Secondary Element]
    B --> C[Tertiary Element]
    
    style A fill:#e1f5fe,stroke:#01579b
    style B fill:#f3e5f5,stroke:#4a148c
    style C fill:#e8f5e9,stroke:#1b5e20
```

- Use consistent colors for similar elements
- Maintain readable contrast ratios
- Keep diagrams focused and uncluttered
- Split complex diagrams when needed

## Diagram Types and Uses

### Component Diagrams
- Show system architecture
- Illustrate module relationships
- Highlight data flow
- Explain integration points

### Sequence Diagrams
- Demonstrate workflows
- Show interaction patterns
- Illustrate error handling
- Display timing relationships

### Class Diagrams
- Show code structure
- Display inheritance
- Illustrate patterns
- Document APIs

## Further Reading

- [Architecture Documentation](../architecture/README.md)
- [API Guides](../api-guides/README.md)
- [Design Patterns](../patterns/README.md)
