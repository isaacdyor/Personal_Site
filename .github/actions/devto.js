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
