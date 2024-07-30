---
layout: ../../layouts/post.astro
title: How to programmatically post your personal blogs to Dev.to, Hashnode, and Medium with Github actions.
description: Posting to different blogging websites with github actions
date: 2024-07-30
tags: []
canonical_url: https://isaac.dyor.com/post/auto-blogger
---

## The reason

This article details how you can post the blogs from your personal site to external sites like Dev.to, Hashnode, or Medium. Now why would you want to do this? I think that the main reason that this is valuable is so that you can own your own content and develop your personal brand while also improving SEO and expanding your reach.

For me personally (and i have heard this sentiment before), when you read an article and it is written on someone's personal site, you are far more likely to explore the site and learn more about them. If I read an article on Dev.to, I won't check out the other articles on their page. If you would like to read more on why owning your own content is valuable I would check out this article: [Own your own content](https://yieldcode.blog/post/own-your-content/), it convinced me to start my own personal blog instead of continuing to post on Dev.to.

I think the problem with just posting on your own personal website is that nobody reads it. Unless you already have a strong audience of people who are interested in what you are reading you will most likely be writing into a black hole. I think that having your writing read by people is extremely important because you can see what resonates with people, and in my opinion it is a big motivator to continue writing. I wrote a simple article on Dev.to that got like 200 likes and that definitely inspired me to keep writing.

So how do you effectively balance using these external platforms to get your work in front of people while also owning your own content and developing your personal brand? I think the simplest and most effective way to do this is to automatically post the blogs from your personal sites onto these external sites so you don't have to think about it. This is really easily done with Github actions.

## Setting Up Github Actions

The first step is to create a `.github` folder in your root directory. This is where we will define our workflows and actions. Inside this folder create two new folders: `workflows` and `actions`. The workflow will check if there are any new files in our posts folder, and if there are it will call our parse action defined in the actions folder. The parse action calls actions for each platform we want to post to.

## Creating our workflow

There are a few things we need to do in our workflow:

- Define environment variables
- Find new files
- Run parse action for each new file

Here is how I implemented it (if your posts are not in src/content/post you should change the path to match your specific path)

```yaml
name: New Blog Post Action

on:
  push:
    branches:
      - main
    paths:
      - "src/content/post/**"

jobs:
  process-new-post:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Identify new files
        id: new-files
        run: |
          NEW_FILES=$(git diff --name-only --diff-filter=A ${{ github.event.before }} ${{ github.sha }} -- src/content/post/)
          echo "New files: $NEW_FILES"
          echo "new_files=$NEW_FILES" >> $GITHUB_OUTPUT
      - name: Process new files
        if: steps.new-files.outputs.new_files != ''
        env:
          HASHNODE_API_KEY: ${{ secrets.HASHNODE_API_KEY }}
          HASHNODE_PUBLICATION_ID: ${{ secrets.HASHNODE_PUBLICATION_ID }}
          DEVTO_API_KEY: ${{ secrets.DEVTO_API_KEY }}
          MEDIUM_API_KEY: ${{ secrets.MEDIUM_API_KEY }}
          MEDIUM_AUTHOR_ID: ${{ secrets.MEDIUM_AUTHOR_ID }}
        run: |
          echo "Debug: Entering Process new files step"
          echo "New files detected: ${{ steps.new-files.outputs.new_files }}"

          IFS=$'\n'
          for file in ${{ steps.new-files.outputs.new_files }}; do
            echo "Processing file: $file"
            
            node .github/actions/parse.js "$file"
          done
```

To make sure this works correctly we need to define these environment variables in our project under secrets. Go to your project on Github and go to settings. Then select the dropdown for secrets and variables and select actions. There you can define your secrets and access them in your actions using normal `process.env.VARIABLE` syntax.

## Parse

Now that our action has recognized the new files we need to parse the content and metadata from the file. We do this by creating a `parse.js` file inside our `.github/actions/` folder. Add the following code:

```js
// .github/actions/parse.js

import { promises as fs } from "fs";
import postToDevTo from "./devto.js";
import postToHashnode from "./hashnode.js";
import postToMedium from "./medium.js";

const getFrontMatterAndBody = (markdown) => {
  const charactersBetweenGroupedHyphens = /^---([\s\S]*?)---\s*([\s\S]*)/;
  const matched = markdown.match(charactersBetweenGroupedHyphens);

  if (!matched) {
    return { frontmatter: {}, body: markdown };
  }

  const metadata = matched[1];
  const body = matched[2];

  const metadataLines = metadata.split("\n");
  const frontmatter = metadataLines.reduce((accumulator, line) => {
    const [key, ...value] = line.split(":").map((part) => part.trim());

    if (key)
      accumulator[key] = value.length > 1 ? value.join(":") : value.join("");
    return accumulator;
  }, {});

  return { frontmatter, body };
};

async function postToBlogs(filePath) {
  // Read the markdown file
  const content = await fs.readFile(filePath, "utf8");

  // Extract the front matter and body from the markdown file
  const { frontmatter, body } = getFrontMatterAndBody(content);

  await postToDevTo(frontmatter, body);
  await postToHashnode(frontmatter, body);
  await postToMedium(frontmatter, body);
}

// Get the file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
  process.stderr.write("Please provide a file path\n");
  process.exit(1);
}

postToBlogs(filePath);
```

Now we can define an action for each platform we want to post to. If you want to add more platforms, like posting a link to your blog on twitter or something, you can just define another action and call it in this file.

## Posting to platforms

Now we just need to follow the documentation of the APIs for the platforms we want to post to. If you have set up the rest of the project correctly, the following code should work for Dev.to, Hashnode, and Medium:

```js
// .github/actions/devto.js

export default async function postToDevTo(frontMatter, body) {
  try {
    // Prepare the request body
    const postData = JSON.stringify({
      article: {
        title: frontMatter.title,
        body_markdown: body,
        published: true,
        tags: frontMatter.title,
        canonical_url: frontMatter.canonical_url,
      },
    });

    // Prepare the request headers
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("api-key", process.env.DEVTO_API_KEY);

    // Prepare the request options
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: postData,
      redirect: "follow",
    };

    const response = await fetch("https://dev.to/api/articles", requestOptions);
    return response;
  } catch (error) {
    process.stderr.write(`Error in postToDevTo: ${error.message}\n`);
  }
}
```

```js
// .github/actions/hashnode.js

export default async function postToHashnode(frontMatter, content) {
  const graphqlEndpoint = "https://gql.hashnode.com";
  const authToken = process.env.HASHNODE_API_KEY;

  const mutation = `
    mutation PublishPost($input: PublishPostInput!) {
      publishPost(input: $input) {
        post {
          id
          title
          slug
          url
        }
      }
    }
  `;

  const variables = {
    input: {
      publicationId: process.env.HASHNODE_PUBLICATION_ID,
      title: frontMatter.title,
      contentMarkdown: content,
      originalArticleURL: frontMatter.canonical_url,
    },
  };

  try {
    const response = await fetch(graphqlEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
      body: JSON.stringify({
        query: mutation,
        variables: variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error!: ${response.body}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
    }

    const post = result.data.publishPost.post;
    return post;
  } catch (error) {
    process.stderr.write(`Error in postToHashnode: ${error.message}\n`);
  }
}
```

```js
// .github/actions/medium.js

export default async function postToMedium(frontMatter, body) {
  try {
    // Prepare the request body
    const postData = JSON.stringify({
      title: frontMatter.title,
      contentFormat: "markdown",
      content: body,
      tags: frontMatter.tags,
      publishStatus: "public",
      canonicalUrl: frontMatter.canonical_url,
    });

    // Prepare the request headers
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${process.env.MEDIUM_API_KEY}`);

    // Prepare the request options
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: postData,
      redirect: "follow",
    };

    // Make the API request using fetch
    const response = await fetch(
      `https://api.medium.com/v1/users/${process.env.MEDIUM_AUTHOR_ID}/posts`,
      requestOptions
    );
    return response;
  } catch (error) {
    process.stderr.write(`Error in postToMedium: ${error.message}\n`);
  }
}
```

Now when you add your new blog post to the `src/content/post` folder this workflow will be called, which posts to these three platforms. You can check out the source code for my personal website [here](https://github.com/isaacdyor/Personal_Site), which has all of this implemented. Feel free to fork it and use it as your own if you want a base for starting your own personal site!
