import { useState, useEffect, useRef } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatBubble } from "@/components/ChatBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ChatInput } from "@/components/ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/hooks/useChat";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [user, setUser] = useState<any>(null);
  
  // Kita tetap menggunakan scrollRef pada komponen ScrollArea
  const scrollRef = useRef<HTMLDivElement>(null); 
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    conversations,
    currentConversationId,
    messages,
    isLoading,
    createConversation,
    sendMessage,
    deleteConversation,
    selectConversation,
  } = useChat();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // --- 💡 INI PERBAIKAN FINALNYA 💡 ---
  useEffect(() => {
    if (scrollRef.current) {
      // 1. Cari elemen viewport secara spesifik menggunakan querySelector.
      //    Ini jauh lebih bisa diandalkan daripada .children[0]
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLDivElement;

      if (viewport) {
        // 2. Gunakan setTimeout(0) untuk memastikan scroll terjadi 
        //    setelah DOM selesai di-update oleh React
        setTimeout(() => {
          viewport.scrollTop = viewport.scrollHeight;
        }, 0);
      }
    }
  }, [messages, isLoading]); // 3. Kita tambahkan 'isLoading' sebagai dependensi
                           //    agar scroll juga terjadi saat 'TypingIndicator' muncul/hilang.
  // ------------------------------------

  const handleNewChat = async () => {
    const newId = await createConversation();
    if (newId) {
      await selectConversation(newId);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentConversationId) {
      const newId = await createConversation();
      if (newId) {
        await selectConversation(newId);
        setTimeout(() => sendMessage(content), 100);
      }
    } else {
      await sendMessage(content);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Bye bye! 👋",
      description: "Sampai jumpa lagi!",
    });
  };

  if (!user) return null;

  const showWelcome = !currentConversationId || messages.length === 0;

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ChatSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
        theme={theme}
        onToggleTheme={() => setTheme(theme === "light" ? "dark" : "light")}
      />

      <div className="flex-1 flex flex-col" style={{ background: "var(--gradient-bg)" }}>
        <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm flex justify-between items-center">
          <h2 className="font-semibold text-lg">
            {conversations.find((c) => c.id === currentConversationId)?.title || "PejuangBot"}
          </h2>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Pasang scrollRef di sini */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {showWelcome ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md animate-fade-in">
                <div className="text-6xl mb-4">💬</div>
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Haiii 👋
                </h2>
                <p className="text-muted-foreground">
                  Aku PejuangBot — temen ngobrol dan bantu belajarmu. Mau bahas apa hari ini?
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {messages.map((msg) => (
                <ChatBubble key={msg.id || Math.random()} role={msg.role} content={msg.content} />
              ))}
              {isLoading && <TypingIndicator />}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 bg-card/50 backdrop-blur-sm border-t border-border">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSend={handleSendMessage} disabled={isLoading} />
            {showWelcome && (
              <div className="flex gap-2 mt-3 flex-wrap justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSendMessage("Jelasin tentang AI dong!")}
                  className="text-xs rounded-full"
                >
                  ✨ Jelasin tentang AI dong!
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSendMessage("Bantu aku belajar matematika")}
                  className="text-xs rounded-full"
                >
                  📚 Bantu aku belajar matematika
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSendMessage("Kasih motivasi buat hari ini")}
                  className="text-xs rounded-full"
                >
                  💪 Kasih motivasi
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;