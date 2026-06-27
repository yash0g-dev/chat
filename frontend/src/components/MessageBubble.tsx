import { FileText, Download } from "lucide-react";

interface MessageBubbleProps {
  msg: any;
  isMe: boolean;
  senderAvatar?: string | null;
  isGroup: boolean;
  renderMessageStatus: (status: string) => React.ReactNode;
}

export default function MessageBubble({
  msg,
  isMe,
  senderAvatar,
  isGroup,
  renderMessageStatus,
}: MessageBubbleProps) {
  // Use the actual DB status, or fallback to 'sending' if it's new
  const msgStatus = msg.status || "sending";

  return (
    <div
      className={`flex w-full gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}
    >
      {/* Avatar for incoming messages */}
      {!isMe && (
        <div className="shrink-0 self-end mb-1">
          {senderAvatar ? (
            <img
              src={senderAvatar}
              alt={msg.sender?.username}
              className="h-7 w-7 rounded-full object-cover border border-gray-800"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white uppercase border border-gray-800">
              {msg.sender?.username?.charAt(0) || "U"}
            </div>
          )}
        </div>
      )}

      <div
        className={`max-w-[75%] rounded-2xl px-5 py-3 text-sm transition-all shadow-sm ${
          isMe
            ? "bg-gradient-to-br from-blue-500 to-violet-600/20 text-white rounded-tr-none font-medium"
            : "bg-gray-800/90 border border-gray-700/50 text-gray-100 rounded-tl-none"
        }`}
      >
        {!isMe && isGroup && (
          <p className="text-xs font-bold text-indigo-400 mb-1 tracking-wide">
            @{msg.sender?.username}
          </p>
        )}

        {/* --- ATTACHMENTS RENDERER --- */}
        {msg.attachments && msg.attachments.length > 0 && (
          <div className="flex flex-col gap-2 mb-2">
            {msg.attachments.map((att: any, index: number) => {
              if (att.type === "image" || att.type === "gif") {
                return (
                  <img
                    key={index}
                    src={att.url}
                    alt={att.fileName}
                    className="max-w-full rounded-lg max-h-64 object-contain border border-white/10"
                  />
                );
              }
              if (att.type === "video") {
                return (
                  <video
                    key={index}
                    src={att.url}
                    controls
                    className="max-w-full rounded-lg max-h-64 border border-white/10"
                  />
                );
              }
              // Generic File Render (Audio, Documents, etc.)
              return (
                <a
                  key={index}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    isMe
                      ? "bg-white/10 border-white/20 hover:bg-white/20"
                      : "bg-gray-900/50 border-gray-700"
                  } transition-colors`}
                >
                  <FileText
                    size={24}
                    className={isMe ? "text-white" : "text-blue-400"}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {att.fileName}
                    </p>
                    <p className="text-[10px] opacity-70">
                      {(att.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Download size={16} />
                </a>
              );
            })}
          </div>
        )}

        {/* --- TEXT CONTENT --- */}
        {msg.content && (
          <p className="leading-relaxed break-words">{msg.content}</p>
        )}

        {/* --- TIMESTAMP & STATUS --- */}
        <div
          className={`flex items-center justify-end gap-1.5 mt-1.5 ${isMe ? "text-emerald-200" : "text-gray-400"}`}
        >
          {msg.createdAt && (
            <span className="block text-[10px] font-mono select-none">
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          {/* Status ticks are only rendered on messages I sent */}
          {isMe && renderMessageStatus(msgStatus)}
        </div>
      </div>
    </div>
  );
}
