import mongoose from "mongoose";

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

    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ channelId: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);
