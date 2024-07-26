---
layout: ../../layouts/post.astro
title: Setting up Next.js project with Prisma, Supabase, and Shadcn.
description: This guide walks through how to create a basic app with Next.js, Prisma, Supabase, and Shadcn.
date: 2023-12-13
---

## Setting up Next.js

First run the following command to initialize the next js project with supabase, typescript, and tailwind: `npx create-next-app@latest`. Select all of the default options:

## Setting up Prisma

Run the following command to install prisma:
`npm install prisma --save-dev`

Once prisma is installed run the following command to initialize the schema file and the .env file:
`npx prisma init`

There should now be a .env file. You should add your database_url to connect prisma to your database. Should look like this:

```
// .env
DATABASE_URL=url
```

Inside your schema.prisma you should add your model, i am just using some random model for now:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Post {
  id        String     @default(cuid()) @id
  title     String
  content   String?
  published Boolean @default(false)
  author    User?   @relation(fields: [authorId], references: [id])
  authorId  String?
}

model User {
  id            String       @default(cuid()) @id
  name          String?
  email         String?   @unique
  createdAt     DateTime  @default(now()) @map(name: "created_at")
  updatedAt     DateTime  @updatedAt @map(name: "updated_at")
  posts         Post[]
  @@map(name: "users")
}
```

Now you can run the following command to sync your database with your schema:
`npx prisma db push`

In order to access prisma on the client side you need to install prisma client. You can do so by running the following command:
`npm install @prisma/client`

Your client must be in sync with your schema as well and you can do this by running the following command:
`npx prisma generate`

When you run `npx prisma db push` the generate command is automatically called.

In order to access the prisma client you need to create an instance of it, so create a new folder in the src directory called lib, and add a new file called prisma.ts to it.

```ts
// prisma.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
```

Now you can import the same instance of Prisma in any file.

## Setting up Shadcn

First run the following command to start setting up shadcn:
`npx shadcn-ui@latest init`

I selected the following options:
typescript: yes
style: default
base color: slate
global css: src/app/globals.css
css variables: yes
tailwind config: tailwind.config.ts
components: @/components (default)
utils: @/lib/utils (default)
react server components: yes
write to components.json: yes

Next run the following command to set up next themes:
`npm install next-themes`

Then add a file called theme-provider.tsx to your components library and add the following code:

```tsx
// theme-provider.tsx

"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

Once you have your provider setup, you want to add it to the layout.tsx so it is implemented on the entire app. Wrap the {children} with the Theme provider like this:

```tsx
// layout.tsx
return (
  <html lang="en" suppressHydrationWarning>
    <body className={inter.className}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </body>
  </html>
);
```

Now go to the shadcn [themes page](https://ui.shadcn.com/themes). And select the theme you want to use and press copy code. Then add that copied code to your globals.css so it looks like this:

```css
// globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 224 71.4% 4.1%;
    --card: 0 0% 100%;
    --card-foreground: 224 71.4% 4.1%;
    --popover: 0 0% 100%;
    --popover-foreground: 224 71.4% 4.1%;
    --primary: 262.1 83.3% 57.8%;
    --primary-foreground: 210 20% 98%;
    --secondary: 220 14.3% 95.9%;
    --secondary-foreground: 220.9 39.3% 11%;
    --muted: 220 14.3% 95.9%;
    --muted-foreground: 220 8.9% 46.1%;
    --accent: 220 14.3% 95.9%;
    --accent-foreground: 220.9 39.3% 11%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 20% 98%;
    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --ring: 262.1 83.3% 57.8%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 224 71.4% 4.1%;
    --foreground: 210 20% 98%;
    --card: 224 71.4% 4.1%;
    --card-foreground: 210 20% 98%;
    --popover: 224 71.4% 4.1%;
    --popover-foreground: 210 20% 98%;
    --primary: 263.4 70% 50.4%;
    --primary-foreground: 210 20% 98%;
    --secondary: 215 27.9% 16.9%;
    --secondary-foreground: 210 20% 98%;
    --muted: 215 27.9% 16.9%;
    --muted-foreground: 217.9 10.6% 64.9%;
    --accent: 215 27.9% 16.9%;
    --accent-foreground: 210 20% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 20% 98%;
    --border: 215 27.9% 16.9%;
    --input: 215 27.9% 16.9%;
    --ring: 263.4 70% 50.4%;
  }
}
```

Now you should be able to use shadcn components and themes in your project.

## Setting up Supabase

The first step is to create a new supabase project. Next, install the next.js auth helpers library:
`npm install @supabase/auth-helpers-nextjs @supabase/supabase-js`

Now you must add your supabase url and your anon key to your .env file. Your .env file should now look like this:

```
// .env
DATABASE_URL=url
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

We are going to use the supabase cli to generate types based on our schema. Install the cli with the following command:
`npm install supabase --save-dev`

In order to login to supabase run `npx supabase login` and it will automatically log you in.

Now we can generate our types by running the following command:
`npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts` which should add a new file in your lib folder with the types based on your schema.

Now create a middleware.ts file in the root of your project and add the following code:

```tsx
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });
  await supabase.auth.getSession();
  return res;
}
```

Now create a new folder in the app directory called auth, then another folder within auth called callback, and finally a file called route.ts. Add the following code in that file:

```ts
// app/auth/callback/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({
      cookies: () => cookieStore,
    });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin);
}
```

With that setup we can create a login page. In the app directory create a new folder called login with a page.tsx.

```tsx
// app/login/page.tsx
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Database } from "@/lib/database.types";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  const handleSignUp = async () => {
    await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    router.refresh();
  };

  const handleSignIn = async () => {
    await supabase.auth.signInWithPassword({
      email,
      password,
    });
    router.refresh();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <>
      <input
        name="email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
      />
      <input
        type="password"
        name="password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      />
      <button onClick={handleSignUp}>Sign up</button>
      <button onClick={handleSignIn}>Sign in</button>
      <button onClick={handleSignOut}>Sign out</button>
    </>
  );
}
```

Now create a new folder within the auth directory called sign-up, and a route.ts within that file. Add the following code:

```ts
// app/auth/sign-up/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { Database } from "@/lib/database.types";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
  });

  await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${requestUrl.origin}/auth/callback`,
    },
  });

  return NextResponse.redirect(requestUrl.origin, {
    status: 301,
  });
}
```

Create another folder in the same location called login.

```ts
// app/auth/login/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { Database } from "@/lib/database.types";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
  });

  await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return NextResponse.redirect(requestUrl.origin, {
    status: 301,
  });
}
```

And finally add a logout route in the same place.

```ts
// app/auth/logout/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { Database } from "@/lib/database.types";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({
    cookies: () => cookieStore,
  });

  await supabase.auth.signOut();

  return NextResponse.redirect(`${requestUrl.origin}/login`, {
    status: 301,
  });
}
```

Now there should be basic login logout sign up functionality when you navigate to localhost http://localhost:3000/login.

Now we have some basic boilerplate for a next js app with prisma shadcn and supabase auth setup.
