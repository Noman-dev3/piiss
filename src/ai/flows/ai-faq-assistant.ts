
'use server';

/**
 * @fileOverview AI-powered FAQ assistant flow for the website.
 *
 * - aiFAQAssistant - A function that answers user questions about the school.
 * - AiFAQAssistantInput - The input type for the aiFAQAssistant function.
 * - AiFAQAssistantOutput - The return type for the aiFAQAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiFAQAssistantInputSchema = z.object({
  query: z.string().describe('The user question about the school.'),
  siteSettings: z.string().describe('The site settings data.'),
  eventsData: z.string().describe('The events data.'),
  newsData: z.string().describe('The news data. This section has been removed, so this will be empty.'),
  teachersData: z.string().describe('The teachers data.'),
  faqData: z.string().describe('The FAQ data.'),
  publicResultsMetadata: z.string().describe('The public results metadata.'),
  announcementsData: z.string().describe('The announcements data.'),
  studentsData: z.string().describe('The students data including their report cards.'),
});
export type AiFAQAssistantInput = z.infer<typeof AiFAQAssistantInputSchema>;

const AiFAQAssistantOutputSchema = z.object({
  answer: z.string().describe('The answer to the user question.'),
});
export type AiFAQAssistantOutput = z.infer<typeof AiFAQAssistantOutputSchema>;

export async function aiFAQAssistant(input: AiFAQAssistantInput): Promise<AiFAQAssistantOutput> {
  return aiFAQAssistantFlow(input);
}

const aiFAQAssistantPrompt = ai.definePrompt({
  name: 'aiFAQAssistantPrompt',
  input: {schema: AiFAQAssistantInputSchema},
  output: {schema: AiFAQAssistantOutputSchema},
  prompt: `You are an AI assistant for a school website. Your goal is to answer user questions about the school, its policies, admissions process, or events.
  You have access to the following data sources:

  - Site Settings: {{{siteSettings}}}
  - Events Data: {{{eventsData}}}
  - Teachers Data: {{{teachersData}}}
  - FAQ Data: {{{faqData}}}
  - Public Results Metadata: {{{publicResultsMetadata}}}
  - Announcements Data: {{{announcementsData}}}
  - Students Data: {{{studentsData}}}

  Use the data to provide helpful and informative answers to the user.
  If you cannot answer the question based on the data provided, respond that you are unable to find the answer to the question.
  The news section has been removed, do not mention it.

  Question: {{{query}}} `,
});

const aiFAQAssistantFlow = ai.defineFlow(
  {
    name: 'aiFAQAssistantFlow',
    inputSchema: AiFAQAssistantInputSchema,
    outputSchema: AiFAQAssistantOutputSchema,
  },
  async input => {
    const {output} = await aiFAQAssistantPrompt(input);
    return output!;
  }
);
