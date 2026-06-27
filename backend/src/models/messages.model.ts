import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  publicId: String,
  size: {
    type: Number,
    required: true,
  },
  width: Number,
  height: Number,
  duration: Number,

  mimeType: String,
  type: {
    type: String,
    enum: ["image", "video", "audio", "file", "gif", "sticker"],
    required: true,
  },

  thumbnailUrl: {
    type: String,
  },
});

const senderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    avatarUrl: String,
  },
  { _id: false },
);

const messageSchema = new mongoose.Schema(
  {
    channelId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      type: senderSchema,
      required: true,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    reactions: [
      {
        emoji: String,
        userId: String,
      },
    ],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    edited: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["sending", "sent", "delivered", "read"],
      default: "sent",
    },
    editedAt: Date,
    deleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: Date,

    content: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ channelId: 1, createdAt: -1 });

messageSchema.pre("validate", function () {
  const hasText = this.content.trim().length > 0;
  const hasAttachments = this.attachments?.length > 0;

  if (!hasText && !hasAttachments) {
    throw new Error("Message must contain text or an attachment.");
  }
});

export const Message = mongoose.model("Message", messageSchema);
