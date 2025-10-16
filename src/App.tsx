import { useEffect, useRef, useState } from "react";
import "./App.css";
import { io, Socket } from "socket.io-client";

function App() {
  const [socket] = useState<Socket>(() =>
    io("https://socket-io-server-1-kkw2.onrender.com")
  );
  const [join, setJoin] = useState("");
  const [input, setInput] = useState("");
  const [pTags, setPTags] = useState<{ id: number; text: string }[]>([]);

  const lastMessageRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const handleConnect = () => {
      setJoin(socket.id ?? "");
      console.log("Connected with id:", socket.id);
      socket.emit("welcome", `${socket.id} has joined the chat.`);
    };

    const handleWelcome = (message: string) => {
      console.log("Server says:", message);
    };

    const handleNewMessage = (um: string) => {
      setPTags((prev) => [...prev, { id: Date.now(), text: um }]);
    };

    socket.on("connect", handleConnect);
    socket.on("welcome", handleWelcome);
    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("welcome", handleWelcome);
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [pTags]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setPTags((prev) => [...prev, { id: Date.now(), text: trimmed }]);

    socket.emit("message", {
      room: "general",
      msg: `${socket.id} => ${trimmed}`,
    });

    setInput("");
  };

  return (
    <>
      <div className="container">
        {join && <p className="user-joined">{join} has joined</p>}
        {pTags.map((paragraph, index) => (
          <p
            key={paragraph.id}
            ref={index === pTags.length - 1 ? lastMessageRef : null}
            style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
          >
            {paragraph.text}
          </p>
        ))}
      </div>

      <div className="input-container">
        <input
          value={input}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          onChange={handleInput}
          className="input"
          type="text"
          placeholder="Enter your message"
        />
        <button onClick={handleSubmit} className="bttn" type="submit">
          Send
        </button>
      </div>
    </>
  );
}

export default App;
