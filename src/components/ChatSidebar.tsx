import { Plus, MessageSquare, Trash2, Moon, Sun, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns"; // <-- PERUBAHAN 1: Tambahkan import ini

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export const ChatSidebar = ({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  theme,
  onToggleTheme,
}: ChatSidebarProps) => {
  return (
    <div className="w-64 h-screen bg-sidebar-background border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
          PejuangBot 💬
        </h1>
        <Button
          onClick={onNewChat}
          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
        >
          <Plus className="mr-2 h-4 w-4" />
          Chat Baru
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-sidebar-accent transition-colors",
                currentConversationId === conv.id && "bg-sidebar-accent",
              )}
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <MessageSquare className="h-4 w-4 flex-shrink-0 text-sidebar-primary" />
                
                {/* --- 💡 PERUBAHAN 2: Ganti 'conv.title' dengan format tanggal 💡 --- */}
                <span className="text-sm truncate">
                  {format(new Date(conv.updated_at), "yyyy-MM-dd HH:mm:ss")}
                </span>
                {/* --------------------------------------------------------------- */}

              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleTheme}
          className="w-full"
        >
          {theme === "light" ? (
            <>
              <Moon className="mr-2 h-4 w-4" />
              Mode Gelap
            </>
          ) : (
            <>
              <Sun className="mr-2 h-4 w-4" />
              Mode Terang
            </>
          )}
        </Button>
      </div>

      <div className="pb-4 pt-0 px-4 text-xs text-muted-foreground">
        <p className="font-semibold mb-2 text-center">Dibuat oleh:</p>
        <ul className="space-y-1.5">
          {/* Ganti "#" dengan URL Instagram yang benar */}
          <li className="flex items-center justify-between">
            <span>Fadila Safitri</span>
            <a
              href="https://www.instagram.com/dilaaaftrii16" // <-- GANTI URL IG DI SINI
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sidebar-primary transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </li>
          <li className="flex items-center justify-between">
            <span>Hilya Atira Salsabila</span>
            <a
              href="https://www.instagram.com/hilyatiraa" // <-- GANTI URL IG DI SINI
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sidebar-primary transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </li>
          <li className="flex items-center justify-between">
            <span>Neni Sahira</span>
            <a
              href="https://www.instagram.com/nii_sahira" // <-- GANTI URL IG DI SINI
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sidebar-primary transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </li>
          <li className="flex items-center justify-between">
            <span>Tasya Nur Elisa</span>
            <a
              href="https://www.instagram.com/nrelisasyaa" // <-- GANTI URL IG DI SINI
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sidebar-primary transition-colors"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};