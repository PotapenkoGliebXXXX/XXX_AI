/* =========================================================
   ЗБЕРЕЖЕННЯ ЧАТІВ
========================================================= */

const STORAGE_KEY = "XXX_Ai_chats";


/* =========================================================
   ЗБЕРЕГТИ
========================================================= */

export function saveChats(chats) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(chats)
    );

}


/* =========================================================
   ЗАВАНТАЖИТИ
========================================================= */

export function loadChats() {

    const saved =
        localStorage.getItem(STORAGE_KEY);


    if (!saved) {

        return [];

    }


    try {

        return JSON.parse(saved);

    } catch (error) {

        console.error(
            "Помилка завантаження чатів:",
            error
        );

        return [];

    }

}