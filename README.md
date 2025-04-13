# 🌟 Cre8Space  
### The Decentralized Creator Economy Platform  
**Where creators monetize fairly and fans invest in success**  

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Preview-brightgreen)](https://demo.cre8space.xyz)  
[![Blockchain](https://img.shields.io/badge/Powered%20by-SUI%20Blockchain-blue)](https://sui.io)  

---

## 🔍 Problem Statement  
Today's creator economy is fundamentally broken:  

🛑 **For Creators**  
- Platforms take 30-50% of earnings while owning creator-content relationships  
- Monetization options are limited to ads/sponsorships (unreliable and intrusive)  
- No way to reward early supporters who drive viral growth  

🛑 **For Fans**  
- Engagement (likes, shares) generates value but earns nothing  
- No ownership in creators' success despite being their growth engine  
- Passive consumption with no financial upside  

**The Result**: A $250B+ industry where value flows to middlemen, not creators or their communities.  

---

## ✨ Our Solution  
Cre8Space is a decentralized platform where:  

🟢 **Creators**  
- Mint their own tokens to monetize directly  
- Retain full ownership of content/IP  
- Reward early supporters programmatically  

🟢 **Fans**  
- Buy creator tokens to access perks/premium content  
- Earn as creators grow (token value appreciation)  
- Trade tokens in a liquid secondary market  

**Key Innovation**:  
- First platform aligning incentives between creators and fans through tokenized growth  
- AI-powered engagement tools (future roadmap) to deepen creator-fan relationships  

---

## 🏗 System Architecture  
![High-Level Architecture](assets/architecture_diagram.png)  

### Core Components  
| Layer          | Technology                          | Purpose                          |
|----------------|-------------------------------------|----------------------------------|
| **Frontend**   | Next.js, TailwindCSS               | User interface for creators/fans |
| **Backend**    | Node.js, Express                   | Handles off-chain data (comments)|
| **Blockchain** | SUI Move Smart Contracts           | Creator tokens, swaps, content access |
| **Storage**    | Walrus (IPFS-compatible)           | Decentralized content hosting    |
| **Wallets**    | Suiet, Ethos                       | Secure SUI transactions          |

---

## 🚀 Key Features  
### For Creators  
- ✅ One-click token creation with customizable economics  
- ✅ Premium content gating via token ownership  
- ✅ Engagement-based token price tiers  

### For Fans  
- ✅ Buy/sell creator tokens with SUI  
- ✅ Early supporter rewards through token appreciation  
- ✅ Access exclusive content and perks  

### Platform  
- 2.5% transaction fee sustains operations  
- Future: AI chatbot monetizing creator content  

---

## 🛠 Tech Stack  
- **Blockchain**: SUI Move  
- **Frontend**: React JS  
- **Backend**: Node.js, Express  
- **Storage**: Walrus 
  **AI**: Vector_Db: Qdrant, LLM: Atoma API and OpenAI API 

---

## 🏃 Getting Started  

### Prerequisites  
- Node.js v18+  
- SUI CLI  
- Testnet SUI tokens  

### Installation  
```bash
git clone https://github.com/your-org/cre8space.git
cd cre8space
npm install
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_BASE_URL=http://localhost:3000
WALLET_PRIVATE_KEY=your_wallet_private_key
NEXT_PUBLIC_PACKAGE_ID=0xYOUR_PACKAGE_ID
NEXT_PUBLIC_PUBLISHER_ID=0xYOUR_PUBLISHER_ID
# Frontend (Next.js)
pnpm dev

# Backend (Node.js - if separate)
cd server && pnpm start

* Run rag-backend: [instructions](https://github.com/smrkarkii/CEP/tree/rag-backend) for add data and chat with RAAG system
* Run the-backend : [instructions-here](https://github.com/smrkarkii/CEP/tree/the-backend) for likes, comments, follow

---

## 🔍 Features

### 📦 RAG Backend
- Upload and store **image + text data** to a vector database.
  - How to store image in vector: first 
- Enable **chat functionality** powered by a RAG system using both images and text.

### 💬 Social Interaction Backend (`the-backend`)
- Manage core social features:
  - Likes
  - Comments
  - Follow/Unfollow functionality

### 📦 Blockchain Backend
- Manage core social features:
  - Likes
  - Comments
  - Follow/Unfollow functionality

---

## 👥 Team Members & Roles

| Name                  | Role                   |
|-----------------------|------------------------|
| Smriti Karki          | Blockchain Developer   |
| Ayushma Kafle         | Front-End Developer    |
| Naresh Khatiwada      | Front-End Developer    |
| Aananda Prasad Giri   | AI Developer           |

---
