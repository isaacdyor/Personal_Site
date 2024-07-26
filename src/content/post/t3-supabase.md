---
layout: ../../layouts/post.astro
title: T3 stack with app router and supabase
description: This guide walks through how to create a basic app with the T3 stack, Shadcn, and Supabase
date: 2024-01-06
---

## Introduction

I am writing this blog post to document the creation of a new project of mine so I can remember specific things I did and hopefully make development quicker in the future. I also hope other people might find it useful.

I am building this app with inspiration from [Taxonomy](https://tx.shadcn.com/) and [Acme corp](https://acme-corp.jumr.dev/) so a lot of the design comes from there.

Why this stack? I have never used this exact stack before but I have used the t3 stack with Planetscale and Clerk before and really enjoyed it. I did not find a great solution for realtime, so I thought that I could use Supabase to replace Planetscale and Clerk and add realtime and storage. I also watched [this video](https://www.youtube.com/watch?v=yVsaCVEfPn4&ab_channel=developedbyed) and [this video](https://www.youtube.com/watch?v=SFn5e3vQglE&t=285s&ab_channel=Joshtriedcoding) so it seems like using trpc could be an interesting way to fetch data if I want interactivity.

This blog is kind of like a case a study to see if I enjoy working with this stack. Let's get started!

## Creating T3 app

Run `npm create t3-app@latest` to create a new t3 app. I selected the following options:

- Typescript: yes
- Tailwind: yes
- tRPC: yes
- Authentication: none
- Orm: prisma
- App router: yes

Run `npm run dev` to start your local server. You are probably getting errors about an invalid prisma.post.findMany invocation because not everything is set up yet. For now we are just going to completely wipe the homepage so its just:

```
export default async function Home() {
  return <p>hello world</p>;
}
```

Also delete the file posts.ts file in src/server/api/routers. We will define our own routers later.

## Deploying our app

We should be deploying early and deploying often, so even though we don't really have any content, lets deploy our app to vercel.

The first thing we have to do is add the correct environment variables. If you open the env.mjs file you will see the schema for environment variables. The point of this file is to validate your environment variables to make sure you don't try to use an environment variable you don't actually have access to.

As you can see, the schema expects you to have a database url so lets include that. I am using supabase so first create a new supabse project. In the supabase dashboard for your project go to settings and in the database section you will find connection string.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/96v25n2krqv6v4o30mo6.png)

Select uri and copy paste that into your .env file. It should look like this:

```
// .env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.lbcubcyvjdzufnvuynno.supabase.co:5432/postgres"
```

Now that you have your environment variables set up we can deploy to vercel. First create a new github repository and push your code. Then go to vercel and press add new and import the repository you just created. Add the database url as an environment variable and press deploy.

## Setting up shadcn

Run `npx shadcn-ui@latest init` to start the shadcn initialization process. I selected the following options:

- Typescript: yes
- Style: default
- Base color: slate
- Global css file: src/styles/globals.css
- Css variables: yes
- Custom prefix: blank
- Tailwind config: tailwind.config.ts
- Component import alias: @/components
- Utils import alias: @/lib/utils
- React server components: yes
- Write to components.json: yes

Now run `npm install next-themes` to install next themes. Add a component called theme-provider.tsx to your components folder and include the following code:

```tsx
// components/theme-provider.tsx

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
// app/layout.tsx
return (
  <html lang="en" suppressHydrationWarning>
    <body className={`font-sans ${inter.variable}`}>
      <TRPCReactProvider cookies={cookies().toString()}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </TRPCReactProvider>
    </body>
  </html>
);
```

Now go to the shadcn [themes page](https://ui.shadcn.com/themes). And select the theme you want to use and press copy code. Then add that copied code to your globals.css so it looks like this:

```css
// styles/globals.css
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

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## Navbar

We will be building a navbar that works for web and mobile, and on mobile we need a hamburger menu that can be opened and closed. For the icons we will be using heroicons, so run `npm install @heroicons/react` to install it. We also need to install the button component from shadcn so run `npx shadcn-ui@latest add button` to install it.

For now we will keep the navbar basic, but in the future we can check to see if the user is logged in and render different content based on the user's status.

Create a new file in `components/navbar/Navbar.tsx`. Add the following code to the file: (Note that since we are going to be using state to open and close the hamburger menu on mobile, we need to make it a client component).

```tsx
// components/navbar/Navbar.tsx
"use client";
import Link from "next/link";
import React, { useState } from "react";
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/solid";
import { Button } from "../ui/button";

const routes: { title: string; href: string }[] = [
  { title: "Features", href: "#features" },
  { title: "Resources", href: "#resources" },
  { title: "Pricing", href: "#pricing" },
];

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="flex h-16 items-center justify-between px-6 lg:px-14">
      <div className="flex items-center">
        <Link href={"/"} className="shrink-0">
          <h1 className="text-accent-foreground text-2xl font-bold">devlink</h1>
        </Link>
        <div className="bg-background hidden w-full justify-end gap-1 px-4 py-2 sm:flex">
          {routes.map((route, index) => (
            <Link
              key={index}
              href={route.href}
              className={`hover:text-accent-foreground text-muted-foreground inline-flex h-10 w-full items-center px-4 py-2 text-sm transition-colors sm:w-auto`}
            >
              {route.title}
            </Link>
          ))}
        </div>
      </div>

      <div className="hidden items-center gap-2 sm:flex">
        <Link href={"/login"} className="w-full sm:w-auto">
          <Button variant="secondary" size="sm" className="w-full">
            Log In
          </Button>
        </Link>
        <Link href="/signup" className="w-full sm:w-auto">
          <Button variant="default" size="sm" className="w-full">
            Sign Up
          </Button>
        </Link>
      </div>

      {menuOpen && <MobileMenu toggleMenu={toggleMenu} />}

      <button onClick={toggleMenu} className="sm:hidden">
        {menuOpen ? (
          <XMarkIcon className="h-7 w-7" />
        ) : (
          <Bars3Icon className="h-7 w-7" />
        )}
      </button>
    </div>
  );
};

const MobileMenu: React.FC<{ toggleMenu: () => void }> = ({ toggleMenu }) => {
  return (
    <div className="absolute right-0 top-16 flex h-[calc(100vh-64px)] w-full flex-col">
      <div className="bg-background  flex w-full grow flex-col gap-1 px-4 pb-2 sm:hidden">
        {routes.map((route, index) => (
          <Link
            key={index}
            href={route.href}
            onClick={toggleMenu}
            className={`hover:text-accent-foreground text-muted-foreground inline-flex h-10 w-full items-center text-sm transition-colors sm:w-auto`}
          >
            {route.title}
          </Link>
        ))}
        <Link href={"/login"} className="w-full sm:w-auto">
          <Button
            onClick={toggleMenu}
            variant="secondary"
            size="sm"
            className="w-full"
          >
            Log In
          </Button>
        </Link>
        <Link href="/signup" className="w-full sm:w-auto">
          <Button
            onClick={toggleMenu}
            variant="default"
            size="sm"
            className="w-full"
          >
            Sign Up
          </Button>
        </Link>
      </div>
      <div className="bg-background/60 h-screen w-full sm:hidden" />
    </div>
  );
};

export default Navbar;
```

Now that we have our Navbar component we need to add it to the layout.tsx to apply it to all of our pages:

```tsx
// app/layout.tsx
return (
  <html lang="en" suppressHydrationWarning>
    <body className={`font-sans ${inter.variable}`}>
      <TRPCReactProvider cookies={cookies().toString()}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          {children}
        </ThemeProvider>
      </TRPCReactProvider>
    </body>
  </html>
);
```

## Adding supabase auth

Run `npm install @supabase/ssr @supabase/supabase-js` to install the supabase client and supabase ssr.

Now we need to configure our environment variables for authentication. In api settings section of the supabase dashboard you will find your project url and your anon key. Add both of these to your .env file so it looks like this:

```
// .env
DATABASE_URL=url
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Now that we have added new enviornment variables we need to make sure our schema in env.js is up to date. Navigate to the env.js file and inside the client section add these two new environment variables:

```js
// env.js
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  },
```

You also have to add them to the runtime env section, so it should now look like this:

```js
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
```

**Supabase client**

Now we are going to create some utility functions to create a supabase instance on the client, server, and in middleware. Create a new folder in the src directory called utils and add a new folder inside called supabase. Add a file called middleware.ts and add the following code:

```ts
// utils/supabase/middleware.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/env";

export const createClient = (request: NextRequest) => {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is updated, update the cookies for the request and response
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the cookies for the request and response
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  return { supabase, response };
};
```

Now create a new file in the same directory called client.ts and add the following code:

```ts
// utils/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/env";

export const createClient = () =>
  createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
```

And finally add a file called server.ts and add the following code:

```ts
// utils/supabase/server.ts
import { env } from "@/env";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};
```

Now whenever you need a new instance of supabase you can import it already preconfigured with your environment variables.

**Middleware**

We need to add a middleware to refresh the session if it is expired. This is required for server components. This is also where we can define which routes are protected or unprotected using the matcher array. In the src directory add a new file called middleware.ts and add the following code:

```ts
// middleware.ts
import { type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  await supabase.auth.getSession();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

**Callback route**

If you send someone a confirmation email after they sign up you want them to be automatically signed in once they press the link. The way this is done is through a code exchange. We can set this up through a callback route. Create a new file at `app/(auth)/auth/callback/route.ts` and add the following code:

```ts
// app/(auth)/auth/callback/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin);
}
```

**Authentication**

Now we need a way for the user to login and logout. To do this we can create a new folder called (auth) in the app directory and add two new pages, a login/page.tsx and a signup/page.tsx.

Before we add any code to these files we need to import the input, and form components from shadcn. The form component automatically uses react-hook-form so we can easily implement form validation. We will also need to install react-icons because hero-icons doesn't have github/google icons. _(If you only want to use react-icons that is fine too, I just like the consistency of heroicons)_.

Run `npx shadcn-ui@latest add form` to install the form and `npx shadcn-ui@latest add input` for input. Run `npm install react-icons --save` to install react-icons.

**Fixing navbar**

There is also a little more configuration we need to do to make everything look good. I don't want the navbar showing on the auth pages because I think it looks a lot cleaner. _(It's a little complicated for a small nitpick so you can skip this if you want)_. The best way I know how to do this is to make a (main) folder in the app directory so I can add the navbar in the layout.tsx of that folder, rather than adding the navbar to the entire project.

So first remove the Navbar from your main layout.tsx. Next create a new (main) folder and move the page.tsx into that folder. Create a new layout.tsx file in the new folder and include the following code:

```tsx
// app/(main)/layout.tsx
import React from "react";
import Navbar from "@/components/navbar/Navbar";

const RootLayout: React.FC<{ children: React.ReactNode }> = async ({
  children,
}) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default RootLayout;
```

Now the navbar will be applied to all of the files in the main folder, which will be everything other than auth. Although I don't want the entire navbar showing on the auth pages I still want the main logo to show so the user can easily navigate back to the homepage. I also want to redirect the user away from the auth pages if they are already signed in _(this may be better as a middleware but this was easy)_. To do that create a layout.tsx in the (auth) folder and add the following code:

```tsx
// app/(auth)/layout.tsx
import React from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

const RootLayout: React.FC<{ children: React.ReactNode }> = async ({
  children,
}) => {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }
  return (
    <>
      <Link href={"/"} className="absolute left-6 top-4 shrink-0 lg:left-14">
        <h1 className="text-accent-foreground text-2xl font-bold">devlink</h1>
      </Link>
      {children}
    </>
  );
};

export default RootLayout;
```

Okay now everything should be working properly. Your app folder structure should look like this now:

```
.
└── app/
    ├── (auth)/
    │   ├── auth/
    │   │   └── callback/
    │   │       └── route.ts
    │   ├── signup/
    │   │   └── page.tsx
    │   ├── login/
    │   │   └── page.tsx
    │   └── layout.tsx
    ├── (main)/
    │   ├── page.tsx
    │   └── layout.tsx
    ├── api/
    │   └── trpc/
    │       └── [trpc]/
    │           └── route.ts
    └── layout.tsx
```

**Signup page**
Now that we have completed that tangent we need to add the signup page. In the signup page add the following code: _(It doesn't have any functionality yet, we will add that later. This is just the markup)_.

```tsx
// app/(auth)/signup/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";

import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export type SignupInput = z.infer<typeof registerSchema>;

export default function Login() {
  const form = useForm<SignupInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignupInput) => {
    console.log(data);
  };

  return (
    <div className="flex">
      <div className="bg-secondary/15 hidden h-screen grow lg:block" />
      <div className="bg-background h-screen w-full lg:w-1/2">
        <div className="flex h-full items-center justify-center">
          <div className="w-full max-w-md p-8">
            <h1 className="mb-4 text-2xl font-semibold">Sign up</h1>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="animate-in text-muted-foreground flex w-full flex-1 flex-col justify-center gap-2"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your email address"
                          {...field}
                          autoComplete="on"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your password"
                          type="password"
                          autoComplete="on"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button variant="default" className="my-3 w-full" type="submit">
                  Sign up
                </Button>
              </form>
            </Form>
            <div className="flex items-center gap-2 py-4">
              <hr className="w-full" />
              <p className="text-muted-foreground text-xs">OR</p>
              <hr className="w-full" />
            </div>
            <Button
              variant="outline"
              className="text-muted-foreground mb-2 w-full font-normal"
            >
              <div className="flex items-center gap-2">
                <FaGithub className="h-5 w-5" />
                <p>Sign in with GitHub</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="text-muted-foreground mb-2 w-full font-normal"
            >
              <div className="flex items-center gap-2">
                <FcGoogle className="h-5 w-5" />
                <p>Sign in with Google</p>
              </div>
            </Button>
            <p className="text-muted-foreground py-4 text-center text-sm underline">
              <Link href="/signup">Already have an account? Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Signup functionality**

When the user submits the form it should call a server action where we can call supabase.signup. Lets build that server action.

In the (auth) folder lets add a new file called actions.ts. This is where we will define the signup, login, and logout functions. Inside the actions file add the following code:

```ts
// app/(auth)/actions.ts
"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies, headers } from "next/headers";
import type { SignupInput } from "./signup/page";

const supabase = createClient(cookies());
const origin = headers().get("origin");

export const signUp = async (data: SignupInput) => {
  "use server";

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return {
      error: error.message,
    };
  }
};
```

And now we need to call this function on submit of the signup page. If there is an error we want to render the error so the user knows, and if the confirmation email has been successfully sent we also want to let the user know. To do this we are going to use state.

In the top of your signup component add the following code:

```tsx
// app/(auth)/signup.tsx

...

const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState<string | null>(null);

const onSubmit = async (data: SignupInput) => {
  setSuccess("Check your email for further instructions");
  const result = await signUp(data);
  if (result?.error) {
    setSuccess(null);
    setError(result.error);
  }
};

...
```

Now we need to conditionally render the error and success messages. Add the following code below the signup button:

```tsx
// app/(auth)/signup.tsx

...

{success && (
  <div className="bg-secondary/50 border-border mb-3 mt-1 rounded-md border p-3">
    <p className="text-muted-foreground text-center text-sm font-medium">
      {success}
    </p>
  </div>
)}
{error && (
  <div className="bg-destructive/10 border-destructive mb-3 mt-1 rounded-md border p-3">
    <p className="text-destructive text-center text-sm font-medium">
      {error}
    </p>
  </div>
)}

...
```

Now when you press signup you should see a message saying check your email. If you check the auth tab of the Supabase dashboard you should that there is a new user pending verification. Once you go to your email and press the link it should automatically sign you in.

**Logout**
Now once the user has signed up they need to be able to logout. For now lets just add a button on the home page to logout, but later we can put it in a profile menu. In the `app/(main)/page.tsx` file add the following code:

```tsx
// app/(main)/page.tsx
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthButton() {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signOut = async () => {
    "use server";

    const supabase = createClient(cookies());
    await supabase.auth.signOut();
    return redirect("/login");
  };

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <form action={signOut}>
        <button className="bg-btn-background hover:bg-btn-background-hover rounded-md px-4 py-2 no-underline">
          Logout
        </button>
      </form>
    </div>
  ) : (
    <Link
      href="/login"
      className="bg-btn-background hover:bg-btn-background-hover flex rounded-md px-3 py-2 no-underline"
    >
      Login
    </Link>
  );
}
```

When you press the logout button it should redirect you to /login which doesn't exist, but when you navigate back to the home page you will see that you are not logged in. Now lets add the login page.

**Login**
Although this process will be quite similar to signup I did not create a reusable component because in my opinion it complicates things. _(My keeping the pages seperate I can easily add things like password confirmation to the signup page without messing with the login page. If you want to make it a component feel free)._

In the `app/(auth)/login/page.tsx` file add the following code:

```tsx
// app/(auth)/login/page.tsx

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";

import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { signIn, signUp } from "../actions";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export type LoginInput = z.infer<typeof registerSchema>;

export default function Login() {
  const form = useForm<LoginInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: LoginInput) => {
    const result = await signIn(data);
    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <div className="flex">
      <div className="bg-secondary/15 hidden h-screen grow lg:block" />
      <div className="bg-background h-screen w-full lg:w-1/2">
        <div className="flex h-full items-center justify-center">
          <div className="w-full max-w-md p-8">
            <h1 className="mb-4 text-2xl font-semibold">Sign in</h1>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="animate-in text-muted-foreground flex w-full flex-1 flex-col justify-center gap-2"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your email address"
                          {...field}
                          autoComplete="on"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your password"
                          type="password"
                          autoComplete="on"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button variant="default" className="my-3 w-full" type="submit">
                  Sign in
                </Button>
                {error && (
                  <div className="bg-destructive/10 border-destructive mb-3 mt-1 rounded-md border p-3">
                    <p className="text-destructive text-center text-sm font-medium">
                      {error}
                    </p>
                  </div>
                )}
              </form>
            </Form>
            <div className="flex items-center gap-2 py-4">
              <hr className="w-full" />
              <p className="text-muted-foreground text-xs">OR</p>
              <hr className="w-full" />
            </div>
            <Button
              variant="outline"
              className="text-muted-foreground mb-2 w-full font-normal"
            >
              <div className="flex items-center gap-2">
                <FaGithub className="h-5 w-5" />
                <p>Sign in with GitHub</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="text-muted-foreground mb-2 w-full font-normal"
            >
              <div className="flex items-center gap-2">
                <FcGoogle className="h-5 w-5" />
                <p>Sign in with Google</p>
              </div>
            </Button>
            <p className="text-muted-foreground py-4 text-center text-sm underline">
              <Link href="/signup">Don&apos;t have an account? Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

We have not defined the signIn action yet so let's do that. In the `app/(auth)/actions.ts` file add the following function below the signUp function:

```ts
app/(auth)/actions.ts

...
export const signIn = async (data: LoginInput) => {
  "use server";

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });
  if (error) {
    return {
      error: error.message,
    };
  }
};
...


```

Now if you are logged out you can navigate to the `/login` route and you should be able to login.

**OAuth**
The final part of supabase auth we need to implement is signing in with OAuth. Right now we have some buttons for this that don't do anything so lets change that.

The first thing we need to do is set up the providers in the supabase dashboard. To do this we need to get the client id and client secret for whatever providers we are using. I am using google and github. Follow the [google oauth documentation](https://support.google.com/cloud/answer/6158849?hl=en) and the [github oauth documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app) to get your credentials.

Once you have your credentials go to the providers section of the auth section of the supabase dashboard. Enable the providers you want to use and add your credentials. Make sure that you add the callback url as an approved redirect url for all of the providers you choose.

In the components folder create a new file at `auth/OauthButton.tsx` and add the following code:

```tsx
// components/auth/OauthButton.tsx

"use client";

import { Button } from "@/components/ui/button";
import { redirect, usePathname } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import React from "react";
import { Provider } from "@supabase/supabase-js";
import { FaGithub } from "react-icons/fa";
import { createClient } from "@/utils/supabase/client";

const OauthButton: React.FC<{ provider: Provider }> = ({ provider }) => {
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${pathname}`,
      },
    });

    if (error) {
      return redirect("/login?message=Could not authenticate user");
    }
  };

  if (provider === "google") {
    return (
      <Button
        variant="outline"
        className="text-muted-foreground mb-2 w-full font-normal"
        onClick={() => handleLogin().catch(console.error)}
      >
        <div className="flex items-center gap-2">
          <FcGoogle className="h-5 w-5" />
          <p>Sign in with Google</p>
        </div>
      </Button>
    );
  }

  if (provider === "github") {
    return (
      <Button
        variant="outline"
        className="text-muted-foreground mb-2 w-full font-normal"
        onClick={handleLogin}
      >
        <div className="flex items-center gap-2">
          <FaGithub className="h-5 w-5" />
          <p>Sign in with GitHub</p>
        </div>
      </Button>
    );
  }
};

export default OauthButton;
```

Now we need to replace our old Oauth buttons with this new component. In both `signup/page.tsx` and `login/page.tsx` replace the old buttons with the following code:

```tsx

...
<OauthButton provider={"google"} />
<OauthButton provider={"github"} />
...

```

If you set up everything correctly you should now be able to login using oauth.

## Adding auth to navbar

Now that we have Supabase auth setup we should only render the signup and login buttons when there is no current session, and instead render a profile button if the user is logged in.

To do this we are going to create an auth component that handles all this logic for us, and we can import it into our navbar.

There are a few interesting things to note here. If we are going to be showing the current users data that means we need to query the current user. It is possible to query from the client side but generally it is better to query from a server component and pass the data as a prop to a client component. However, you cannot import a server component into a client component and since the navbar is a client component that would mean we could not import our AuthComponent if we made it a server component.

The way next.js recommends you handle this is through [passing the component as a prop](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#supported-pattern-passing-server-components-to-client-components-as-props).

The first step of this process is to create our server component at `components/navbar/AuthComponent.tsx` and add the following code:

```tsx
// components/navbar/AuthComponent.tsx

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "../ui/button";
import ProfileButton from "./ProfileButton";

const AuthComponent = async () => {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <ProfileButton user={user} />
  ) : (
    <div className="hidden items-center gap-2 sm:flex">
      <Link href={"/login"} className="w-full sm:w-auto">
        <Button variant="secondary" size="sm" className="w-full">
          Log In
        </Button>
      </Link>
      <Link href="/signup" className="w-full sm:w-auto">
        <Button variant="default" size="sm" className="w-full">
          Sign Up
        </Button>
      </Link>
    </div>
  );
};

export default AuthComponent;
```

For the profile button I want to be able to open and close a profile modal which means I need state which means it needs to be a client component. Create a new component at `components/navbar/ProfileButton.tsx` and add the following code:

```tsx
// components/navbar/ProfileButton.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { createClient } from "@/utils/supabase/client";

const ProfileButton: React.FC<{ user: User }> = ({ user }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const ref = React.useRef<HTMLDivElement>(null);

  // close the modal if we click outside of it
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [ref]);

  if (!user) return null;
  return (
    <div ref={ref} className="hidden sm:block">
      <Avatar
        className="hover:cursor-pointer"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <AvatarImage src="https://wallpapers.com/images/high/funny-profile-picture-7k1legjukiz1lju7.webp" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      {menuOpen && (
        <div className="bg-secondary absolute right-5 top-16 z-50 flex w-72 flex-col rounded-lg bg-opacity-80 p-4">
          <div className="flex items-center">
            <div className="pr-4">
              <Avatar onClick={() => setMenuOpen(!menuOpen)}>
                <AvatarImage src="https://wallpapers.com/images/high/funny-profile-picture-7k1legjukiz1lju7.webp" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col">
              <p className="text-xl">Isaac Dyor</p>
              <p className="text-md text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <hr className="my-2 border-t-2 border-slate-600" />
          <p className="text-muted-foreground py-2 text-lg">
            <Link
              onClick={() => setMenuOpen(false)}
              className="hover:text-muted-foreground/70"
              href="/profile"
            >
              Profile
            </Link>
          </p>
          <p className="text-muted-foreground py-2 text-lg">
            <Link
              onClick={() => setMenuOpen(false)}
              className="hover:text-muted-foreground/70"
              href="/settings"
            >
              Settings
            </Link>
          </p>

          <div className="text-muted-foreground py-2 text-lg">
            <button
              className="hover:text-muted-foreground/70"
              onClick={() =>
                signOut().then(() => {
                  setMenuOpen(false);
                  router.refresh();
                })
              }
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileButton;
```

Now that we have our Auth component set up we need to pass it as a prop to our navbar. Replace the login and signup links with children and we will pass the auth component in from the layout page. Your navbar should now contain the following code:

```tsx
// components/navbar/Navbar.tsx
"use client";
import Link from "next/link";
import React, { useState } from "react";
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/solid";

const routes: { title: string; href: string }[] = [
  { title: "Features", href: "#features" },
  { title: "Resources", href: "#resources" },
  { title: "Pricing", href: "#pricing" },
];

const Navbar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="flex h-16 items-center justify-between px-6 lg:px-14">
      <div className="flex items-center">
        <Link href={"/"} className="shrink-0">
          <h1 className="text-accent-foreground text-2xl font-bold">devlink</h1>
        </Link>
        <div className="bg-background hidden w-full justify-end gap-1 px-4 py-2 sm:flex">
          {routes.map((route, index) => (
            <Link
              key={index}
              href={route.href}
              className={`hover:text-accent-foreground text-muted-foreground inline-flex h-10 w-full items-center px-4 py-2 text-sm transition-colors sm:w-auto`}
            >
              {route.title}
            </Link>
          ))}
        </div>
      </div>

      {children}

      {menuOpen && <MobileMenu toggleMenu=

      <button onClick={toggleMenu} className="sm:hidden">
        {menuOpen ? (
          <XMarkIcon className="h-7 w-7" />
        ) : (
          <Bars3Icon className="h-7 w-7" />
        )}
      </button>
    </div>
  );
};

const MobileMenu: React.FC<{
  toggleMenu: () => void;
  children: React.ReactNode;
}> = ({ toggleMenu, children }) => {
  return (
    <div className="absolute right-0 top-16 flex h-[calc(100vh-64px)] w-full flex-col">
      <div className="bg-background  flex w-full grow flex-col gap-1 px-4 pb-2 sm:hidden">
        {routes.map((route, index) => (
          <Link
            key={index}
            href={route.href}
            onClick={toggleMenu}
            className={`hover:text-accent-foreground text-muted-foreground inline-flex h-10 w-full items-center text-sm transition-colors sm:w-auto`}
          >
            {route.title}
          </Link>
        ))}
        {children}
      </div>
      <div className="bg-background/60 h-screen w-full sm:hidden" />
    </div>
  );
};

export default Navbar;
```

Now in the `app/(main)/layout.tsx` replace the `<Navbar />` with:

```tsx
// app/(main)/layout.tsx

...
<Navbar>
  <AuthComponent />
</Navbar>
...

```

And now when you are logged in you should see a profile button and when you click on it it should show your email.

We are now finished with auth! Now it is time to start making mutations with trpc.

## Mutations with trpc

**Prisma**

I want to make it so once users login they can create a profile to add more information. To do this we need to create a new profile table in our database. To do this we need to update our prisma schema. In the `schema.prisma` file we need to set the provider to `postgresql` since we are using supabase. We also need to add whatever columns we want for our table. Mine looks like this:

```prisma
// prisma/prisma.schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum RoleType {
  FRONTEND
  BACKEND
  FULLSTACK
  DESIGN
}

model Profile {
  id        String   @id
  createdAt DateTime @default(now()) @map("created_at")
  email     String   @unique
  firstName String
  lastName  String
  role      RoleType
  skills    String[]
  bio       String
  github    String?
  linkedin  String?
  website   String?
}
```

To push these changes to your database run `npx prisma db push`. Now when you go to the table editor in the supabase dashboard you should see a new profile table. Prisma also has its own user interface called prisma studio. To open that up run `npx prisma studio`.

**Form**

Now we need a way for the user to create a new profile once they login. Before we build the form we need to create a zod schema to ensure the user's inputs are valid. To do this we need to add a new folder in the lib directory called validators. Inside validators add a new file called `newProfile.ts` and add the following code:

```ts
// lib/validators/newProfile.ts

import { z } from "zod";
import { RoleType } from "@prisma/client";

export const newProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.nativeEnum(RoleType),
  skills: z
    .object({ name: z.string().min(1) })
    .array()
    .min(1),
  bio: z.string().min(100).max(500),
  github: z.string(),
  linkedin: z.string(),
  website: z.union([z.literal(""), z.string().trim().url()]),
});
```

For the form we are going to be using a couple new shadcn components so lets import those. Run the following commands:

- `npx shadcn-ui@latest add card`
- `npx shadcn-ui@latest add select`
- `npx shadcn-ui@latest add textarea`

Now create a page at `app/(main)/profile/new/page.tsx` and add the following code:

```tsx
// app/(main)/profile/new/page.tsx

"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";

import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { newProfileSchema } from "@/lib/validators/newProfile";

import { TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export type NewProfileInput = z.infer<typeof newProfileSchema>;

export default function NewProfileForm() {
  const form = useForm<NewProfileInput>({
    resolver: zodResolver(newProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      role: undefined,
      skills: [{ name: "" }],
      bio: "",
      github: "",
      linkedin: "",
      website: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "skills",
  });

  const watchSkills = form.watch("skills");

  const router = useRouter();

  const onSubmit = async (data: NewProfileInput) => {
    console.log(data);
  };

  return (
    <div className="flex w-screen justify-center p-8">
      <Card className="border-border w-full max-w-2xl border">
        <CardHeader>
          <CardTitle>Create Profile</CardTitle>
          <CardDescription>Yabba dabba doo</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="text-muted-foreground flex w-full flex-1 flex-col justify-center gap-6"
            >
              <div className="flex flex-row gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="">First name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your first name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="">Last name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your last name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FULLSTACK">Full Stack</SelectItem>
                        <SelectItem value="FRONTEND">Frontend</SelectItem>
                        <SelectItem value="BACKEND">Backend</SelectItem>
                        <SelectItem value="DESIGN">Design</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {fields.map((field, index) => (
                        <div key={field.name}>
                          <div className="group relative flex items-center">
                            <FormControl>
                              <Input
                                placeholder="Your skill"
                                className="group-hover:pr-8"
                                {...form.register(
                                  `skills.${index}.name` as const
                                )}
                              />
                            </FormControl>
                            {fields.length > 1 && (
                              <TrashIcon
                                className="hover:text-muted-foreground/30 text-muted-foreground/40 invisible absolute right-1 h-6 w-6 hover:cursor-pointer group-hover:visible"
                                onClick={() => remove(index)}
                              />
                            )}
                          </div>

                          {form.formState.errors.skills?.[index]?.name && (
                            <p className="text-destructive text-sm font-medium">
                              This can't be empty
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      disabled={watchSkills.some((field) => !field.name)}
                      onClick={() => append({ name: "" })}
                      className="max-w-min"
                    >
                      Add Skill
                    </Button>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us a little bit about yourself"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-row gap-4">
                <FormField
                  control={form.control}
                  name="github"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Github Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Your github username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Linkedin Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your linkedin username"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="Your website url" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button variant="default" className="my-4 w-full" type="submit">
                Submit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Context and Private Procedure**

Now we have the form but we need to push this data to the database when the user submits it. To do that we need to create a new trpc procedure. Before we actually write the procedure there are a few things we need to add.

The first step is to add the userId to the trpc context. This will make things a lot quicker because it means we don't have to pass the userId from the client. For example if we want to get the current user's posts, instead of passing the current user id to the server, we can just call the function with no props and it already knows who the user is.

Navigate to the `server/api/trpc.ts` file and import the supabase client:

```ts
// server/api/trpc.ts

...
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
...
```

Now inside the `createTRPCContext` function we need to pass the userId to the context like this:

```ts
// server/api/trpc.ts

...
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const supabase = createClient(cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    user,
    db,
    ...opts,
  };
};
...
```

The next step is to create a new type of procedure called private procedure, which is a procedure that can only be called by authenticated users. This is helpful because it means that we know there is a userId for our queries. If we were to use a public procedure we would have to assert that we know the user is authenticated and handle that on the client which is a lot more complicated. To do this add the following code at the bottom of the file:

```ts
// server/api/trpc.ts

...
const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }

  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const privateProcedure = t.procedure.use(enforceUserIsAuthed);
...
```

**Procedure**

Now we can get started writing the procedure. Go to `server/api/routers` and you should see a `posts.ts` file. Delete that file and create a new one called `profiles.ts`. Inside that file add the following code:

```ts
// server/api/routers/profiles.ts

import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";

import { RoleType } from "@prisma/client";

export const profileRouter = createTRPCRouter({
  create: privateProcedure
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        role: z.nativeEnum(RoleType),
        skills: z.array(z.string()),
        bio: z.string(),
        github: z.string(),
        linkedin: z.string(),
        website: z.union([z.literal(""), z.string().trim().url()]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.profile.create({
        data: {
          id: ctx.user.id,
          email: ctx.user.email!,
          firstName: input.firstName,
          lastName: input.lastName,
          role: input.role,
          skills: input.skills,
          bio: input.bio,
          github: input.github,
          linkedin: input.linkedin,
          website: input.website,
        },
      });

      return user;
    }),
});
```

Now we need to expose this router to the client. Go to `server/api/root.ts` and add the following code:

```ts
// server/api/root.ts

import { profileRouter } from "@/server/api/routers/profiles";
import { createTRPCRouter } from "@/server/api/trpc";

export const appRouter = createTRPCRouter({
  profiles: profileRouter,
});

export type AppRouter = typeof appRouter;
```

Now we need to call the mutation on submit on form submission. Before we do that though, lets create a utility function to capitalize just the first letter of the string, so all of the names are uniform. In `lib/utils.ts` add the following function:

```ts
// lib/utils.ts

...

export function capitalizeFirstLetter(inputString: string) {
  const lowercaseString = inputString.toLowerCase();

  const capitalizedString =
    lowercaseString.charAt(0).toUpperCase() + lowercaseString.slice(1);

  return capitalizedString;
}

...
```

Now we can use our mutation. Add the following code to `app/(main)/profile/new/page.tsx`:

```tsx
// app/(main)/profile/new/page.tsx

const router = useRouter();

const { mutate } = api.profiles.create.useMutation({
  onSuccess: () => {
    router.push("/profile");
  },
  onError: (e) => {
    const errorMessage = e.data?.zodError?.fieldErrors.content;
    console.error("Error creating investment:", errorMessage);
  },
});

const onSubmit = async (data: NewProfileInput) => {
  const skillsList = data.skills.map((skill) => skill.name);
  mutate({
    firstName: capitalizeFirstLetter(data.firstName),
    lastName: capitalizeFirstLetter(data.lastName),
    role: data.role,
    skills: skillsList,
    bio: data.bio,
    github: data.github,
    linkedin: data.linkedin,
    website: data.website,
  });
};
```

Now when you submit the form you should be redirected to a profile page and when you check the table in supabase the new data should be there. Now that we have the data, let's make it so we can view it.

## Querying data

Go back to `server/api/routers/profiles.ts` and add the following query below your mutation:

```ts
// server/api/routers/profiles.ts

...
getCurrent: privateProcedure.query(async ({ ctx }) => {
  const profile = await ctx.db.profile.findUnique({
    where: { id: ctx.user.id! },
  });
  return profile;
}),
...
```

Create a new page in the profile folder and add the following code:

```tsx
// app/(main)/profile/page.tsx

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { capitalizeFirstLetter } from "@/lib/utils";
import { api } from "@/trpc/server";

export default async function ProfilePage() {
  const profile = await api.profiles.getCurrent.query();

  if (!profile) return null;

  return (
    <div className="flex w-full justify-center ">
      <Card className="mt-12 w-full max-w-xl">
        <CardHeader>
          <CardTitle>
            {profile.firstName} {profile.firstName}
          </CardTitle>
          <CardDescription>{profile.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Role: {capitalizeFirstLetter(profile.role)}</p>
        </CardContent>
        <CardContent className="flex items-center">
          <p className="pr-1">Skills:</p>
          {profile.skills.map((skill, index) => (
            <p
              key={index}
              className="border-border w-min rounded-full border px-2 py-0.5"
            >
              {skill}
            </p>
          ))}
        </CardContent>
        <CardContent>
          <p>Bio: {profile.bio}</p>
        </CardContent>
        <div className="flex">
          <CardContent>
            <p>Github: {profile.github}</p>
          </CardContent>
          <CardContent>
            <p>Linkedin: {profile.linkedin}</p>
          </CardContent>
          <CardContent>
            <p>Website: {profile.website}</p>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
```

This isn't styled very well, its just supposed to show how you can fetch the data on the server side with trpc. Notice that we are importing the api from the server folder not the react folder. This means we cant use hooks like usequery and usemutation because we are in a server component.

## Conclusion

This app doesn't really do anything, it is just supposed to get you started where everything is configured properly to design a cool web application. You can add to your prisma schema and start doing more complicated queries and mutations with the same principles used for just a simple profile.

All of the code for this project will be at this [repo](https://github.com/isaacdyor/t3-blog).

Thanks for reading!

P.S. If you are a software developer in college shoot me an email at isaac@dyor.com. I am going to start building a website for college students to find other developers in their area to build projects together. If you want to help me build it or use it or provide feedback or whatever I would love to chat.
