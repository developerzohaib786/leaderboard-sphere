"use client";

import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: Date;
}

interface ContextDoc {
  pageContent: string;
  metadata: {
    source: string;
    pdf?: any;
    loc?: any;
  };
  id?: string;
}

interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  context?: ContextDoc[];
}

function ContextItem({ doc, index }: { doc: ContextDoc; index: number }) {
  const [expanded, setExpanded] = React.useState(false);
  const filename = doc.metadata?.source?.split(/[\\/]/).pop() ?? "Unknown source";
  const page = doc.metadata?.loc?.pageNumber ?? doc.metadata?.loc?.lines?.from ?? null;

  return (
    <div className="border border-gray-600 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 hover:bg-gray-750 text-left transition-colors"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="text-blue-400 font-mono text-xs shrink-0">#{index + 1}</span>
          <span className="text-sm text-gray-300 truncate">{filename}</span>
          {page && <span className="text-xs text-gray-500 shrink-0">· p.{page}</span>}
        </span>
        <span className="text-gray-400 text-xs ml-2">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div className="px-3 py-3 bg-gray-900 border-t border-gray-700">
          <p className="text-xs text-gray-400 whitespace-pre-wrap leading-relaxed">{doc.pageContent}</p>
        </div>
      )}
    </div>
  );
}

export default function NotebookPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFileTypes = ".pdf,.doc,.docx,.ppt,.pptx";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5003/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const newDocument: Document = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type,
          uploadedAt: new Date(),
        };
        setDocuments((prev) => [...prev, newDocument]);
      } else {
        alert("Failed to upload file");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    // Add a loading message
    const loadingId = (Date.now() + 1).toString();
    const loadingMessage: Message = {
      id: loadingId,
      content: "Thinking...",
      sender: "assistant",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      const response = await fetch(
        `http://localhost:5003/chat?question=${encodeURIComponent(inputMessage)}`
      );

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      console.log("Chat API Response:", data); 

      // Replace loading message with actual response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? {
                ...msg,
                content: data.message,
                timestamp: new Date(),
                context: data.context || [],
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Chat error:", error);
      // Replace loading message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingId
            ? {
                ...msg,
                content: "Sorry, something went wrong. Please try again.",
                timestamp: new Date(),
              }
            : msg
        )
      );
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("doc")) return "📝";
    if (type.includes("presentation") || type.includes("ppt")) return "📊";
    return "📁";
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-80" : "w-0"
        } transition-all duration-300 bg-gray-800 border-r border-gray-700 flex flex-col overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold mb-4">📚 Documents</h2>

          {/* Upload Button */}
          <label className="block">
            <div
              className={`flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-700 transition-colors ${
                isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept={acceptedFileTypes}
                className="hidden"
                disabled={isUploading}
              />
              <div className="text-center">
                {isUploading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span>Uploading...</span>
                  </div>
                ) : (
                  <>
                    <span className="text-3xl">⬆️</span>
                    <p className="mt-2 text-sm text-gray-400">
                      Upload PDF, Word, PPT
                    </p>
                  </>
                )}
              </div>
            </div>
          </label>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-4">
          {documents.length === 0 ? (
            <p className="text-gray-500 text-center mt-8">
              No documents uploaded yet
            </p>
          ) : (
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  <span className="text-2xl">{getFileIcon(doc.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <p className="text-xs text-gray-400">
                      {doc.uploadedAt.toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-700 p-2 rounded-r-lg hover:bg-gray-600 transition-colors"
        style={{ left: sidebarOpen ? "320px" : "0" }}
      >
        {sidebarOpen ? "◀" : "▶"}
      </button>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <h1 className="text-2xl font-bold">💬 Notebook Chat</h1>
          <p className="text-gray-400 text-sm">
            Ask questions about your documents
          </p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <span className="text-6xl">💭</span>
                <p className="mt-4 text-lg">Start a conversation</p>
                <p className="text-sm">
                  Upload documents and ask questions about them
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] p-4 rounded-2xl ${
                    msg.sender === "user"
                      ? "bg-blue-600 rounded-br-md"
                      : "bg-gray-700 rounded-bl-md"
                  }`}
                >
                  {msg.sender === "assistant" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || "");
                          const isInline = !match && !String(children).includes("\n");
                          return !isInline && match ? (
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              className="rounded-lg text-xs my-2"
                              {...props}
                            >
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code className="bg-gray-900 text-pink-400 px-1 py-0.5 rounded text-xs" {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                  {msg.sender === "assistant" && msg.context && msg.context.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-600">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Context from Vector Database</p>
                      <div className="space-y-2">
                        {msg.context.map((doc, i) => (
                          <ContextItem key={doc.id ?? i} doc={doc} index={i} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 p-4 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              onClick={handleSendMessage}
              className="px-6 py-4 bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              Send ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}