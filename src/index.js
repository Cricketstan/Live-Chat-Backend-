export default {
  async fetch(request, env) {
    if (request.headers.get("Upgrade") === "websocket") {
      // Route WebSocket to Durable Object
      const id = env.CHATROOM.idFromName(env.ROOM_NAME);
      const obj = env.CHATROOM.get(id);
      return obj.fetch(request);
    }
    return new Response("Chat server running!");
  },
};

export class ChatRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.clients = [];
  }

  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected websocket", { status: 400 });
    }

    const [client, server] = Object.values(new WebSocketPair());
    server.accept();

    this.clients.push(server);

    server.addEventListener("message", (event) => {
      // Broadcast message to everyone
      for (const ws of this.clients) {
        try {
          ws.send(JSON.stringify({
            type: "receive_message",
            data: event.data
          }));
        } catch (err) {
          console.error("Send failed", err);
        }
      }
    });

    server.addEventListener("close", () => {
      this.clients = this.clients.filter(ws => ws !== server);
    });

    return new Response(null, { status: 101, webSocket: client });
  }
}
