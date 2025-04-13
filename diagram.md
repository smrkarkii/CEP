%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffdfd3', 'edgeLabelBackground':'#fff'}}}%%

flowchart TD
    %% ===== PARTICIPANTS =====
    User("**🏆 User**\n(Buy Coins/Use AI Chat)")
    Creator("**🎨 Content Creator**\n(Mint Tokens/Upload)")
    UI[["**🖥️ DApp UI**\nNext.js"]]

    %% ===== BACKEND SERVICES =====
    subgraph Backends["**⚙️ Backend Services**"]
        SocialBackend("**🤝 Social Backend**\nNode.js\n(Likes/Comments)")
        AIService("**🧠 AI Service**\nRAG Pipeline\n+ OpenAI/ATOMA")
    end

    %% ===== BLOCKCHAIN LAYER =====
    subgraph SUI["**⛓ SUI Blockchain**"]
        CoinContract("**🪙 CreatorCoin**\nMove Contract\n(Mint/Burn)")
        Exchange("**💱 Exchange**\nMove Contract\n(SUI ↔ Coin)")
        Economy("**💰 Economy**\nMove Contract\n(AI Payments)")
    end

    %% ===== DATA STORAGE =====
    Walrus{{"**🦭 Walrus Storage**\nEncrypted Content"}}
    VectorDB[("**📊 VectorDB**\nAI Embeddings")]
    SocialDB[("**🗂 Social DB**\nUser Profiles")]

    %% ===== CORE FLOWS =====
    %% Creator Onboarding
    Creator -->|1. Create Profile| UI
    UI -->|2. Save Data| SocialBackend
    SocialBackend -->|3. Store Profile| SocialDB
    Creator -->|4. Mint Token| CoinContract
    Creator -->|5. Upload Content| Walrus

    %% User Actions
    User -->|6. Buy Tokens| Exchange
    User -->|7. Like/Comment| SocialBackend
    User -->|8. Ask AI Chat| AIService

    %% AI Processing
    AIService -->|9. Search Content| VectorDB
    AIService -->|10. Generate Answer| OpenAI
    AIService -->|11. Pay Creator| Economy
    Walrus -.->|12. Content Index| AIService

    %% UI Connections
    SocialBackend -->|13. Feed Data| UI
    Exchange -->|14. Balance Update| UI
    AIService -->|15. Display Answer| UI

    %% Styling
    style User fill:#f9f,stroke:#333,color:#000
    style Creator fill:#9f9,stroke:#333,color:#000
    style AIService fill:#99f,stroke:#333,color:#000
    style SUI fill:#e1f5fe,stroke:#039be5
    style Backends fill:#e8f5e9,stroke:#43a047
