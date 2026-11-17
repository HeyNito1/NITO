import { settingsStore } from "./settingsStore";
import { replyToChat } from "./chatService";

const STORAGE_KEY = "nito.chats.v2";
const listeners = new Set();
const requests = new Map();

const id = () => crypto.randomUUID();
const emptyDraft = () => ({ text: "", attachments: [] });

const newTab = () => ({
  id: id(),
  title: "New tab",
  category: "general",
  messages: [],
  draft: emptyDraft(),
});

function attachment(value) {
  return {
    name: value.name,
    size: value.size,
    type: value.type,
    file: value.file || (value instanceof File ? value : undefined),
  };
}

function cleanAttachments(files) {
  return Array.isArray(files)
    ? files.filter((file) => typeof file?.name === "string").map(attachment)
    : [];
}

function readSaved() {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ??
      localStorage.getItem("nito.chats.v1");

    const saved = JSON.parse(raw || "[]");

    if (!Array.isArray(saved)) return [];

    return saved
      .filter(
        (chat) =>
          typeof chat?.id === "string" && typeof chat.title === "string",
      )
      .map((chat) => {
        const source =
          Array.isArray(chat.tabs) && chat.tabs.length
            ? chat.tabs
            : [
                {
                  id: `legacy-${chat.id}`,
                  title: chat.title,
                  category: chat.category,
                  messages: chat.messages || [],
                },
              ];

        const tabs = source.map((tab) => ({
          id: typeof tab.id === "string" ? tab.id : id(),
          title: typeof tab.title === "string" ? tab.title : "New tab",
          category: tab.category || "general",
          draft: {
            text: typeof tab.draft?.text === "string" ? tab.draft.text : "",
            attachments: cleanAttachments(tab.draft?.attachments),
          },
          messages: (Array.isArray(tab.messages) ? tab.messages : [])
            .filter(
              (message) =>
                typeof message?.id === "string" &&
                ["user", "assistant"].includes(message.role) &&
                typeof message.text === "string",
            )
            .map((message) => ({
              ...message,
              attachments: cleanAttachments(message.attachments),
              ...(message.status === "pending"
                ? {
                    status: "error",
                    text: "This reply was interrupted by a refresh. Please retry.",
                  }
                : {}),
            })),
        }));

        return {
          id: chat.id,
          title: chat.title,
          createdAt: chat.createdAt || Date.now(),
          archived: Boolean(chat.archived),
          tabs,
          activeTabId: tabs.some((tab) => tab.id === chat.activeTabId)
            ? chat.activeTabId
            : tabs[0].id,
        };
      });
  } catch {
    return [];
  }
}

let snapshot = {
  conversations: readSaved(),
  storageError: "",
};

function publish(conversations) {
  let storageError = "";

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(conversations, (key, value) =>
        key === "file" ? undefined : value,
      ),
    );
  } catch {
    storageError =
      "Browser storage is unavailable or full. New messages will last only while this page stays open.";
  }

  snapshot = { conversations, storageError };
  listeners.forEach((listener) => listener());
}

function findChat(chatId) {
  return snapshot.conversations.find((chat) => chat.id === chatId);
}

function findTab(chatId, tabId) {
  const chat = findChat(chatId);

  return chat?.tabs.find((tab) => tab.id === (tabId || chat.activeTabId));
}

function updateChat(chatId, change) {
  if (!findChat(chatId)) return;

  publish(
    snapshot.conversations.map((chat) =>
      chat.id === chatId ? change(chat) : chat,
    ),
  );
}

function updateTab(chatId, tabId, change) {
  updateChat(chatId, (chat) => ({
    ...chat,
    tabs: chat.tabs.map((tab) => (tab.id === tabId ? change(tab) : tab)),
  }));
}

async function respond(chatId, tabId, responseId) {
  const tab = findTab(chatId, tabId);
  if (!tab) return;

  const controller = new AbortController();
  requests.set(tabId, { chatId, controller });

  function finish(status, text) {
    updateTab(chatId, tabId, (item) => ({
      ...item,
      messages: item.messages.map((message) =>
        message.id === responseId ? { ...message, status, text } : message,
      ),
    }));
  }

  try {
    const text = await replyToChat(
      {
        category: tab.category,
        messages: tab.messages.filter(
          (message) =>
            !["pending", "error", "stopped"].includes(message.status),
        ),
      },
      { signal: controller.signal },
    );

    if (!controller.signal.aborted) {
      finish("complete", text);
      const prefs = settingsStore.getSnapshot().data.notifications;
      if (
        prefs.finished &&
        document.hidden &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        try {
          new Notification("NITO response ready", {
            body: "Your response is ready in NITO.",
          });
        } catch {
          /* Browser may not support desktop notifications. */
        }
      }
    }
  } catch (error) {
    if (!controller.signal.aborted) {
      finish("error", error.message);
    }
  } finally {
    if (requests.get(tabId)?.controller === controller) {
      requests.delete(tabId);
    }
  }
}

export const chatStore = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot() {
    return snapshot;
  },

  create() {
    const tab = newTab();

    const chat = {
      id: id(),
      title: "New conversation",
      createdAt: Date.now(),
      tabs: [tab],
      activeTabId: tab.id,
    };

    publish([chat, ...snapshot.conversations]);
    return chat.id;
  },

  addTab(chatId) {
    const tab = newTab();

    updateChat(chatId, (chat) => ({
      ...chat,
      tabs: [...chat.tabs, tab],
      activeTabId: tab.id,
    }));
  },

  selectTab(chatId, tabId) {
    if (!findTab(chatId, tabId)) return;

    updateChat(chatId, (chat) => ({
      ...chat,
      activeTabId: tabId,
    }));
  },

  removeTab(chatId, tabId) {
    const chat = findChat(chatId);

    if (!chat || chat.tabs.length < 2 || !findTab(chatId, tabId)) {
      return;
    }

    requests.get(tabId)?.controller.abort();
    requests.delete(tabId);

    const index = chat.tabs.findIndex((tab) => tab.id === tabId);

    const tabs = chat.tabs.filter((tab) => tab.id !== tabId);

    updateChat(chatId, (item) => ({
      ...item,
      tabs,
      activeTabId:
        item.activeTabId === tabId
          ? tabs[Math.max(0, index - 1)].id
          : item.activeTabId,
    }));
  },

  setDraft(chatId, tabId, patch) {
    updateTab(chatId, tabId, (tab) => ({
      ...tab,
      draft: {
        ...tab.draft,
        ...patch,
        ...(patch.attachments
          ? {
              attachments: cleanAttachments(patch.attachments),
            }
          : {}),
      },
    }));
  },

  setCategory(chatId, tabId, category) {
    updateTab(chatId, tabId, (tab) => ({
      ...tab,
      category,
    }));
  },

  send({ chatId, tabId, text, category, attachments = [] }) {
    text = text.trim();

    if (!text || text.length > 4000) return null;

    let chat = findChat(chatId);
    if (chatId && !chat) return null;

    if (!chat) {
      const tab = newTab();

      chat = {
        id: id(),
        title: text.slice(0, 55),
        createdAt: Date.now(),
        tabs: [tab],
        activeTabId: tab.id,
      };
    }

    const tab = chat.tabs.find(
      (item) => item.id === (tabId || chat.activeTabId),
    );

    if (!tab || requests.has(tab.id)) return null;

    const settings = settingsStore.getSnapshot().data;
    const member = settings.family.find(
      (item) => item.id === settings.activeFamilyId,
    );
    if (member) {
      const selectedCategory = category || tab.category;
      if (member.blocked.includes(selectedCategory))
        throw new Error(
          `${selectedCategory} is disabled in the active family profile.`,
        );
      const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });
      const count = snapshot.conversations
        .flatMap((item) => item.tabs.flatMap((thread) => thread.messages))
        .filter(
          (m) =>
            m.role === "user" &&
            m.familyId === member.id &&
            new Date(m.createdAt || 0).toLocaleDateString("en-CA", {
              timeZone: "Asia/Kolkata",
            }) === today,
        ).length;
      if (count >= member.dailyLimit)
        throw new Error(
          "Daily message limit reached for the active family profile.",
        );
    }
    const familyId = member?.id;

    const responseId = id();

    const nextTab = {
      ...tab,
      title: tab.messages.length ? tab.title : text.slice(0, 55),
      category: category || tab.category,
      draft: emptyDraft(),
      messages: [
        ...tab.messages,
        {
          id: id(),
          role: "user",
          createdAt: Date.now(),
          familyId,
          text,
          attachments: cleanAttachments(attachments),
        },
        {
          id: responseId,
          role: "assistant",
          createdAt: Date.now(),
          text: "",
          status: "pending",
          attachments: [],
        },
      ],
    };

    const isFirstMessage = chat.tabs.every(
      (item) => !item.messages.some((message) => message.role === "user"),
    );

    const nextChat = {
      ...chat,
      title: isFirstMessage ? text.slice(0, 55) : chat.title,
      tabs: chat.tabs.map((item) => (item.id === tab.id ? nextTab : item)),
      activeTabId: tab.id,
    };

    publish([
      nextChat,
      ...snapshot.conversations.filter((item) => item.id !== chat.id),
    ]);

    void respond(chat.id, tab.id, responseId);
    return chat.id;
  },

  retry(chatId, tabId) {
    const tab = findTab(chatId, tabId);
    const last = tab?.messages.at(-1);

    if (
      !tab ||
      requests.has(tab.id) ||
      !["error", "stopped"].includes(last?.status)
    ) {
      return;
    }

    updateTab(chatId, tab.id, (item) => ({
      ...item,
      messages: item.messages.map((message) =>
        message.id === last.id
          ? { ...message, text: "", status: "pending" }
          : message,
      ),
    }));

    void respond(chatId, tab.id, last.id);
  },

  stop(chatId, tabId) {
    const tab = findTab(chatId, tabId);
    if (!tab) return;

    requests.get(tab.id)?.controller.abort();
    requests.delete(tab.id);

    updateTab(chatId, tab.id, (item) => ({
      ...item,
      messages: item.messages.map((message) =>
        message.status === "pending"
          ? {
              ...message,
              status: "stopped",
              text: "Response stopped.",
            }
          : message,
      ),
    }));
  },

  archive(chatId, archived = true) {
    updateChat(chatId, (chat) => ({ ...chat, archived }));
  },

  archiveAll(archived = true) {
    publish(snapshot.conversations.map((chat) => ({ ...chat, archived })));
  },

  clear() {
    for (const request of requests.values()) request.controller.abort();
    requests.clear();
    try {
      localStorage.removeItem("nito.chats.v1");
    } catch {
      /* publish reports storage failures. */
    }
    publish([]);
  },

  remove(chatId) {
    for (const [tabId, request] of requests) {
      if (request.chatId === chatId) {
        request.controller.abort();
        requests.delete(tabId);
      }
    }

    publish(snapshot.conversations.filter((chat) => chat.id !== chatId));
  },
};
