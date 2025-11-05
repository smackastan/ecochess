import { GameProvider } from '@/contexts/GameContext';
import ChessGame from '@/components/ChessGame';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <GameProvider>
        <ChessGame />
      </GameProvider>
    </div>
  );
}
