import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import { PhoneOff } from "lucide-react";
import "@livekit/components-styles";

interface CallPaneProps {
  videoToken: string;
  onHangup: () => void;
}

export default function CallPane({ videoToken, onHangup }: CallPaneProps) {
  if (!videoToken) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mb-4"></div>
        <p className="text-sm text-gray-400">Connecting to room...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 relative bg-black">
      <LiveKitRoom
        video={true}
        audio={true}
        token={videoToken}
        serverUrl="http://localhost:7880"
        connect={true}
        onDisconnected={onHangup}
        className="w-full h-full"
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>

      <button
        onClick={onHangup}
        className="absolute top-4 right-4 p-3 bg-red-600 hover:bg-red-500 rounded-full transition shadow-lg z-50 text-white"
        title="Leave Call"
      >
        <PhoneOff size={20} />
      </button>
    </div>
  );
}
