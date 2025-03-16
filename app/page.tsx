import { ChatWidget } from './features/chat/ui/chat-widget';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-900 to-black">
      <ChatWidget />
    </main>
  );
}
