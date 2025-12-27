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


```mermaid
erDiagram
    USERS ||--o{ COURSES : teaches
    USERS ||--o{ ATTEMPTS : takes
    COURSES ||--o{ QUIZZES : contains
    QUIZZES ||--o{ QUESTIONS : has
    QUESTIONS ||--o{ OPTIONS : has
    ATTEMPTS ||--o{ ANSWERS : contains
    QUESTIONS ||--o{ ANSWERS : answered_in

    USERS {
        int id PK
        string name
        string email
        string password
        enum role
        timestamp created_at
        timestamp updated_at
    }

    COURSES {
        int id PK
        string title
        text description
        int teacher_id FK
        timestamp created_at
        timestamp updated_at
    }

    QUIZZES {
        int id PK
        string title
        int course_id FK
        int created_by FK
        int time_limit
        timestamp created_at
        timestamp updated_at
    }

    QUESTIONS {
        int id PK
        int quiz_id FK
        text text
        enum type
        timestamp created_at
        timestamp updated_at
    }

    OPTIONS {
        int id PK
        int question_id FK
        string text
        boolean is_correct
        timestamp created_at
        timestamp updated_at
    }

    ATTEMPTS {
        int id PK
        int user_id FK
        int quiz_id FK
        decimal score
        datetime started_at
        datetime finished_at
    }

    ANSWERS {
        int id PK
        int attempt_id FK
        int question_id FK
        int selected_option_id FK
        text answer_text
    }
```

