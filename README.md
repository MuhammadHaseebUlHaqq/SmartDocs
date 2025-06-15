# SmartDocs - AI-Powered Document Question Answering App

## Project Overview
SmartDocs is a full-stack web application that enables users to interact with their documents using natural language. Built with Next.js and modern AI technologies, it demonstrates practical implementation of Large Language Models (LLMs) in real-world applications.

## Learning Journey Documentation

### 1. Project Setup and Architecture
#### Technologies We'll Use
- **Frontend**: Next.js 14 (App Router)
  - React for UI components
  - Tailwind CSS for styling
  - TypeScript for type safety
- **Backend**: Django with Django REST Framework
  - Django for robust backend framework
  - Django REST Framework for API endpoints
  - Django Channels for WebSocket support
  - LangChain for LLM integration
  - ChromaDB for vector storage
  - PyPDF2 and python-docx for document processing

#### Project Structure
```
smartdocs/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App router pages and components
│   ├── components/          # Reusable React components
│   ├── lib/                 # Utility functions and API clients
│   └── public/             # Static assets
├── backend/                 # FastAPI backend application
│   ├── app/                # FastAPI application code
│   ├── models/             # Data models and schemas
│   ├── services/           # Business logic and LLM integration
│   └── utils/              # Utility functions
└── docs/                   # Project documentation and learning materials
```

### 2. Learning Modules

#### Module 1: Project Setup and Basic Architecture
- Setting up Next.js with TypeScript
- Understanding the App Router architecture
- Setting up FastAPI backend
- Implementing basic API endpoints
- Learning about modern web development practices

#### Module 2: Document Processing and Storage
- Document parsing and chunking
- Understanding embeddings and vector databases
- Implementing document storage with ChromaDB
- Learning about RAG (Retrieval-Augmented Generation)

#### Module 3: LLM Integration
- Understanding LLM APIs and integration
- Implementing RAG with LangChain
- Prompt engineering and optimization
- Response streaming implementation

#### Module 4: Frontend Development
- Building responsive UI components
- Implementing file upload functionality
- Creating interactive chat interface
- Real-time response streaming

#### Module 5: Advanced Features and Optimization
- Error handling and edge cases
- Performance optimization
- Security best practices
- Testing and deployment

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- Git

### Installation
(To be added as we progress)

## Development Progress
We'll update this section as we implement each feature, including:
- Implementation details
- Learning points
- Code explanations
- Best practices
- Common pitfalls and solutions

## Learning Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework Documentation](https://www.django-rest-framework.org/)
- [LangChain Documentation](https://python.langchain.com/docs/get_started/introduction)
- [ChromaDB Documentation](https://docs.trychroma.com/)

## Contributing
This project is designed as a learning journey. Feel free to follow along and implement your own version!

## License
MIT License 