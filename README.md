# Gemini Chat Wrapper

A feature-rich, production-ready chat interface for Google's Gemini AI with authentication, conversation history, and advanced features.

## ✨ Features

- 🔐 **Authentication** - GitHub & Google OAuth integration via NextAuth.js
- 💬 **Persistent Conversations** - All chats saved to PostgreSQL database
- 🎨 **Beautiful UI** - Modern, responsive design with dark mode
- ⚡ **Streaming Responses** - Real-time streaming from Gemini API
- 📝 **Markdown Support** - Full markdown rendering with syntax highlighting
- 🎯 **Model Selection** - Switch between Gemini 3 Flash and Pro
- 📂 **File Upload** - Support for images, PDFs, and code files
- 🔍 **Conversation Management** - Create, rename, delete conversations
- 📱 **Mobile Responsive** - Works seamlessly on all devices
- 🚀 **Deploy to Vercel** - One-click deployment

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Database**: Vercel Postgres, Drizzle ORM
- **Authentication**: NextAuth.js
- **AI**: Google Gemini API
- **State Management**: Zustand
- **Markdown**: react-markdown, react-syntax-highlighter

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
- (Optional) GitHub/Google OAuth credentials

### Installation

1. **Clone and install dependencies:**

\`\`\`bash
cd gemini-wrapper
npm install
\`\`\`

2. **Set up environment variables:**

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` with your credentials:

\`\`\`env
# Required: Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Required: NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here

# Required: Database (get from Vercel Postgres)
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NO_SSL=your_postgres_url_no_ssl
POSTGRES_USER=your_postgres_user
POSTGRES_HOST=your_postgres_host
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database

# Optional: OAuth Providers
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
\`\`\`

3. **Generate NextAuth secret:**

\`\`\`bash
openssl rand -base64 32
\`\`\`

4. **Set up the database:**

\`\`\`bash
npm run db:push
\`\`\`

5. **Run the development server:**

\`\`\`bash
npm run dev
\`\`\`

6. **Open** [http://localhost:3000](http://localhost:3000) in your browser

## 📦 Deployment to Vercel

### Option 1: Deploy via Vercel CLI

\`\`\`bash
npm i -g vercel
vercel
\`\`\`

### Option 2: Deploy via GitHub (Recommended)

1. **Push to GitHub:**

\`\`\`bash
git init
git add .
git commit -m "Initial commit: Gemini Chat Wrapper"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gemini-wrapper.git
git push -u origin main
\`\`\`

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Add environment variables:**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add all variables from `.env.example`
   - For database, Vercel will auto-provision Postgres

4. **Deploy:**
   - Click "Deploy"
   - Your app will be live in ~2 minutes!

## 🔑 Setting Up OAuth Providers

### GitHub OAuth

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Set:
   - Application name: Gemini Chat
   - Homepage URL: `http://localhost:3000` (or your production URL)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and generate Client Secret
5. Add to `.env.local`

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth client ID
5. Set:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret
7. Add to `.env.local`

## 📚 Project Structure

\`\`\`
gemini-wrapper/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth.js handlers
│   │   ├── chat/         # Chat streaming endpoint
│   │   └── conversations/# Conversation CRUD
│   ├── auth/             # Authentication pages
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   ├── providers.tsx     # Context providers
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── ChatArea.tsx      # Main chat display
│   ├── ChatInput.tsx     # Message input
│   ├── ChatInterface.tsx # Main app component
│   ├── Message.tsx       # Message component
│   ├── ModelSelector.tsx # Model dropdown
│   └── Sidebar.tsx       # Conversation list
├── lib/
│   ├── auth.ts           # Auth utilities
│   ├── db.ts             # Database connection
│   ├── gemini.ts         # Gemini API client
│   ├── schema.ts         # Database schema
│   └── utils.ts          # Utility functions
├── stores/
│   └── chatStore.ts      # Zustand state store
├── public/               # Static files
├── .env.example          # Environment template
├── drizzle.config.ts     # Drizzle config
├── next.config.js        # Next.js config
├── tailwind.config.ts    # Tailwind config
└── tsconfig.json         # TypeScript config
\`\`\`

## 🎯 Key Features Explained

### Streaming Responses

The chat uses Server-Sent Events (SSE) for real-time streaming:

\`\`\`typescript
// API route streams response chunk by chunk
for await (const chunk of streamChat(messages)) {
  yield `data: ${JSON.stringify({ chunk })}\n\n`
}
\`\`\`

### Persistent Conversations

All conversations are stored in PostgreSQL with Drizzle ORM:

\`\`\`typescript
// Schema includes conversations and messages tables
export const conversations = pgTable('conversations', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  model: text('model').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
\`\`\`

### Markdown Rendering

Full markdown support with syntax highlighting:

\`\`\`typescript
<ReactMarkdown
  components={{
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <SyntaxHighlighter language={match[1]} {...props}>
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>{children}</code>
      )
    }
  }}
>
  {message.content}
</ReactMarkdown>
\`\`\`

## 🔒 Security Best Practices

1. **API Key Protection**: Never expose Gemini API key client-side
2. **Authentication**: All API routes require valid session
3. **Input Validation**: Sanitize user inputs on server
4. **Rate Limiting**: Respect Gemini API limits (60 req/min free tier)
5. **CORS**: Configure appropriate headers in production

## 💰 Cost Considerations

### Free Tier Limits

- **Gemini API**: 1,000 requests/day, 60 req/min
- **Vercel**: 100GB bandwidth, unlimited builds
- **Vercel Postgres**: 512MB storage (Hobby plan)

### Paid Tiers (if needed)

- **Gemini Pro**: $0.00125/1K characters
- **Vercel Pro**: $20/month
- **Vercel Postgres**: $0.102/GB storage

## 🐛 Troubleshooting

### Common Issues

1. **Database connection error:**
   - Ensure `POSTGRES_URL` is correctly set
   - Run `npm run db:push` to create tables

2. **Authentication not working:**
   - Check OAuth callback URLs match exactly
   - Verify `NEXTAUTH_SECRET` is set

3. **Gemini API errors:**
   - Confirm `GEMINI_API_KEY` is valid
   - Check API quotas at [Google AI Studio](https://aistudio.google.com)

4. **Streaming not working:**
   - Disable any caching middleware
   - Check browser console for errors

## 📄 License

MIT License - feel free to use this for personal or commercial projects!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) for the powerful AI model
- [Vercel](https://vercel.com) for seamless deployment
- [Next.js](https://nextjs.org) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com) for beautiful styling

---

Built with ❤️ using Next.js, Gemini AI, and Vercel
