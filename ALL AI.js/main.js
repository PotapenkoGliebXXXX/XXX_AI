import {
    think,
    countWords,
    MAX_WORDS
} from "./Ai Core.js";

import {
    saveChats,
    loadChats
} from "./storage.js";

import {
    getCurrentTime,
    renderMessage,
    renderChatList,
    clearChat,
    scrollToBottom
} from "./UI.js";


console.log("XXX_Ai v0.2 запускається...");


/* =========================================================
   ЕЛЕМЕНТИ
========================================================= */

const chat = document.querySelector("#chat");
const input = document.querySelector("#messageInput");
const sendButton = document.querySelector("#sendButton");

const newChatButton =
    document.querySelector("#newChatButton");

const toggleChats =
    document.querySelector("#toggleChats");

const chatsPanel =
    document.querySelector(".chats-panel");

const chatList =
    document.querySelector("#chatList");


/* =========================================================
   МЕНЮ ПКМ
========================================================= */

const contextMenu =
    document.querySelector("#chatContextMenu");

const renameChatButton =
    document.querySelector("#renameChatButton");

const deleteChatButton =
    document.querySelector("#deleteChatButton");


/* =========================================================
   ПЕРЕВІРКА ЕЛЕМЕНТІВ
========================================================= */

console.log("chat:", chat);
console.log("input:", input);
console.log("sendButton:", sendButton);
console.log("newChatButton:", newChatButton);
console.log("contextMenu:", contextMenu);


/* =========================================================
   НАЛАШТУВАННЯ
========================================================= */

const MAX_CHATS = 10;

let chats = [];

let activeChatId = null;

let selectedChatId = null;


/* =========================================================
   ID
========================================================= */

function createId() {

    return Date.now().toString() +
        Math.random().toString(16).slice(2);

}


/* =========================================================
   АКТИВНИЙ ЧАТ
========================================================= */

function getActiveChat() {

    return chats.find(
        chatItem =>
            chatItem.id === activeChatId
    );

}


/* =========================================================
   ПОКАЗАТИ АКТИВНИЙ ЧАТ
========================================================= */

function renderActiveChat() {

    const activeChat =
        getActiveChat();


    if (!activeChat) {
        return;
    }


    clearChat(chat);


    activeChat.messages.forEach(message => {

        renderMessage(
            chat,
            message.sender,
            message.text,
            message.time
        );

    });


    scrollToBottom(chat);

}


/* =========================================================
   ОБНОВИТИ СПИСОК ЧАТІВ
========================================================= */

function updateChatList() {

    renderChatList(
        chatList,
        chats,
        activeChatId,

        function(chatId) {

            activeChatId = chatId;

            saveChats(chats);

            updateChatList();

            renderActiveChat();

        },

        openContextMenu
    );

}


/* =========================================================
   НОВИЙ ЧАТ
========================================================= */

function createNewChat() {

    if (chats.length >= MAX_CHATS) {

        alert("Досягнуто ліміт у 10 чатів.");

        return;

    }


    const newChat = {

        id: createId(),

        title: "Новий чат",

        messages: [

            {

                sender: "ai",

                text:
                    "Привіт! Я XXX_Ai. Чим можу допомогти?",

                time: getCurrentTime()

            }

        ]

    };


    chats.unshift(newChat);

    activeChatId =
        newChat.id;


    saveChats(chats);

    updateChatList();

    renderActiveChat();

}


/* =========================================================
   ДОДАТИ ПОВІДОМЛЕННЯ
========================================================= */

function addMessage(sender, text) {

    const activeChat =
        getActiveChat();


    if (!activeChat) {
        return;
    }


    activeChat.messages.push({

        sender: sender,

        text: text,

        time: getCurrentTime()

    });


    saveChats(chats);

    renderActiveChat();

}


/* =========================================================
   ВІДПРАВИТИ ПОВІДОМЛЕННЯ
========================================================= */

function sendMessage() {

    const message =
        input.value.trim();


    if (!message) {
        return;
    }


    const wordCount =
        countWords(message);


    if (wordCount > MAX_WORDS) {

        addMessage(
            "ai",
            `Повідомлення занадто довге. Максимум зараз — ${MAX_WORDS} слів.`
        );

        return;

    }


    addMessage(
        "user",
        message
    );


    /*
        Якщо це перше повідомлення,
        воно стає назвою чату.
    */

    const activeChat =
        getActiveChat();


    if (
        activeChat &&
        activeChat.messages.length === 2
    ) {

        activeChat.title =
            message.length > 22
                ? message.slice(0, 22) + "..."
                : message;


        saveChats(chats);

        updateChatList();

    }


    input.value = "";

    input.focus();


    setTimeout(() => {

        const answer =
            think(message);


        addMessage(
            "ai",
            answer
        );

    }, 150);

}


/* =========================================================
   КНОПКА ВІДПРАВКИ
========================================================= */

sendButton.addEventListener(
    "click",
    function(event) {

        event.preventDefault();

        sendMessage();

    }
);


/* =========================================================
   ENTER
========================================================= */

input.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            sendMessage();

        }

    }
);


/* =========================================================
   НОВИЙ ЧАТ
========================================================= */

newChatButton.addEventListener(
    "click",
    function() {

        createNewChat();

        input.focus();

    }
);


/* =========================================================
   ЗГОРТАННЯ ЧАТІВ
========================================================= */

toggleChats.addEventListener(
    "click",
    function() {

        chatsPanel.classList.toggle(
            "collapsed"
        );


        if (
            chatsPanel.classList.contains(
                "collapsed"
            )
        ) {

            toggleChats.textContent = "▼";

        } else {

            toggleChats.textContent = "▲";

        }

    }
);


/* =========================================================
   ВІДКРИТТЯ МЕНЮ ПКМ
========================================================= */

function openContextMenu(
    event,
    chatId
) {

    selectedChatId = chatId;


    contextMenu.style.display =
        "block";


    contextMenu.style.left =
        `${event.clientX}px`;


    contextMenu.style.top =
        `${event.clientY}px`;

}


/* =========================================================
   ЗАКРИТТЯ МЕНЮ
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        if (
            !contextMenu.contains(event.target)
        ) {

            contextMenu.style.display =
                "none";

        }

    }
);


/* =========================================================
   ПЕРЕЙМЕНУВАННЯ
========================================================= */

renameChatButton.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();


        const selectedChat =
            chats.find(
                chatItem =>
                    chatItem.id === selectedChatId
            );


        if (!selectedChat) {
            return;
        }


        const newName =
            prompt(
                "Нова назва чату:",
                selectedChat.title
            );


        if (newName === null) {
            return;
        }


        const cleanName =
            newName.trim();


        if (!cleanName) {
            return;
        }


        selectedChat.title =
            cleanName;


        saveChats(chats);

        updateChatList();


        contextMenu.style.display =
            "none";

    }
);


/* =========================================================
   ВИДАЛЕННЯ
========================================================= */

deleteChatButton.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();


        if (!selectedChatId) {
            return;
        }


        chats =
            chats.filter(
                chatItem =>
                    chatItem.id !== selectedChatId
            );


        contextMenu.style.display =
            "none";


        if (chats.length === 0) {

            createNewChat();

            return;

        }


        if (activeChatId === selectedChatId) {

            activeChatId =
                chats[0].id;

        }


        selectedChatId = null;


        saveChats(chats);

        updateChatList();

        renderActiveChat();

    }
);


/* =========================================================
   ЗАВАНТАЖЕННЯ
========================================================= */

function startApp() {

    chats =
        loadChats();


    if (chats.length === 0) {

        createNewChat();

        return;

    }


    activeChatId =
        chats[0].id;


    updateChatList();

    renderActiveChat();

}


startApp();


console.log("XXX_Ai готовий!");