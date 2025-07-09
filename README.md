# React Chatbot App

A modern chatbot application built with React 18, TypeScript, and Tailwind CSS.

## Features

- 🔐 Authentication with persistent login state
- 💬 Real-time chat interface
- 🌓 Dark/Light mode toggle
- 📱 Responsive design
- 🔄 Chat history management
- ⚡ Fast and modern UI with Tailwind CSS

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Routing**: React Router DOM v6
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Installation & Setup

1. **Install dependencies**:
   ```bash
   npm i
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## Usage

### Login
- Navigate to `/login`
- Use the default credentials:
  - **Email**: `admin@gmail.com`
  - **Password**: `123456`

### Chat Interface
- After login, you'll be redirected to `/chat`
- Click "New chat" to start a new conversation
- Type your message and press Enter to send
- Use Shift+Enter for new lines
- Toggle between dark/light mode using the sidebar toggle

## Project Structure

```
src/
  components/
    AuthGuard.tsx      # Route protection component
    ChatMessage.tsx    # Individual chat message component
    Sidebar.tsx        # Chat sidebar with navigation
  pages/
    Login.tsx          # Login page
    Chat.tsx           # Main chat interface
  store/
    authStore.ts       # Authentication state management
    chatStore.ts       # Chat state management
  App.tsx              # Main app component
  main.tsx            # Entry point
```

## Key Features

### Authentication
- Persistent login state using localStorage
- Route protection with AuthGuard component
- Simple credential validation

### Chat System
- Multiple chat sessions
- Message history
- Real-time message sending
- Auto-scroll to latest messages
- Mock API integration (ready for real backend)

### UI/UX
- Modern design matching the provided screenshot
- Responsive layout
- Dark/light mode support
- Smooth animations and transitions
- Keyboard shortcuts (Enter to send, Shift+Enter for newline)

## Environment Variables

The app uses a mock API endpoint. To connect to a real backend, update the API URL in `src/store/chatStore.ts`:

```typescript
const response = await axios.post('YOUR_API_ENDPOINT', {
  message: message,
  chatId: chatId
})
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.