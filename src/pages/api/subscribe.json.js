// // api/subscribe.js

export async function POST({ request }) {
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({
        message: "Only post requests are allowed!",
      }),
      { status: 405 }
    );
  }

  const data = await request.json();

  const email = data.email;

  if (!email) {
    return new Response(
      JSON.stringify({
        message: "Missing required fields",
      }),
      { status: 400 }
    );
  }

  // const email = "efcisaac7@gmail.com";

  const publicationId = import.meta.env.BEEHIIV_PUBLICATION_ID;
  const apiKey = import.meta.env.BEEHIIV_API_KEY;
  const url = `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`;

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: `{"email":"${email}"}`,
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return new Response(
      JSON.stringify({
        message: "Success!",
        data: data,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Internal Server Error!",
        data: error,
      }),
      { status: 500 }
    );
  }
}
