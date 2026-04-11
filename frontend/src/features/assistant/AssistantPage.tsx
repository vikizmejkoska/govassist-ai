import { Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

import { PageHeader } from '@/components/common/PageHeader';
import styles from '@/styles/page.module.css';

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
      content: 'Hi, I can help explain service requirements, document lists, and what to do next. Ask me anything about GovAssist.AI.',
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) {
      return;
    }

    setMessages((current) => [
      ...current,
      { id: current.length + 1, role: 'user', content: input.trim() },
      {
        id: current.length + 2,
        role: 'assistant',
        content: 'This is a UI-only assistant shell for now. The final backend AI integration can answer service-specific questions here without changing the visual flow.',
      },
    ]);
    setInput('');
  };

  return (
    <div className={styles.page}>
      <PageHeader eyebrow="Assistant" title="AI Assistant" description="Ask for help with requirements, application steps, or service guidance." />

      <Card>
        <CardContent className={styles.inlineForm}>
          <div className={styles.placeholder}>
            <Stack spacing={2.5}>
              {messages.map((message) => (
                <Stack
                  key={message.id}
                  className={`${styles.assistantBubble} ${
                    message.role === 'user' ? styles.assistantBubbleUser : styles.assistantBubbleAssistant
                  }`}
                >
                  <Typography>{message.content}</Typography>
                </Stack>
              ))}
            </Stack>
          </div>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Ask a question"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="What documents do I need for passport renewal?"
            />
            <Button variant="contained" onClick={handleSend}>
              Send
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
}
