export default {
  async fetch(request, env, ctx) {
    // Only handle WebSocket upgrade requests
    if (request.headers.get("Upgrade") === "websocket") {
      const [client, server] = Object.values(new WebSocketPair());
      server.accept();

      server.addEventListener("message", (event) => {
        // Broadcast logic can go here (Durable Object for multi-user)
        server.send(JSON.stringify({
          type: "receive_message",
          data: event.data
        }));
      });

      return new Response(null, { status: 101, webSocket: client });
    }

    return new Response("Chat backend running!", { status: 200 });
  },
};
