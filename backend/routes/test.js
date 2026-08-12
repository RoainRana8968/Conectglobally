 // Replace with your actual key

async function test() {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: "Say hello.",
          },
        ],
      }),
    });

    console.log("Status:", response.status);
    console.log(await response.text());
  } catch (err) {
    console.error(err);
  }
}

test();