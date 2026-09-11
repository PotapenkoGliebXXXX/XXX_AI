/* =========================================================
   UI XXX_Ai
========================================================= */


export function getCurrentTime() {

    const now = new Date();

    const hours =
        String(now.getHours())
            .padStart(2, "0");

    const minutes =
        String(now.getMinutes())
            .padStart(2, "0");


    return `${hours}:${minutes}`;

}


/* =========================================================
   ЗАХИСТ ТЕКСТУ
========================================================= */

export function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* =========================================================
   ПОВІДОМЛЕННЯ
========================================================= */

export function renderMessage(
    chatElement,
    sender,
    text,
    time
) {

    const element =
        document.createElement("div");


    element.className =
        sender === "ai"
            ? "message ai-message"
            : "message user-message";


    element.innerHTML = `

        <div class="message-author">
            ${
                sender === "ai"
                    ? "XXX_Ai"
                    : "Ви"
            }
        </div>

        <div class="message-content">
            ${escapeHTML(text)}
        </div>

        <div class="message-time">
            ${time}
        </div>

    `;


    chatElement.appendChild(element);

}


/* =========================================================
   ОЧИСТИТИ
========================================================= */

export function clearChat(chatElement) {

    chatElement.innerHTML = "";

}


/* =========================================================
   ПРОКРУТКА
========================================================= */

export function scrollToBottom(chatElement) {

    chatElement.scrollTop =
        chatElement.scrollHeight;

}


/* =========================================================
   СПИСОК ЧАТІВ
========================================================= */

export function renderChatList(
    chatList,
    chats,
    activeChatId,
    onChatClick,
    onContextMenu
) {

    chatList.innerHTML = "";


    chats.forEach(chatItem => {

        const button =
            document.createElement("button");


        button.className =
            "chat-item";


        if (
            chatItem.id === activeChatId
        ) {

            button.classList.add("active");

        }


        button.textContent =
            chatItem.title;


        /*
            ЛІВА КНОПКА
        */

        button.addEventListener(
            "click",
            function() {

                onChatClick(
                    chatItem.id
                );

            }
        );


        /*
            ПКМ
        */

        button.addEventListener(
            "contextmenu",
            function(event) {

                event.preventDefault();

                event.stopPropagation();


                onContextMenu(
                    event,
                    chatItem.id
                );

            }
        );


        chatList.appendChild(button);

    });

}