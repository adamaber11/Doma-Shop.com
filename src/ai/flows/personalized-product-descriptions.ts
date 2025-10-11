'use server';

/**
 * @fileOverview Generates a personalized product description based on user input.
 *
 * - generatePersonalizedProductDescription - A function that generates a personalized product description.
 * - PersonalizedProductDescriptionInput - The input type for the generatePersonalizedProductDescription function.
 * - PersonalizedProductDescriptionOutput - The return type for the generatePersonalizedProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productDetails: z.string().describe('The full description of the product.'),
  userInput: z.string().describe('The user prompt requesting a personalized description.'),
});
export type PersonalizedProductDescriptionInput = z.infer<typeof PersonalizedProductDescriptionInputSchema>;

const PersonalizedProductDescriptionOutputSchema = z.object({
  personalizedDescription: z.string().describe('The personalized product description.'),
});
export type PersonalizedProductDescriptionOutput = z.infer<typeof PersonalizedProductDescriptionOutputSchema>;

export async function generatePersonalizedProductDescription(
  input: PersonalizedProductDescriptionInput
): Promise<PersonalizedProductDescriptionOutput> {
  return personalizedProductDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedProductDescriptionPrompt',
  input: {schema: PersonalizedProductDescriptionInputSchema},
  output: {schema: PersonalizedProductDescriptionOutputSchema},
  prompt: `You are an expert at creating personalized product descriptions.  You will receive the full description of the product, as well as the name of the product.  The user will also provide you with a prompt that tells you exactly what they are looking for in the description.

Product Name: {{{productName}}}
Product Details: {{{productDetails}}}
User Input: {{{userInput}}}

Create a personalized product description that incorporates the product name and details, addressing the specific request in the user input. The personalized description should be concise and tailored to the user's needs.`,
});

const personalizedProductDescriptionFlow = ai.defineFlow(
  {
    name: 'personalizedProductDescriptionFlow',
    inputSchema: PersonalizedProductDescriptionInputSchema,
    outputSchema: PersonalizedProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
