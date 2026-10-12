
import { createContext, useContext, useState, useEffect } from "react";
import ChatButton from "./ChatButton";
import ChatWidget from "./ChatWidget";

interface ChatContextType {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
}

const ChatContext = createContext<ChatContextType>({
  isOpen: false,
  openChat: () => {},
  closeChat: () => {},
  toggleChat: () => {},
});

/**
 * Hook to read/control the global chat widget state from anywhere inside
 * the app (requires a <ChatProvider> ancestor in the tree).
 */
export const useChat = () => useContext(ChatContext);

/**
 * ChatProvider: owns the global open/closed state of the DenisBot chat
 * widget and renders the floating ChatButton + ChatWidget alongside its
 * children. A one-shot 30s timer bumps `unreadCount` (the red badge on the
 * button) once per provider lifetime if the visitor still hasn't opened the
 * chat; opening the chat clears the badge. The 30s timer is re-armed on
 * every open/close toggle (cleaned up by the effect each time), so the badge
 * nudges again 30s after each close while the visitor stays away — it never
 * fires while the widget is open.
 */
export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);
  const toggleChat = () => setIsOpen(prev => !prev);

  // Clear unread count when chat is opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  // Simulate incoming message after 30 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [isOpen]);

  return (
    <ChatContext.Provider value={{ isOpen, openChat, closeChat, toggleChat }}>
      {children}
      <ChatButton 
        onClick={toggleChat} 
        isOpen={isOpen}
        unreadCount={unreadCount}
      />
      <ChatWidget 
        isOpen={isOpen}
        onClose={closeChat}
      />
    </ChatContext.Provider>
  );
};
