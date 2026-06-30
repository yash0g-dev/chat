import {
  LiveKitRoom,
  RoomAudioRenderer,
  ParticipantTile,
  useTracks,
  AudioVisualizer,
  useLocalParticipant,
  StartAudio,
  useTrackToggle,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import {
  PhoneOff,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  ScreenShare,
  ScreenShareOff,
} from "lucide-react";

// ⚠️ REMINDER: Move `import "@livekit/components-styles";` to your layout.tsx / _app.tsx

interface CallPaneProps {
  videoToken: string;
  onHangup: () => void;
}

export default function CallPane({ videoToken, onHangup }: CallPaneProps) {
  if (!videoToken) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-black min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mb-4"></div>
        <p className="text-sm text-gray-400">Connecting to room...</p>
      </div>
    );
  }

  // NOTICE: I completely removed the useLocalParticipant hook from up here!

  return (
    <div className="flex-1 relative bg-[#09090b] flex flex-col min-h-[400px]">
      <LiveKitRoom
        video={true}
        audio={true}
        token={videoToken}
        serverUrl="wss://chat-9xtwm7l1.livekit.cloud"
        connect={true}
        onDisconnected={onHangup}
        className="flex-1 flex flex-col justify-between p-4"
      >
        <CustomVideoGrid />

        {/* The Diagnostic tool is now safely INSIDE the room context */}
        <MicDiagnostic />

        <CustomControlBar onHangup={onHangup} />

        <RoomAudioRenderer />
        <StartAudio
          label="Click to allow audio playback"
          className="absolute top-4 right-4 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg"
        />
      </LiveKitRoom>
    </div>
  );
}

// --- Component 1: Custom Video Grid Layout ---
function CustomVideoGrid() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  return (
    // Force a strict viewport container size so Next.js cannot collapse it to 0px
    <div className="flex-1 w-full h-full min-h-[300px] mb-4 bg-zinc-950 rounded-xl overflow-hidden p-2 border border-white/5 relative">
      {tracks.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
          Waiting for video streams...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full">
          {tracks.map((trackRef) => (
            <ParticipantTile
              key={`${trackRef.participant.identity}_${trackRef.source}`}
              trackRef={trackRef}
              // Force dimensions on the individual items so they fill layout tiles
              className="w-full h-full min-h-[180px] rounded-lg overflow-hidden bg-zinc-900 border border-white/10 shadow-lg relative"
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Custom Controls ---
function CustomControlBar({ onHangup }: { onHangup: () => void }) {
  const { toggle: toggleAudio, enabled: isMicrophoneEnabled } = useTrackToggle({
    source: Track.Source.Microphone,
  });

  const { toggle: toggleVideo, enabled: isCameraEnabled } = useTrackToggle({
    source: Track.Source.Camera,
  });

  const { toggle: toggleScreenShare, enabled: isScreenShareEnabled } =
    useTrackToggle({
      source: Track.Source.ScreenShare,
    });

  return (
    <div className="h-16 bg-zinc-900/80 border border-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center gap-4 px-6 max-w-md mx-auto w-full transition-all shrink-0">
      {/* Mic Action - FIX: Wrap in arrow function */}
      <button
        onClick={() => toggleAudio()}
        className={`p-3 rounded-xl transition ${
          isMicrophoneEnabled
            ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
            : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
        }`}
      >
        {isMicrophoneEnabled ? <Mic size={20} /> : <MicOff size={20} />}
      </button>

      {/* Camera Action - FIX: Wrap in arrow function */}
      <button
        onClick={() => toggleVideo()}
        className={`p-3 rounded-xl transition ${
          isCameraEnabled
            ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
            : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
        }`}
      >
        {isCameraEnabled ? <VideoIcon size={20} /> : <VideoOff size={20} />}
      </button>

      {/* Screen Share Action - FIX: Wrap in arrow function */}
      <button
        onClick={() => toggleScreenShare()}
        className={`p-3 rounded-xl transition ${
          isScreenShareEnabled
            ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
            : "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
        }`}
        title={isScreenShareEnabled ? "Stop Sharing" : "Share Screen"}
      >
        {isScreenShareEnabled ? (
          <ScreenShareOff size={20} />
        ) : (
          <ScreenShare size={20} />
        )}
      </button>

      {/* Separate Leave Action */}
      <button
        onClick={onHangup} // This one is fine as-is!
        className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-xl transition shadow-md ml-4"
        title="Leave Room"
      >
        <PhoneOff size={20} />
      </button>
    </div>
  );
}

// --- Diagnostic Tool (Safely created here, used inside LiveKitRoom) ---
function MicDiagnostic() {
  const { localParticipant } = useLocalParticipant();
  const micTrack = localParticipant?.getTrackPublication(
    Track.Source.Microphone
  );

  if (!micTrack) return null;

  return (
    <div className="h-12 w-full max-w-md mx-auto bg-zinc-900 rounded-lg overflow-hidden mt-4 mb-4">
      <AudioVisualizer trackRef={micTrack} />
    </div>
  );
}
