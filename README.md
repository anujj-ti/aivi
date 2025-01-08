This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# Goals for AI Interview Application

[Today's Target]

1. Enable voice-to-voice conversation: The AI will process natural speech in real-time, listening to the candidate's responses and generating spoken follow-ups.
    - Flow:
        - Intro: the conversation will start by asking introduction to the candidate
        - Questions: the conversation will ask questions based on the candidate's resume and dynamically adapting its questioning based on their responses.
        - Follow up: the conversation will ask follow up questions if the candidate's answer is vague or incomplete. (Bonus)
        - Stop: the conversation will stop after 10-12 questions has been asked.

    - Limitation: It will be limited to short interviews of 2-3 minutes.

[Other Goals]

3. Ask clarifying questions or follow up on gaps in the answer: The AI will automatically identify vague or incomplete answers and seek further clarification. For example:
    - If the candidate mentions a project without explaining their role, the AI might ask, "What was your specific contribution to this project and the number of people you worked with?"
    - If the candidate provides a broad or generic answer, the AI could say, "Can you give me a specific example or scenario to illustrate that?"

2. Conduct long interviews (15 minutes): Initially, the application will focus on conducting very short interviews starting with questions based on the candidate's resume and dynamically adapting its questioning based on their responses. Later, functionality for longer interviews of up to 15 minutes will be added.

4. Intervene (without waiting for the candidate to finish) if the candidate is going off track or repeating details: The AI will politely steer the conversation back to the topic with phrases like:
    - "Let’s focus on [specific topic]. Could you elaborate more on that?"
    - "You already mentioned [repeated detail]. Let’s move on to another aspect of this."
