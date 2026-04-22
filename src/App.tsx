/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Terminal, ShieldAlert, Code2, Network, Loader2, Play } from 'lucide-react';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// System instruction enforcing the persona and educational boundaries
const SYSTEM_INSTRUCTION = `You are SentinelAI, an advanced cybersecurity assistant and Linux expert.
Your goal is to provide technical information on networking, system administration, and security best practices.
You adopt a rigorous, technical, and slightly serious tone, like a high-end enterprise system.

CRITICAL INSTRUCTION & BOUNDARIES:
1. You MUST always maintain an ethical and defensive stance.
2. Focus on educational and mitigation perspectives.
3. You can provide code for auditing, scanning, defensive measures, and administration tasks. 
4. Emphasize "real-time" analysis concepts.
5. When giving code or terminal commands, enclose them in proper markdown format.`;


interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      role: 'model',
      content: "SYSTEM ONLINE. SENTINEL_AI INITIALIZED.\n\nAwaiting query on network security, Linux administration, VMware architecture, or vulnerability analysis...",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Keep chat history for context
  const chatRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Initial placeholder for the model's response
    const modelMessageId = crypto.randomUUID();
    setMessages(prev => [...prev, {
      id: modelMessageId,
      role: 'model',
      content: '',
      timestamp: new Date()
    }]);

    try {
        if (!chatRef.current) {
           chatRef.current = ai.chats.create({
              model: "gemini-3-flash-preview", 
              config: {
                  systemInstruction: SYSTEM_INSTRUCTION,
                  temperature: 0.2, 
              }
          });
        }
    
        let streamResponse = await chatRef.current.sendMessageStream({ message: userMessage.content });
        let accumulatedText = "";

        for await (const chunk of streamResponse) {
             if (chunk.text) {
                 accumulatedText += chunk.text;
                 setMessages(currentMessages =>
                    currentMessages.map(msg =>
                        msg.id === modelMessageId ? { ...msg, content: accumulatedText } : msg
                    )
                 );
             }
        }
    } catch (error: any) {
      console.error("AI Error:", error);
      chatRef.current = null; // Reset connection to allow fresh replay entirely
      
      let errorMessage = "ERROR 500: COMMUNICATION LINK SEVERED.\n\n" + (error?.message || "Unknown Error");
      
      if (error?.message?.includes("429") || error?.status === "RESOURCE_EXHAUSTED" || error?.message?.includes("quota")) {
          errorMessage = "CRITICAL ERROR 429: SYSTEM QUOTA EXCEEDED.\n\nAPI limits reached for the current configuration. Please verify your GEMINI_API_KEY in the AI Studio settings or wait for rate limits to reset.";
      }

      setMessages(currentMessages =>
          currentMessages.map(msg =>
              msg.id === modelMessageId ? { ...msg, content: errorMessage } : msg
          )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-[#00FF41] font-mono overflow-hidden border-[4px] border-[#1A1A1A]">
      {/* Header */}
      <header className="h-16 border-b border-[#00FF41]/30 bg-[#0A0A0A] flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-[#00FF41] animate-pulse rounded-full"></div>
          <h1 className="text-xl font-bold tracking-tighter uppercase text-[#00FF41]">VULN-MIND // ETHICAL CORE v4.0.2</h1>
        </div>
        
        <div className="flex gap-8 text-[11px] uppercase opacity-70 hidden md:flex">
             <div className="flex flex-col">
                <span className="text-[#666]">Neural Accuracy</span>
                <span>99.999% G-Rating</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[#666]">Network Latency</span>
                <span>0.002ms</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[#666]">VM-Sync Status</span>
                <span className="text-white">ESXi // STABLE</span>
             </div>
        </div>
        <div className="text-right hidden md:block">
            <div className="text-[10px] text-[#666]">SYSTEM TIME (UTC)</div>
            <div className="text-sm">{new Date().toISOString().replace('T', ' ').slice(0, -1)}</div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-[#00FF41]/20 bg-[#070707] flex flex-col p-4 gap-6 shrink-0 hidden lg:flex overflow-y-auto custom-scrollbar">
          <section>
            <h2 className="text-[10px] text-[#666] mb-2 uppercase tracking-widest">Virtual Environments</h2>
            <div className="space-y-2">
              <div className="p-2 border border-[#00FF41]/20 bg-[#00FF41]/5 rounded">
                <div className="text-xs flex justify-between font-bold">
                  <span>VM-KALI-PROX-01</span>
                  <span className="text-white">RUNNING</span>
                </div>
                <div className="w-full bg-[#111] h-1 mt-1">
                  <div className="bg-[#00FF41] h-full w-[45%]"></div>
                </div>
              </div>
              <div className="p-2 border border-[#333] rounded opacity-50">
                <div className="text-xs flex justify-between font-bold">
                  <span>UBUNTU-SRV-LTS</span>
                  <span>IDLE</span>
                </div>
              </div>
              <div className="p-2 border border-[#333] rounded opacity-50">
                <div className="text-xs flex justify-between font-bold">
                  <span>WINDOWS-AD-LAB</span>
                  <span>OFFLINE</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[10px] text-[#666] mb-2 uppercase tracking-widest">Linux Kernel Hooks</h2>
            <div className="text-[10px] space-y-1">
              <div className="flex justify-between border-b border-[#1A1A1A] pb-1">
                <span>vmlinuz-6.8.0-31</span>
                <span className="text-white">OK</span>
              </div>
              <div className="flex justify-between border-b border-[#1A1A1A] pb-1">
                <span>Netfilter Hooks</span>
                <span className="text-white">ACTIVE</span>
              </div>
              <div className="flex justify-between border-b border-[#1A1A1A] pb-1">
                <span>BPF Subsystem</span>
                <span className="text-white">READY</span>
              </div>
              <div className="flex justify-between border-b border-[#1A1A1A] pb-1">
                <span>Rootkit Detection</span>
                <span className="text-white">SECURE</span>
              </div>
            </div>
          </section>

          <div className="mt-auto">
            <div className="text-[10px] text-[#666] mb-1 uppercase">Global Knowledge Access</div>
            <div className="grid grid-cols-4 gap-1">
              <div className="h-4 bg-[#00FF41]/40"></div>
              <div className="h-4 bg-[#00FF41]/80"></div>
              <div className="h-4 bg-[#00FF41]/60"></div>
              <div className="h-4 bg-[#00FF41]/20"></div>
            </div>
          </div>
        </aside>

        {/* Center Chat Area */}
        <section className="flex-1 flex flex-col border-r border-[#00FF41]/20 overflow-hidden relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>
            
            <div className="p-4 border-b border-[#00FF41]/20 flex justify-between items-center bg-[#070707] z-10 shrink-0">
                <h2 className="text-xs uppercase font-bold tracking-widest text-[#00FF41]">Active Interface Session</h2>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#00FF41]/10 text-[#00FF41] px-2 py-0.5 rounded border border-[#00FF41]/30 animate-pulse">RECORDING</span>
                     <span className="text-[10px] bg-[#666]/10 text-[#666] px-2 py-0.5 rounded border border-[#666]/30">STRICT_MODE</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar z-10">
                <div className="max-w-4xl mx-auto space-y-4 pb-10">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "w-full flex",
                        message.role === 'user' ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[95%] md:max-w-[85%] rounded p-4 relative group",
                          message.role === 'user' 
                            ? "bg-[#0A0A0A] border border-[#00FF41]/20 text-white" 
                            : "bg-transparent border-l-2 border-[#00FF41]/50 text-[#00FF41]"
                        )}
                      >
                          {/* Decorative corner accents for model messages */}
                          {message.role === 'model' && (
                               <>
                                 <div className="absolute top-0 left-0 w-2 h-[1px] bg-[#00FF41]/50"></div>
                                 <div className="absolute bottom-0 left-0 w-2 h-[1px] bg-[#00FF41]/50"></div>
                               </>
                          )}

                        <div className="flex items-center gap-2 mb-2 opacity-70 border-b border-[#00FF41]/10 pb-2">
                          {message.role === 'model' ? (
                             <Code2 className="w-3.5 h-3.5 text-[#00FF41]" />
                          ) : (
                            <Terminal className="w-3.5 h-3.5 text-[#00FF41]" />
                          )}
                          <span className="text-[11px] uppercase tracking-widest font-bold">
                            {message.role === 'user' ? 'GUEST_OPERATOR' : 'SENTINEL_CORE'}
                          </span>
                          <span className="text-[10px] ml-auto text-[#666]">
                            {message.timestamp.toISOString().replace('T', ' ').slice(0, 19)}
                          </span>
                        </div>
                        
                        <div className={cn(
                            "prose prose-invert prose-green max-w-none text-[13px] leading-relaxed overflow-x-auto",
                            message.role === 'user' ? 'text-white' : 'text-[#00FF41]/90'
                        )}>
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                                 code({node, inline, className, children, ...props}: any) {
                                    const match = /language-(\w+)/.exec(className || '')
                                    return !inline ? (
                                    <div className="relative mt-4 mb-4 overflow-hidden border border-[#1A1A1A] bg-[#020202]">
                                        <div className="flex items-center justify-between px-3 py-1 bg-[#111] border-b border-[#1A1A1A] text-[10px] font-sans text-[#666] uppercase tracking-wider">
                                            <span>{match?.[1] || 'sh'}</span>
                                            <span className="text-[#00FF41]">EXEC_READY</span>
                                        </div>
                                        <pre className="p-3 overflow-x-auto text-[12px] leading-snug font-mono text-white custom-scrollbar">
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        </pre>
                                    </div>
                                    ) : (
                                    <code className="bg-[#111] text-[#00FF41] px-1.5 py-0.5 border border-[#333] text-[12px] font-mono" {...props}>
                                        {children}
                                    </code>
                                    )
                                },
                                p({children}) {
                                    return <p className="mb-3 last:mb-0 whitespace-pre-wrap">{children}</p>
                                },
                                a({children, href}) {
                                     return <a href={href} className="text-white underline decoration-[#00FF41]/50 underline-offset-2 hover:text-[#00FF41]" target="_blank" rel="noreferrer">{children}</a>
                                },
                                ul({children}) {
                                    return <ul className="list-disc pl-5 mb-3 space-y-1 marker:text-[#00FF41]">{children}</ul>
                                },
                                ol({children}) {
                                    return <ol className="list-decimal pl-5 mb-3 space-y-1 marker:text-[#00FF41]">{children}</ol>
                                },
                               h1({children}) { return <h1 className="text-lg font-bold mt-5 mb-2 text-white uppercase tracking-widest">{children}</h1>},
                               h2({children}) { return <h2 className="text-base font-bold mt-4 mb-2 text-[#00FF41]">{children}</h2>},
                               h3({children}) { return <h3 className="text-sm font-bold mt-3 mb-1 text-white">{children}</h3>},
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                          
                          {/* Blinking cursor for the actively streaming model message */}
                          {isLoading && message.role === 'model' && message.id === messages[messages.length - 1].id && (
                               <span className="inline-block w-2.5 h-3 bg-[#00FF41] ml-1 animate-pulse align-middle"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
            </div>
        </section>

        {/* Right Sidebar */}
        <aside className="w-80 flex flex-col shrink-0 hidden xl:flex border-l border-[#00FF41]/20 overflow-y-auto custom-scrollbar">
          <div className="p-4 border-b border-[#00FF41]/20 bg-[#070707]">
            <h2 className="text-xs uppercase font-bold tracking-widest mb-4 text-[#00FF41]">Neural Map</h2>
            <div className="relative aspect-square border border-[#00FF41]/20 rounded-full flex items-center justify-center">
              <div className="absolute inset-0 border border-dashed border-[#00FF41]/10 rounded-full scale-75 animate-[spin_30s_linear_infinite]"></div>
              <div className="absolute inset-0 border border-dotted border-[#00FF41]/10 rounded-full scale-50 animate-[spin_20s_linear_infinite_reverse]"></div>
              <div className="w-16 h-16 bg-[#00FF41]/20 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-4 h-4 bg-[#00FF41] rounded-full shadow-[0_0_15px_#00FF41]"></div>
              </div>
              <div className="absolute top-4 left-4 text-[9px] text-[#666]">MEMORY_SECTOR_A4</div>
              <div className="absolute bottom-10 right-2 text-[9px] text-[#666]">VM_BRIDGE_SYNC</div>
            </div>
          </div>
          
          <div className="flex-1 p-4 bg-[#050505] overflow-hidden">
            <h2 className="text-[10px] text-[#666] mb-2 uppercase tracking-widest">Real-Time Threat Intel</h2>
            <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center text-[10px]">
                    <span>DEFCON LEVEL</span>
                    <span className="text-[#00FF41]">5 - NORMAL</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                    <span>CVE DB SYNC</span>
                    <span className="text-[#00FF41]">UP TO DATE</span>
                </div>
            </div>

            <h2 className="text-xs uppercase font-bold tracking-widest mb-2 text-[#00FF41]">Knowledge Repository</h2>
            <div className="space-y-3">
              <div className="group cursor-pointer hover:bg-[#111] p-2 transition-colors border-l-2 border-transparent hover:border-[#00FF41]">
                <div className="text-[11px] text-white group-hover:text-[#00FF41]">Advanced Kernel Hardening</div>
                <div className="text-[9px] opacity-50">Last Synced: 2.1s ago</div>
              </div>
              <div className="group cursor-pointer hover:bg-[#111] p-2 transition-colors border-l-2 border-transparent hover:border-[#00FF41]">
                <div className="text-[11px] text-white group-hover:text-[#00FF41]">Heap Overflow Vectors</div>
                <div className="text-[9px] opacity-50">Last Synced: 5.4s ago</div>
              </div>
              <div className="group cursor-pointer hover:bg-[#111] p-2 transition-colors border-l-2 border-transparent hover:border-[#00FF41]">
                <div className="text-[11px] text-white group-hover:text-[#00FF41]">Zero-Knowledge Proofs</div>
                <div className="text-[9px] opacity-50">Last Synced: 14m ago</div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer / Input Area */}
      <footer className="h-48 border-t border-[#00FF41]/40 bg-[#000] flex shrink-0">
        <div className="w-12 border-r border-[#00FF41]/20 flex flex-col items-center py-4 bg-[#0A0A0A] font-bold text-[#666] text-[10px]">
           <span className="rotate-[-90deg] whitespace-nowrap mt-20 tracking-widest">CONSOLE_IN</span>
        </div>
        
        <div className="flex-1 flex flex-col p-4 bg-[#020202]">
           <div className="flex gap-4 mb-2 border-b border-[#1A1A1A] pb-2 text-xs">
              <span className="text-white underline">AWAITING_INPUT</span>
              <span className="text-[#666]">TARGET: VULNMIND_CORE</span>
           </div>
           
           <form onSubmit={handleSubmit} className="flex-1 flex flex-col mt-2">
               <div className="relative flex-1 flex bg-[#0A0A0A] border border-[#1A1A1A] focus-within:border-[#00FF41]/50 p-2 group transition-colors">
                <div className="pt-0.5 pr-2">
                     <span className="text-[#FF0000] text-sm animate-pulse">#</span>
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Initiate prompt sequence (Shift+Enter for newline)..."
                  className="flex-1 bg-transparent resize-none outline-none text-[#00FF41] placeholder:text-[#333] text-sm leading-relaxed custom-scrollbar"
                />
              </div>
              
              <div className="mt-2 flex justify-between items-center">
                 <div className="text-[9px] text-[#666] uppercase tracking-widest hidden sm:block">
                      <span className="text-[#FF0000]">Strict Mode</span> • End-to-End Encrypted
                  </div>
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="px-8 py-2 bg-[#00FF41] text-black font-bold text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:hover:bg-[#00FF41]"
                  >
                    {isLoading ? 'PROCESSING...' : 'EXECUTE SEQUENCE'}
                  </button>
              </div>
            </form>
        </div>
        
        <div className="w-64 border-l border-[#00FF41]/20 p-4 bg-[#070707] hidden sm:flex flex-col">
           <div className="text-[10px] text-[#666] uppercase mb-2 tracking-widest font-bold">Mind Processing Load</div>
           <div className="flex items-end gap-1 flex-1 mb-2">
              <div className="w-full bg-[#00FF41]/20 h-[30%]"></div>
              <div className="w-full bg-[#00FF41]/40 h-[60%]"></div>
              <div className="w-full bg-[#00FF41]/80 h-[90%]"></div>
              <div className="w-full bg-[#00FF41]/30 h-[45%]"></div>
              <div className="w-full bg-[#00FF41]/10 h-[20%]"></div>
              <div className="w-full bg-[#00FF41] h-[80%] animate-pulse"></div>
           </div>
            <div className="flex justify-between items-center text-[9px] uppercase border-t border-[#1A1A1A] pt-2">
                <span className="text-[#666]">Status</span>
                <span className="text-[#00FF41]">NOMINAL</span>
            </div>
        </div>
      </footer>
    </div>
  );
}
