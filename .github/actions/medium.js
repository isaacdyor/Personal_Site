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
