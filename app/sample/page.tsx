'use client';

import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const sampleConversation: Message[] = [{"role":"user","content":"Hello, I am here for the interview."},{"role":"assistant","content":"Hello! Welcome to the interview. I've reviewed your resume, and I'd love to start by having you introduce yourself briefly. Could you tell me about your background, education, and what interests you in technology?"},{"role":"user","content":"Hello! My name is Anuj Rajaram Jadhav, and I'm currently in my third year of pursuing a B.Tech in Computer Science and Engineering at NIT Patna. I've always been passionate about technology, especially web development, which I’ve explored through various projects and internships. I enjoy creating solutions that are both user-friendly and efficient. Beyond that, competitive programming has been a significant interest of mine, as it challenges me to think critically and solve problems creatively. What excites me most about technology is how it continuously evolves and offers endless opportunities to innovate and learn."},{"role":"assistant","content":"Thank you for the introduction, Anuj. I noticed you have experience both through internships and personal projects. Could you tell me about a project that you're particularly proud of or one that you feel was most challenging? Please choose any project from your experience that you'd like to discuss in detail."},{"role":"user","content":"One project I’m particularly proud of is the Landlord-Tenant Management System I developed during my first year. It’s a web application designed to help landlords and tenants manage payments and track transaction histories efficiently. The idea was to simplify the process of managing multiple billing services with direct payment methods and a clear history log.\n\nThe challenging part was implementing the payment functionality securely and ensuring data consistency across different users. I worked with ReactJS for the frontend, MongoDB for the database, and used Context API for state management. Testing the app with Postman and debugging various edge cases taught me a lot about handling real-world scenarios. This project was special to me because it gave me a solid foundation in full-stack development and showed me the impact of solving practical problems through technology."},{"role":"assistant","content":"That's interesting! Let's dive deeper into this project. You mentioned using ReactJS and MongoDB. Could you explain why you chose these specific technologies for your Landlord-Tenant Management System? What were the advantages and potential disadvantages of using this stack?"},{"role":"user","content":"I chose ReactJS for the frontend because of its component-based structure, which made it easier to build reusable UI components and manage the dynamic state of the application. It also allowed for a responsive design, ensuring the app worked smoothly on different devices. MongoDB was selected for the database because it’s schema-less, which provided flexibility as the data structure evolved during development. It also worked well for handling JSON-like data, making it easier to integrate with the backend.\n\nThe advantages of this stack were its scalability and developer-friendly tools. ReactJS has a strong community and robust ecosystem, which helped me solve issues quickly. Similarly, MongoDB’s NoSQL nature made it easier to iterate and adapt during the early phases of the project. However, one disadvantage was that MongoDB required careful design to avoid issues like redundant data or slower queries for certain operations. ReactJS also has a steep learning curve initially, especially when managing state across multiple components, but Context API helped simplify that. Overall, this stack allowed me to balance efficiency with flexibility."},{"role":"assistant","content":"Thank you for explaining that. You mentioned using Context API for state management. Could you walk me through a specific scenario in your application where Context API was particularly useful? And why did you choose Context API over other state management solutions like Redux?"},{"role":"user","content":"Context API was really helpful in managing the state for user authentication and maintaining shared data like transaction history across different components. For example, once a user logged in, their details and associated data, like payment records, needed to be accessible to multiple parts of the app, including the dashboard and transaction history page. Using Context API, I could create a global state and pass it down efficiently without having to prop-drill through multiple components.\n\nAs for Redux, I’ve heard of it, but I didn’t explore it deeply at the time. Context API seemed simpler and built into React, so it felt like the right choice for my project. My focus was on learning ReactJS and building a working app, so I stuck with something straightforward that I could understand and implement quickly. While I know Redux is powerful for managing more complex state logic, Context API worked well for my project’s scale."},{"role":"assistant","content":"I see. Let's talk about the payment functionality you implemented. Could you explain how you handled the security aspects of payment transactions? What measures did you take to ensure secure data transmission and storage of sensitive information?"},{"role":"user","content":"To be honest, the payment functionality was something my teammate focused on, so I don’t have in-depth knowledge about the specific security measures they implemented. However, from my understanding, we used HTTPS for secure data transmission and ensured sensitive information, like payment details, was never stored directly in the database. Instead, it was handled through a payment gateway.\n\nI mainly worked on the integration part, ensuring the API calls were seamless and the responses were handled correctly on the frontend. While I’m not fully familiar with the finer details of securing transactions, I’d be happy to learn more if given the opportunity."},{"role":"assistant","content":"Thanks for your honest response. Let's focus on the areas you worked on directly. You mentioned working with MongoDB. Could you explain the database schema you designed? What were the different entities in your database and how were they related to each other?"},{"role":"user","content":"The database schema was designed with a few collections, like users, landlords, and tenants. Each collection had fields like names, emails, and payment details. The relations were managed by linking landlords to their tenants through IDs. Tenants had their payment history stored as arrays in their documents.\n\nI didn’t focus too much on optimizing the schema, so there might have been redundancies. It worked for the project, though, and I think the structure was straightforward enough for our use case."},{"role":"assistant","content":"I understand. When dealing with payment records and user data, data consistency is crucial. Did you implement any transactions in MongoDB to handle scenarios where multiple operations needed to be performed atomically? For example, when updating both the payment history and user balance?"},{"role":"user","content":"No, I didn’t implement transactions in MongoDB for this project. At the time, I wasn’t very familiar with how MongoDB handles transactions, so we managed updates separately for payment history and user balance. Looking back, I understand that it might not have been the best approach for ensuring data consistency. It’s something I’d like to learn more about and improve in future projects."},{"role":"assistant","content":"Thanks for being candid about that. Let's talk about testing. You mentioned using Postman for testing. Could you describe your testing process? What kinds of scenarios or edge cases did you test for, and how did you handle error cases in your application?"},{"role":"user","content":"I mainly used Postman to test the API endpoints for payment and user data. I focused on basic scenarios like successful payments and user authentication. For error cases, I made sure to test invalid inputs and ensure the app responded with appropriate error messages. I didn’t do extensive testing, but I tried to cover the main use cases."},{"role":"assistant","content":"You mentioned working with a teammate on this project. Could you describe how you collaborated? How did you divide the responsibilities, and what tools or practices did you use for version control and code management?"},{"role":"user","content":"Me and my teammate worked together by dividing tasks. I mainly focused on frontend with ReactJS and some integration part, while he worked on backend and payment system. We used GitHub for version control, pushing our changes regularly. Sometimes we faced merge conflicts, but we managed to solve them. We didn’t have a strict process, but we kept communicating on WhatsApp for quick fixes."},{"role":"assistant","content":"I see. One final question: If you were to rebuild this project today with your current knowledge and experience, what would you do differently? Are there any specific improvements or additional features you would implement?"},{"role":"user","content":"If I rebuilt the project today, I would use better database design, maybe implement MongoDB transactions for consistency. I would also add more features like email notifications for payment reminders and maybe improve the UI using a more modern framework. I would focus on testing more thoroughly as well."},{"role":"assistant","content":"Thank you for sharing your experience and insights about the Landlord-Tenant Management System. Your answers have given me a good understanding of your technical background and learning journey. I appreciate your honesty about areas where you could improve and your willingness to learn from the experience.\n\n[END OF INTERVIEW]"}];

const sampleAssessment = `Let me analyze the interview based on the given parameters:

COMMUNICATION:
- Are they able to articulate thoughts properly? : [REMARK] Yes
- REASONING: The candidate provided clear, structured responses and maintained professional communication throughout the interview.

- Are they able to explain the project? : [REMARK] Weak Yes
- REASONING: While they could explain the basic structure and purpose of their project, some technical details were superficial, especially regarding payment functionality and database design.

- Do they ask the right questions? : [REMARK] Can't say
- REASONING: The conversation didn't present many opportunities where the candidate needed to ask questions.

- Do they answer the question to the point or has tendency to digress? : [REMARK] Yes
- REASONING: The candidate's responses were focused and relevant to the questions asked, showing good listening skills.

PROJECT EXPERIENCE:
- Do they have work experience? : [REMARK] Yes
- REASONING: Has internship experience at Trilogy Innovations and worked as Frontend Coordinator at Google Developer Students Club.

- Have they worked on multiple projects? : [REMARK] Yes
- REASONING: Resume shows both professional experience (Trilogy Innovations) and personal projects (Charges By Tenant-Landlord Link).

- Have they contributed across different domains? : [REMARK] Yes
- REASONING: Shows experience in frontend (GDSC role), full-stack development (Landlord project), and work with AWS technologies and LLM (Trilogy internship).

- Would you consider their role intensive? : [REMARK] Weak Yes
- REASONING: While they worked on important aspects of their projects, some responses revealed limited depth in critical areas like security and database optimization.

- Did they deal with non-technical aspects? : [REMARK] Yes
- REASONING: Worked as Frontend Coordinator at GDSC, facilitating integration between frontend and backend teams.

FUNDAMENTALS:
- Understanding of tech pros/cons? : [REMARK] Weak Yes
- REASONING: Could explain basic advantages of ReactJS and MongoDB but showed limited understanding of advanced concepts like transactions and security.

- Understanding of domain basics? : [REMARK] Yes
- REASONING: Demonstrated good understanding of frontend development concepts, component-based architecture, and state management.

- Understanding of general concepts? : [REMARK] Yes
- REASONING: Shows familiarity with version control (Git), API testing (Postman), and basic development workflows.

STRENGTHS:
1. Good communication skills and ability to maintain professional dialogue
2. Diverse technical exposure across different domains
3. Honest about limitations and willing to learn
4. Good understanding of basic development concepts
5. Experience in both team and individual projects

WEAKNESSES:
1. Limited depth in certain technical areas (security, database optimization)
2. Lack of thorough testing practices
3. Basic implementation of complex features without considering best practices
4. Limited experience with advanced concepts in chosen technologies

FINAL SUMMARY:
The candidate shows promise with good communication skills and a solid foundation in software development. While they have experience across different domains and technologies, their knowledge tends to be more surface-level in some critical areas. Their honesty about limitations and willingness to learn are positive traits. They would be suitable for junior developer positions where they can build upon their existing knowledge while learning best practices under guidance. Their experience with both team collaboration and individual projects suggests they can work well in different settings, though they would benefit from more exposure to professional development practices and advanced concepts in their chosen technologies.`;

export default function SamplePage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-800">Sample Interview Summary</h1>
              <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-sm text-blue-700">
                <span className="font-medium">Note:</span> This is a simulated interview using ChatGPT. 
                Some responses are intentionally imperfect to demonstrate a realistic interview scenario.
              </div>
            </div>
            <Link 
              href="/interview/upload" 
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Start Real Interview
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Assessment</h2>
            <div className="bg-teal-50 p-6 rounded-lg">
              <p className="text-gray-800 whitespace-pre-wrap">{sampleAssessment}</p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-4">Interview Transcript</h2>
          <div className="space-y-6">
            {sampleConversation.map((message, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                <div className="flex flex-col gap-2">
                  {message.role === 'assistant' && (
                    <div>
                      <p className="text-sm font-medium text-teal-800 mb-2">Question:</p>
                      <p className="text-lg text-gray-800 bg-teal-50 p-4 rounded-lg">{message.content}</p>
                    </div>
                  )}
                  {message.role === 'user' && (
                    <div>
                      <p className="text-sm font-medium text-blue-800 mb-2">Answer:</p>
                      <p className="text-lg text-gray-800 bg-blue-50 p-4 rounded-lg">{message.content}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
} 