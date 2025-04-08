import { useState, useRef, useEffect } from "react";
import { ChevronDown, Send, MessageCircle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useKairoBotQuery } from "@/api/query-hooks/ai.hooks";
import KairoIcon from "@/assets/icons/KairoIcon";
import { toast } from "@/hooks/use-toast";
import "./Kairo.css"

interface ChatMessage {
  type: "user" | "bot";
  content: string;
}

interface PossibleQuery {
  id: string;
  text: string;
}

const Kairo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { type: "bot", content: "How can I help you today?" },
  ]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatBotRef = useRef<HTMLDivElement>(null);

  const { mutate: sendQuery, isPending: isLoading } = useKairoBotQuery();

  const possibleQueries: PossibleQuery[] = [
    { id: "q1", text: "How many candidates failed this 1st interview" },
    { id: "q2", text: "What's the average employee tenure?" },
    { id: "q3", text: "Show me upcoming birthdays" },
    { id: "q4", text: "How many leave requests are pending?" },
  ];

  const extractQueryResults = (html: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const errorHeading = doc.querySelector("h1");
    if (errorHeading?.textContent?.toLowerCase() === "error") {
      const errorMessage = doc.querySelector("p strong")?.textContent;
      const errorDetails = doc.querySelector("pre code")?.textContent;
      return `Error: ${errorMessage || "Unknown error"}\n${errorDetails || ""}`;
    }

    // Find all h2 elements
    const headings = doc.querySelectorAll("h2");
    let resultsContent = "No results found";

    // Iterate through headings to find the Results section
    headings.forEach((heading) => {
      if (heading.textContent?.toLowerCase().includes("results")) {
        // Get the next sibling element
        const nextElement = heading.nextElementSibling;
        if (nextElement) {
          resultsContent = nextElement.textContent || "No results found";
        }
      }
    });

    return resultsContent;
  };



  const handleSendMessage = async () => {
    if (!currentQuery.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { type: "user", content: currentQuery }]);
    setCurrentQuery("");

    sendQuery(
      { query: currentQuery },
      {
        onSuccess: (response) => {
          // const results = extractQueryResults(response.queryResponse);
          // setMessages((prev) => [...prev, { type: "bot", content: results }]);
          setMessages((prev) => [...prev, { type: "bot", content: response.queryResponse }]);
        },
        onError: (error) => {
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              content:
                "Sorry, I couldn't process your request. Please try again.",
            },
          ]);
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };


  const handleQueryClick = (query: string) => {
    setCurrentQuery(query);
    handleSendMessage();
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatBotRef.current &&
        !chatBotRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const sanitizeHtml = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    
    // Remove problematic elements or add classes
    const tables = doc.querySelectorAll("table");
    tables.forEach(table => {
      table.classList.add("chat-table");
    });
    
    return doc.body.innerHTML;
  };



  return (
    <div className="fixed bottom-12 right-6 z-50" ref={chatBotRef}>
      {isOpen && (
        <div className="bg-[#210D38] rounded-xl shadow-lg mb-4 w-[463px] h-[500px] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 p-1 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center ">
                <KairoIcon />
              </div>
              <div className="text-white font-bold">
                Kairo1{" "}
                <span className="bg-yellow-500 text-xs px-1 rounded text-white">
                  Beta
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-purple-700 rounded-full p-1"
            >
              <ChevronDown size={24} />
            </button>
          </div>

          {/* Message area */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 text-white"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 ${msg.type === "user" ? "text-right " : ""}`}
              >
                <div
                  className={`inline-block p-3 rounded-lg text-sm ${
                    msg.type === "user"
                      ? "bg-purple-600 text-white border-1 border-gray-100"
                      : "bg-purple-800 text-white"
                  }`}
                >
                {msg.type === "user" ? (
                  msg.content
                ) : (
                  <div
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(msg.content) || "" }}
                    className="p-4 chat-content"
                  />
                )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-purple-800 p-3 rounded-lg">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce"></div>
                    <div
                      className="w-2 h-2 rounded-full bg-white animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-white animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Query suggestions */}
          <div className="px-4 py-2">
            <p className="text-gray-200 text-sm mb-2">Possible queries</p>
            <div
              className="flex overflow-x-auto gap-2 pb-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {possibleQueries.map((query) => (
                <button
                  key={query.id}
                  onClick={() => handleQueryClick(query.text)}
                  className="whitespace-nowrap bg-purple-800 hover:bg-purple-700 text-white text-sm rounded-full px-4 py-2 flex-shrink-0"
                >
                  {query.text}
                </button>
              ))}
            </div>
          </div>

          {/* Input area */}
          <div className="p-4">
            <div className="bg-purple-700 border-1 border-gray-100 rounded-[30px] flex items-center px-4 py-2">
              <Input
                type="text"
                value={currentQuery}
                onChange={(e) => setCurrentQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything"
                className="flex-1 bg-transparent border-none shadow-none text-white focus:ring-0 placeholder-gray-100"
              />
              <button
                onClick={handleSendMessage}
                className="ml-2 text-white hover:text-purple-300"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hoverable area */}
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Message icon */}
        {!isOpen && isHovered && (
          <div
            className="absolute -top-14 right-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-3 shadow-lg animate-fade-in cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <MessageCircle className="text-white" size={24} />
          </div>
        )}

        {/* Main button */}
        <button
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="text-white" size={24} />
          ) : (
            <div className=" p-1 items-center justify-center">
              <KairoIcon />
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Kairo;
