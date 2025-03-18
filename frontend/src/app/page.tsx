import ChatInterface from './components/ChatInterface';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="container mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-blue-900">
          Tech Chat Assistant
        </h1>
        <p className="text-center text-gray-600 text-lg mb-8">Your AI companion for technical discussions</p>
        <ChatInterface />
      </div>
    </main>
  );
}
