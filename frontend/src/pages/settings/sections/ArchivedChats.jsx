import { useState } from "react";
import { Link } from "react-router";
import { useChat } from "@/hooks/useChat";
import { chatPath } from "@/services/chatDestination";
import { useNotice } from "@/context/NoticeContext";
import { Action, Card, Empty, Modal, More } from "../components/Controls";
import { downloadFile } from "../download";
export default function ArchivedChats() {
  const store = useChat();
  const { notify } = useNotice();
  const [remove, setRemove] = useState(null);
  const chats = store.conversations.filter((chat) => chat.archived);
  return (
    <>
      <Card
        title="History"
        action={
          chats.length > 0 && (
            <Action
              onClick={() => {
                store.archiveAll(false);
                notify("All conversations restored.");
              }}
            >
              Restore all
            </Action>
          )
        }
      >
        {chats.length ? (
          <div className="grid gap-3 py-1">
            {chats.map((chat) => (
              <div key={chat.id} className="settings-list-row">
                <Link
                  to={chatPath(chat.id)}
                  className="min-w-0 flex-1 truncate"
                  title={chat.title}
                >
                  {chat.title}
                </Link>
                <More label={`Actions for ${chat.title}`}>
                  <button
                    onClick={() => {
                      store.archive(chat.id, false);
                      notify("Conversation restored to the sidebar.");
                    }}
                  >
                    Restore chat
                  </button>
                  <button
                    onClick={() =>
                      downloadFile(`nito-chat-${chat.id}.json`, chat)
                    }
                  >
                    Download chat
                  </button>
                  <button
                    className="text-red-400!"
                    onClick={() => setRemove(chat)}
                  >
                    Delete chat
                  </button>
                </More>
              </div>
            ))}
          </div>
        ) : (
          <Empty>
            No archived chats yet. Use the archive button beside a conversation
            in the chat sidebar.
          </Empty>
        )}
      </Card>
      {remove && (
        <Modal title="Delete archived chat?" onClose={() => setRemove(null)}>
          <p className="text-sm">
            “{remove.title}” and all its tabs will be permanently removed from
            this browser.
          </p>
          <div className="settings-dialog-actions">
            <Action onClick={() => setRemove(null)}>Cancel</Action>
            <Action
              danger
              onClick={() => {
                store.remove(remove.id);
                setRemove(null);
                notify("Conversation deleted.");
              }}
            >
              Delete permanently
            </Action>
          </div>
        </Modal>
      )}
    </>
  );
}
