
'use server';
/**
 * @fileOverview AI-powered smart search flow for the website.
 *
 * - smartSearch - A function that performs a smart search based on user query.
 * - SmartSearchInput - The input type for the smartSearch function.
 * - SmartSearchOutput - The return type for the smartSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartSearchInputSchema = z.object({
  query: z.string().describe('The search query entered by the user.'),
  siteSettings: z.string().describe('The data of site settings.'),
  eventsData: z.string().describe('The data of events.'),
  newsData: z.string().describe('The data of news. This section has been removed, so this data will be empty.'),
  teachersData: z.string().describe('The data of teachers.'),
  faqData: z.string().describe('The data of FAQs.'),
  publicResultsMetadata: z.string().describe('The data of public results metadata.'),
  announcementsData: z.string().describe('The data of announcements.'),
  studentsData: z.string().describe('The data of students, including their report cards.'),
});
export type SmartSearchInput = z.infer<typeof SmartSearchInputSchema>;

const SmartSearchOutputSchema = z.object({
  results: z.string().describe('The search results based on the query.'),
});
export type SmartSearchOutput = z.infer<typeof SmartSearchOutputSchema>;

export async function smartSearch(input: SmartSearchInput): Promise<SmartSearchOutput> {
  return smartSearchFlow(input);
}

const smartSearchPrompt = ai.definePrompt({
  name: 'smartSearchPrompt',
  input: {schema: SmartSearchInputSchema},
  output: {schema: SmartSearchOutputSchema},
  prompt: `You are an AI-powered search assistant for a school website.
Your goal is to provide relevant search results based on the user's query using both semantic and keyword search.
You have access to the following data sources:

- Site Settings: {{{siteSettings}}}
- Events: {{{eventsData}}}
- Teachers: {{{teachersData}}}
- FAQ: {{{faqData}}}
- Public Results Metadata: {{{publicResultsMetadata}}}
- Announcements: {{{announcementsData}}}
- Students Data (including grades): {{{studentsData}}}

Use the data to provide the most relevant search results to the user, considering both the meaning of the query and specific keywords.
If the user asks about a specific student's grades, provide the grades from the 'studentsData'.
If the query is not relevant to the data provided, respond that you are unable to find results for the query.
The news section has been removed, do not mention it.

Query: {{{query}}}`,
});

const smartSearchFlow = ai.defineFlow(
  {
    name: 'smartSearchFlow',
    inputSchema: SmartSearchInputSchema,
    outputSchema: SmartSearchOutputSchema,
  },
  async input => {
    const {output} = await smartSearchPrompt(input);
    return output!;
  }
);
