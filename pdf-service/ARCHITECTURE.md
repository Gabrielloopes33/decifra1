# 🏗️ Arquitetura do Serviço PDF

## Diagrama de Componentes

```mermaid
graph TB
    subgraph "App DECIFRA"
        A[Cliente] -->|POST /api/pdf/gerar| B[API Gateway/Load Balancer]
    end

    subgraph "Servidor VPS (EasyPanel)"
        B -->|Proxy Reverso| C[PDF Service<br/>Node.js + Express]
        
        subgraph "Docker Network"
            C -->|HTTP POST| D[Gotenberg<br/>Chrome Headless]
            C -.->|Read/Write| E[(Templates HTML)]
        end
    end

    subgraph "Supabase Cloud"
        C -->|Query| F[(PostgreSQL)]
        C -->|Upload| G[(Storage<br/>Bucket: pdfs)]
        C -.->|Validate| H[JWT Auth]
    end

    subgraph "External Services"
        D -.->|Load Fonts| I[Google Fonts]
    end

    style A fill:#C4785A,stroke:#2D1518,color:#fff
    style C fill:#7B9E87,stroke:#2D1518,color:#fff
    style D fill:#9B8AA5,stroke:#2D1518,color:#fff
    style F fill:#5A8A9C,stroke:#2D1518,color:#fff
    style G fill:#D4A574,stroke:#2D1518,color:#2D1518
```

## Fluxo de Geração de PDF

```mermaid
sequenceDiagram
    participant App as App DECIFRA
    participant API as PDF Service
    participant DB as Supabase
    participant PDF as Gotenberg
    participant S3 as Storage

    App->>API: POST /api/pdf/gerar<br/>{resultadoId, tipo, token}
    
    API->>API: Validar JWT
    
    alt Token inválido
        API-->>App: 401 Unauthorized
    end
    
    API->>DB: SELECT * FROM resultados
    DB-->>API: Resultado data
    
    API->>DB: SELECT * FROM clientes
    DB-->>API: Cliente data
    
    API->>DB: SELECT * FROM protocolos_recomendados
    DB-->>API: Protocolos data
    
    API->>API: Verificar permissões
    
    alt Sem permissão
        API-->>App: 403 Forbidden
    end
    
    API->>API: Renderizar Template Handlebars
    
    API->>PDF: POST /forms/chromium/convert/html<br/>HTML + Options
    
    PDF->>PDF: Chrome render + Print to PDF
    
    PDF-->>API: PDF Buffer
    
    alt Upload habilitado
        API->>S3: Upload PDF
        S3-->>API: Public URL
        API-->>App: {url, filename, tamanho}
    else Retornar base64
        API-->>App: {pdf: base64, filename, tamanho}
    end
```

## Estrutura de Templates

```mermaid
graph LR
    subgraph "Templates Handlebars"
        T1[cliente.html<br/>Visual limpo<br/>5 fatores<br/>Protocolos destacados]
        T2[treinadora.html<br/>Visual profissional<br/>5 fatores + 30 facetas<br/>Todos os dados]
    end

    subgraph "Dados"
        D1[Cliente]
        D2[Resultado<br/>scores_fatores<br/>scores_facetas<br/>percentis]
        D3[Protocolos<br/>Recomendados]
    end

    D1 --> T1
    D2 --> T1
    D3 --> T1

    D1 --> T2
    D2 --> T2
    D3 --> T2

    T1 --> HTML1[HTML Cliente]
    T2 --> HTML2[HTML Treinadora]

    style T1 fill:#C4785A,stroke:#2D1518,color:#fff
    style T2 fill:#9B8AA5,stroke:#2D1518,color:#fff
```

## Modelo de Dados

```mermaid
erDiagram
    CLIENTES ||--|| RESULTADOS : possui
    RESULTADOS ||--o{ PROTOCOLOS_RECOMENDADOS : gera
    PROTOCOLOS ||--o{ PROTOCOLOS_RECOMENDADOS : referencia
    TREINADORAS ||--o{ CLIENTES : orienta

    CLIENTES {
        uuid id PK
        string nome
        string email
        uuid treinadora_id FK
        string status
        timestamp created_at
    }

    RESULTADOS {
        uuid id PK
        uuid cliente_id FK
        jsonb scores_facetas
        jsonb scores_fatores
        jsonb percentis
        jsonb classificacoes
        timestamp created_at
    }

    TREINADORAS {
        uuid id PK
        string email
        string nome
        integer creditos
        uuid auth_user_id
    }

    PROTOCOLOS {
        uuid id PK
        string faceta
        string tipo
        string titulo
        string descricao
        jsonb exercicios
    }

    PROTOCOLOS_RECOMENDADOS {
        uuid id PK
        uuid resultado_id FK
        uuid protocolo_id FK
        integer prioridade
    }
```

## Segurança

```mermaid
flowchart TD
    A[Requisição] --> B{Autenticação}
    B -->|Token inválido| C[401 Unauthorized]
    B -->|Token válido| D{Rate Limit}
    
    D -->|Excedido| E[429 Too Many Requests]
    D -->|OK| F{Autorização}
    
    F -->|Não é treinadora<br/>do cliente| G[403 Forbidden]
    F -->|Permitido| H[Processar PDF]
    
    H --> I[Retornar dados]

    style C fill:#e74c3c,color:#fff
    style E fill:#e74c3c,color:#fff
    style G fill:#e74c3c,color:#fff
    style I fill:#2ecc71,color:#fff
```

## Deployment

```mermaid
graph TB
    subgraph "Developer Machine"
        A[Código Fonte]
        B[Docker Build]
    end

    subgraph "Docker Hub / Registry"
        C[decifra-pdf:latest]
    end

    subgraph "VPS com EasyPanel"
        D[Docker Compose]
        E[Container PDF API]
        F[Container Gotenberg]
        G[Nginx Proxy]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    D --> F
    E --> G
    F --> G

    H[App DECIFRA] -->|HTTPS| G
```

## Escalabilidade

```mermaid
graph TB
    subgraph "Load Balancer"
        LB[Nginx/Traefik]
    end

    subgraph "PDF Service Instances"
        API1[PDF API #1]
        API2[PDF API #2]
        API3[PDF API #3]
    end

    subgraph "PDF Workers"
        G1[Gotenberg #1]
        G2[Gotenberg #2]
    end

    subgraph "Data Layer"
        DB[(Supabase)]
        S3[(Storage)]
    end

    LB --> API1
    LB --> API2
    LB --> API3

    API1 --> G1
    API2 --> G2
    API3 --> G1

    API1 --> DB
    API2 --> DB
    API3 --> DB

    API1 --> S3
    API2 --> S3
    API3 --> S3

    style LB fill:#C4785A,color:#fff
    style API1 fill:#7B9E87,color:#fff
    style API2 fill:#7B9E87,color:#fff
    style API3 fill:#7B9E87,color:#fff
```

> **Nota:** Para escalar, basta aumentar o número de réplicas no Docker Compose:
> ```yaml
> deploy:
>   replicas: 3
> ```
