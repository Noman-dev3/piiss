
'use client';
import { useState, useTransition } from 'react';
import { askAIFAQAssistant } from '@/lib/actions';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Send, Sparkles, AlertCircle, MessageSquare, ChevronDown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Spinner } from './ui/spinner';
import type { FAQ } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface FAQAssistantProps {
    pregeneratedFaqs: FAQ[];
}

export function FAQAssistant({ pregeneratedFaqs }: FAQAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    const userMessage: Message = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setError(null);
    setQuery('');

    startTransition(async () => {
      const result = await askAIFAQAssistant(query);
      if (result.answer) {
        const assistantMessage: Message = { role: 'assistant', content: result.answer };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        setError(result.error || 'An unexpected error occurred.');
      }
    });
  };

  return (
    <Card className="shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Sparkles className="text-accent" />
          AI-Powered Assistant
        </CardTitle>
        <CardDescription>Ask any question about our school, and I'll do my best to answer!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-80 overflow-y-auto p-4 border rounded-md bg-muted/50 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-2" />
                <p>No messages yet.</p>
                <p className="text-sm">Start the conversation by typing your question below.</p>
              </div>
            )}
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
             {isPending && (
                <div className="flex justify-start gap-2">
                    <div className="max-w-xs md:max-w-md p-3 rounded-lg bg-background flex items-center gap-2">
                        <Spinner size="small" />
                        <p className="text-sm text-muted-foreground">Thinking...</p>
                    </div>
                </div>
            )}
            {error && (
               <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., What is the admission deadline?"
              className="flex-grow"
              disabled={isPending}
            />
            <Button type="submit" disabled={isPending}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </CardContent>
      {pregeneratedFaqs.length > 0 && (
          <div className="p-6 pt-0">
             <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faqs">
                     <AccordionTrigger className="text-lg font-medium">
                        <div className="flex items-center gap-2">
                            <span>Or Browse Common Questions</span>
                        </div>
                    </AccordionTrigger>
                     <AccordionContent className="pt-4 space-y-2">
                       {pregeneratedFaqs.map(faq => (
                            <Accordion key={faq.id} type="single" collapsible>
                                <AccordionItem value={faq.id!}>
                                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                       ))}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
          </div>
      )}
    </Card>
  );
}
