# 🔗 URL Shortener — Backend API

A production-ready, authenticated URL shortener REST API built with **NestJS**, **MongoDB**, and **Prisma ORM**.

## ✨ Features & Production Upgrades

- 🔐 **Secure JWT Authentication** — Implements a dual-token system: short-lived access tokens in memory, and long-lived refresh tokens stored securely in `HttpOnly` cookies to prevent XSS.
- 🚀 **SOLID Architecture** — Strict adherence to Dependency Inversion and Interface Segregation. 100% of business logic services are abstracted behind interfaces.
- 🚦 **Rate Limiting** — Built-in `@nestjs/throttler` protects all endpoints from brute force and DoS attacks (e.g., max 10 requests/minute).
- ⚡ **Redis Caching** — The redirection endpoint is protected by a high-performance Redis caching layer to handle massive traffic spikes (the "Thundering Herd") without crashing MongoDB.
- 🛡️ **Edge Case Protections** — Smart defenses against infinite redirect loops, duplicate URL deduplication (saving database space), and strict blocking of malicious non-HTTP protocols (`javascript:`).
- 📖 **Swagger Docs** — Interactive API documentation at `/api`.
- 🗄️ **MongoDB** — Cloud-hosted NoSQL database via MongoDB Atlas & Prisma ORM.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| NestJS | Backend framework |
| TypeScript | Strongly typed language |
| Prisma ORM | Database client & schema management |
| MongoDB Atlas | Cloud database |
| Redis | High-speed redirection caching |
| Passport.js + JWT | Dual-token Authentication |
| Swagger (OpenAPI) | API Documentation |
| Helmet & Throttler | Security headers & Rate limiting |

## 📋 Prerequisites

Before you begin, ensure you have:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

## 🚀 Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/manumanuameeen/url-shortener-backend.git
cd url-shortener-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory by copying the example:

```bash
cp .env.example .env
```

Then open `.env` and fill in your values:

```env
PORT=3000
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/urlshortener?retryWrites=true&w=majority"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="1d"
FRONTEND_URL="http://localhost:5173"
REDIS_URL="redis://localhost:6379"
```

> ⚠️ **Never commit your `.env` file to GitHub.** It is already listed in `.gitignore`.

### 4. Generate the Prisma Client & push the schema to MongoDB

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the development server

```bash
npm run start:dev
```

The API will be running at: **`http://localhost:3000`**

## 📖 API Documentation

Once the server is running, visit **`http://localhost:3000/api`** to access the full interactive Swagger UI.

### API Endpoints

#### Auth
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/register` | Create a new user account | ❌ |
| `POST` | `/auth/login` | Login and receive a JWT token | ❌ |

#### URLs
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/urls` | Create a new short URL | ✅ |
| `GET` | `/urls` | Get all URLs for the current user | ✅ |
| `GET` | `/:shortCode` | Redirect to the original URL | ❌ |

## 🧪 Testing the API

You can test the API using the Swagger UI at `/api` or use `curl`:

```bash
# Register a new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "password": "password123"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'

# Shorten a URL (replace TOKEN with your JWT)
curl -X POST http://localhost:3000/urls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"originalUrl": "https://www.google.com"}'
```

## 🏗️ Project Structure

```
src/
├── auth/                  # Authentication module
│   ├── dto/               # Data Transfer Objects
│   ├── guards/            # JWT Auth Guard
│   └── strategies/        # Passport JWT Strategy
├── urls/                  # URL shortening module
│   └── dto/
├── users/                 # Users module
├── prisma/                # Prisma database service
└── main.ts                # Application entry point
prisma/
└── schema.prisma          # Database schema
```

## ⚙️ Available Scripts

```bash
npm run start:dev   # Start in watch/development mode
npm run start:prod  # Start in production mode
npm run build       # Build the project
```

## 🤖 AI Usage Disclosure

During the development of this project, AI tools were used as **reference and assistance aids** — similar to how developers use documentation or Stack Overflow. The following tools were consulted:

- **Google Gemini** — for researching NestJS module patterns and Prisma schema syntax
- **Claude (Anthropic)** — for reviewing TypeScript type definitions and debugging
- **GitHub Copilot / AI suggestions** — for code completion in repetitive boilerplate sections

AI assistance was specifically limited to:
- Looking up correct syntax for NestJS decorators (`@UseGuards`, `@ApiBearerAuth`, etc.)
- Referencing Prisma MongoDB migration steps
- Reviewing TypeScript strict typing best practices

All **core logic, architecture decisions, API design, and integration work** were written and understood by the developer. AI was not used to generate the entire project — it was used the same way any developer uses documentation tools.

## 📄 License

MIT
