export const getChatTitle = (chat: any, currentUserId?: string) => {
  if (chat.isGroup && chat.name) {
    return chat.name;
  }
  const otherMember = chat.members?.find((m: any) => m.user.id !== currentUserId);
  return otherMember ? otherMember.user.username : "Unknown Chat";
};
