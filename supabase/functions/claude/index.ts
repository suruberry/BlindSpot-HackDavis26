const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY")

  if (!apiKey) {
    return Response.json(
      { error: { message: "ANTHROPIC_API_KEY is not configured" } },
      { status: 500, headers: corsHeaders },
    )
  }

  try {
    const body = await req.json()

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        ...body,
        model: "claude-sonnet-4-6",
      }),
    })

    const data = await anthropicResponse.json()

    return Response.json(data, {
      status: anthropicResponse.status,
      headers: corsHeaders,
    })
  } catch (error) {
    return Response.json(
      { error: { message: error instanceof Error ? error.message : "Claude request failed" } },
      { status: 500, headers: corsHeaders },
    )
  }
})
