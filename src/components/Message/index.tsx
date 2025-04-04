import ReactDom from "react-dom/client";
import "./index.css";

interface MessageProps {
  message: string;
}

const Message = ({ message }: MessageProps) => {
  return (
    <div>
      <span className="message">{message}</span>
    </div>
  );
};
interface Item {
  root: ReactDom.Root;
  MessageContainer: HTMLDivElement;
}
declare global {
  interface Window {
    onShow: (info: { time: number; message: string }) => void;
  }
}
const MessageContainerStack: Item[] = [];

Message.show = (info: { time: number; message: string }) => {
  const { time, message } = info;
  const MessageContainer = document.createElement("div");
  MessageContainer.className = "message-container";
  MessageContainer.style.top = `${MessageContainerStack.length * 64}px`;
  document.body.appendChild(MessageContainer);
  const root = ReactDom.createRoot(MessageContainer);
  root.render(<Message message={message} />);
  MessageContainerStack.push({
    root,
    MessageContainer,
  });
  setTimeout(() => {
    const item = MessageContainerStack.find(
      (item) => item.MessageContainer === MessageContainer
    )!;
    item.root.unmount();
    document.body.removeChild(MessageContainer);
    MessageContainerStack.splice(MessageContainerStack.indexOf(item), 1);
  }, time);
};

export default Message;
