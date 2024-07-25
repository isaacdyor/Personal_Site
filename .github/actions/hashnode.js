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
      publicationId: "668fd7385b543a5085e8ef98",
      title: frontMatter.title,
      contentMarkdown: content,
      tags: [
        {
          id: "56744723958ef13879b9549b",
          slug: "testing",
          name: "Testing",
        },
      ],
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
      throw new Error(`HTTP error! status: ${response.status}`);
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
