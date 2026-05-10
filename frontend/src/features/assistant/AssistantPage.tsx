// import { Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
// import { useState } from 'react';
//
// import { PageHeader } from '@/components/common/PageHeader';
// import styles from '@/styles/page.module.css';
//
// interface AssistantMessage {
//   id: number;
//   role: 'user' | 'assistant';
//   content: string;
// }
//
// export function AssistantPage() {
//   const [messages, setMessages] = useState<AssistantMessage[]>([
//     {
//       id: 1,
//       role: 'assistant',
//       content: 'Hi, I can help explain service requirements, document lists, and what to do next. Ask me anything about GovAssist.AI.',
//     },
//   ]);
//   const [input, setInput] = useState('');
//
//   const handleSend = () => {
//     if (!input.trim()) {
//       return;
//     }
//
//     setMessages((current) => [
//       ...current,
//       { id: current.length + 1, role: 'user', content: input.trim() },
//       {
//         id: current.length + 2,
//         role: 'assistant',
//         content: 'This is a UI-only assistant shell for now. The final backend AI integration can answer service-specific questions here without changing the visual flow.',
//       },
//     ]);
//     setInput('');
//   };
//
//   return (
//     <div className={styles.page}>
//       <PageHeader eyebrow="Assistant" title="AI Assistant" description="Ask for help with requirements, application steps, or service guidance." />
//
//       <Card>
//         <CardContent className={styles.inlineForm}>
//           <div className={styles.placeholder}>
//             <Stack spacing={2.5}>
//               {messages.map((message) => (
//                 <Stack
//                   key={message.id}
//                   className={`${styles.assistantBubble} ${
//                     message.role === 'user' ? styles.assistantBubbleUser : styles.assistantBubbleAssistant
//                   }`}
//                 >
//                   <Typography>{message.content}</Typography>
//                 </Stack>
//               ))}
//             </Stack>
//           </div>
//           <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
//             <TextField
//               fullWidth
//               label="Ask a question"
//               value={input}
//               onChange={(event) => setInput(event.target.value)}
//               placeholder="What documents do I need for passport renewal?"
//             />
//             <Button variant="contained" onClick={handleSend}>
//               Send
//             </Button>
//           </Stack>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import { PageHeader } from '@/components/common/PageHeader';
import styles from '@/styles/page.module.css';

const OLLAMA_URL = 'https://ai.my-ollama-server.org/api/chat';
const OLLAMA_MODEL = 'llama3.1:latest'; // change if your server uses a different model name

const SYSTEM_PROMPT =
    'You are GovAssist AI, a helpful assistant for a government services portal. ' +
    'You help citizens understand administrative service requirements, needed documents, ' +
    'application steps, and general guidance. Be concise, clear, and friendly.';

interface AssistantMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

export function AssistantPage() {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 1,
      role: 'assistant',
      content:
          'Hi! I can help explain service requirements, document lists, and what to do next. Ask me anything about GovAssist.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setError(null);

    const userMsg: AssistantMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
    };

    const assistantMsg: AssistantMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: '',
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setLoading(true);

    // Build history for Ollama (exclude the empty assistant placeholder)
    const history = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    abortRef.current = new AbortController();

    try {
      const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          stream: true,
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response body');

      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Each line is a JSON object
        for (const line of chunk.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const parsed = JSON.parse(trimmed);
            const token: string = parsed?.message?.content ?? '';
            accumulated += token;
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === assistantMsg.id ? { ...m, content: accumulated } : m,
                ),
            );
          } catch {
            // partial JSON line, skip
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      const msg =
          err instanceof Error ? err.message : 'Could not reach the AI server.';
      setError(msg);
      // Remove the empty assistant placeholder
      setMessages((prev) => prev.filter((m) => m.id !== assistantMsg.id));
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  return (
      <div className={styles.page}>
        <PageHeader
            eyebrow="Assistant"
            title="AI Assistant"
            description="Ask for help with requirements, application steps, or service guidance."
        />

        <Card>
          <CardContent className={styles.inlineForm}>
            {/* Chat history */}
            <Box
                className={styles.placeholder}
                sx={{ minHeight: 360, maxHeight: 520, overflowY: 'auto' }}
            >
              <Stack spacing={2.5}>
                {messages.map((message) => (
                    <Stack
                        key={message.id}
                        className={`${styles.assistantBubble} ${
                            message.role === 'user'
                                ? styles.assistantBubbleUser
                                : styles.assistantBubbleAssistant
                        }`}
                    >
                      {message.content ? (
                          <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                            {message.content}
                          </Typography>
                      ) : (
                          <CircularProgress size={16} thickness={5} />
                      )}
                    </Stack>
                ))}
                <div ref={bottomRef} />
              </Stack>
            </Box>

            {/* Error banner */}
            {error && (
                <Typography
                    variant="body2"
                    color="error"
                    sx={{ px: 1 }}
                >
                  ⚠ {error}
                </Typography>
            )}

            {/* Input row */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                  fullWidth
                  label="Ask a question"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What documents do I need for passport renewal?"
                  disabled={loading}
                  multiline
                  maxRows={4}
              />
              {loading ? (
                  <Button
                      variant="outlined"
                      color="error"
                      onClick={handleStop}
                      sx={{ minWidth: 100 }}
                  >
                    Stop
                  </Button>
              ) : (
                  <Button
                      variant="contained"
                      onClick={() => void handleSend()}
                      disabled={!input.trim()}
                      sx={{ minWidth: 100 }}
                  >
                    Send
                  </Button>
              )}
            </Stack>
          </CardContent>
        </Card>
      </div>
  );
}
