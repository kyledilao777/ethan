# 🧠 Ethan – Your Personal AI Calendar Assistant


https://github.com/user-attachments/assets/ccf10214-2364-411e-a268-708b5ba0d102


**Ethan** is your intelligent assistant for scheduling – whether it’s organizing events, setting up appointments, or calling meetings, Ethan makes managing your calendar as simple as a conversation.

Built with seamless **natural language processing** and Google Calendar integration, Ethan supports:
- 📅 Smart scheduling across time zones  
- 🔗 Adding links and notes to events  
- 📇 Managing a personalized contact list  
- 🧠 Customizing preferences so Ethan schedules based on your ideal availability

## ✨ Ethan vs. Ethan+
| Feature | Ethan | Ethan+ |
|--------|-------|--------|
| Google Calendar Integration | ✅ | ✅ |
| Natural Language Scheduling | ✅ | ✅ |
| Contact & Preference Management | ✅ | ✅ |
| Advanced Reasoning with RAG | ❌ | ✅ |
| Proprietary Data Retrieval | ❌ | ✅ |

Ethan+ leverages an additional **Retrieval-Augmented Generation (RAG)** system for more contextual understanding and access to proprietary or personal data – making it even more powerful for power users.

---

## 🚀 Get Started

### 1. Clone this repository:
```bash
git clone https://github.com/kyledilao777/ethan.git
cd ethan
```

### 2. Set up environments:
You'll need three separate environments to run Ethan:

#### 🖥️ `client` (React Frontend)
```bash
cd client
npm install
npm start
```

#### 🧠 `flask-server` (Python AI Agent)
```bash
cd flask-server
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python agent.py
```

#### 🌐 `server` (Node.js Backend)
```bash
cd server
npm install
node server.js
```

> ⚠️ **Note:** If you're only interested in exploring the AI agent, feel free to work directly in the `flask-server` directory.

---

## 🛠️ Tech Stack
- **React + TailwindCSS** – Frontend
- **Node.js + Express** – API & Auth Server
- **Python + Flask** – AI Agent (LLM & RAG)
- **MongoDB** – User data and token storage
- **Google Calendar API** – Calendar integration
- **OpenAI API** – Natural language processing

---

## 🤝 Contributing
We welcome contributions! If you'd like to help improve Ethan or add features, feel free to open an issue or pull request. For major changes, please open a discussion first to talk about what you’d like to work on.

---

## 📬 Contact
Built by [Kyle](https://github.com/kyledilao777) and [Evan](https://github.com/evanch08).  
For feedback or questions, feel free to reach out!
