/* =========================================================
   XXX_Ai — AI CORE v0.2
   Власний генеративний двигун

   Завдання:
   - аналізувати повідомлення
   - розуміти мову
   - визначати намір
   - враховувати контекст
   - генерувати нові відповіді
   - виконувати точні математичні операції

   ВАЖЛИВО:
   Це НЕ ChatGPT.
   Це власний експериментальний AI Engine.
========================================================= */


/* =========================================================
   НАЛАШТУВАННЯ
========================================================= */

export const MAX_WORDS = 20;

const MAX_CONTEXT_MESSAGES = 12;

const random = array => {
    return array[Math.floor(Math.random() * array.length)];
};


/* =========================================================
   КОНТЕКСТ РОЗМОВИ
========================================================= */

const conversations = new Map();


function getConversation(chatId = "default") {

    if (!conversations.has(chatId)) {
        conversations.set(chatId, []);
    }

    return conversations.get(chatId);
}


function addToConversation(chatId, role, text) {

    const conversation = getConversation(chatId);

    conversation.push({
        role,
        text,
        time: Date.now()
    });

    if (conversation.length > MAX_CONTEXT_MESSAGES) {
        conversation.shift();
    }
}


/* =========================================================
   КІЛЬКІСТЬ СЛІВ
========================================================= */

export function countWords(text) {

    return text
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;
}


/* =========================================================
   ЧИСЛА
========================================================= */

function extractNumbers(text) {

    return (
        text.match(/-?\d+(?:[.,]\d+)?/g) || []
    ).map(number =>
        Number(number.replace(",", "."))
    );
}


/* =========================================================
   МОВА
========================================================= */

function detectLanguage(text) {

    const lower = text.toLowerCase();

    const ukrainian = [
        "привіт",
        "дякую",
        "будь",
        "ласка",
        "хочу",
        "можу",
        "треба",
        "потрібно",
        "чому",
        "як",
        "який",
        "яка",
        "яке",
        "це",
        "мені",
        "тобі",
        "зробити",
        "допоможи"
    ];

    const russian = [
        "привет",
        "спасибо",
        "пожалуйста",
        "хочу",
        "могу",
        "надо",
        "нужно",
        "почему",
        "как",
        "какой",
        "какая",
        "какое",
        "это",
        "мне",
        "тебе",
        "сделать",
        "помоги"
    ];

    const english = [
        "hello",
        "hi",
        "thanks",
        "please",
        "want",
        "can",
        "need",
        "why",
        "how",
        "what",
        "which",
        "this",
        "that",
        "me",
        "you",
        "make",
        "help"
    ];

    let ukScore = 0;
    let ruScore = 0;
    let enScore = 0;

    for (const word of ukrainian) {
        if (lower.includes(word)) {
            ukScore++;
        }
    }

    for (const word of russian) {
        if (lower.includes(word)) {
            ruScore++;
        }
    }

    for (const word of english) {
        if (lower.includes(word)) {
            enScore++;
        }
    }

    if (enScore > ukScore && enScore > ruScore) {
        return "en";
    }

    if (ruScore > ukScore) {
        return "ru";
    }

    return "uk";
}


/* =========================================================
   ТИП ПОВІДОМЛЕННЯ
========================================================= */

function detectIntent(text) {

    const lower = text.toLowerCase();

    if (
        lower.includes("привіт") ||
        lower.includes("привет") ||
        lower.includes("hello") ||
        lower.includes("hi")
    ) {
        return "greeting";
    }

    if (
        lower.includes("допоможи") ||
        lower.includes("помоги") ||
        lower.includes("help")
    ) {
        return "help";
    }

    if (
        lower.includes("чому") ||
        lower.includes("почему") ||
        lower.includes("why")
    ) {
        return "why";
    }

    if (
        lower.includes("як") ||
        lower.includes("как") ||
        lower.includes("how")
    ) {
        return "how";
    }

    if (
        lower.includes("що") ||
        lower.includes("что") ||
        lower.includes("what")
    ) {
        return "question";
    }

    if (
        lower.includes("думаєш") ||
        lower.includes("думаешь") ||
        lower.includes("think")
    ) {
        return "opinion";
    }

    if (
        lower.includes("ідея") ||
        lower.includes("идея") ||
        lower.includes("idea")
    ) {
        return "idea";
    }

    if (
        lower.includes("дякую") ||
        lower.includes("спасибо") ||
        lower.includes("thanks")
    ) {
        return "thanks";
    }

    if (
        lower.includes("?")
    ) {
        return "question";
    }

    return "conversation";
}


/* =========================================================
   СТИЛЬ ПОВІДОМЛЕННЯ
========================================================= */

function detectStyle(text) {

    const words = text.trim().split(/\s+/);

    const hasQuestion =
        text.includes("?");

    const hasExclamation =
        text.includes("!");

    const isShort =
        words.length <= 4;

    const isLong =
        words.length >= 15;

    const upperLetters =
        (text.match(/[A-ZА-ЯІЇЄ]/g) || []).length;

    const allCaps =
        upperLetters > 3 &&
        upperLetters > text.length * 0.25;

    if (allCaps) {
        return "excited";
    }

    if (hasExclamation) {
        return "emotional";
    }

    if (isShort) {
        return "short";
    }

    if (isLong) {
        return "detailed";
    }

    if (hasQuestion) {
        return "questioning";
    }

    return "normal";
}


/* =========================================================
   ЕМОЦІЙНИЙ ТОН
========================================================= */

function detectMood(text) {

    const lower = text.toLowerCase();

    const positive = [
        "клас",
        "супер",
        "круто",
        "ура",
        "подобається",
        "радий",
        "крутая",
        "класс",
        "супер",
        "cool",
        "awesome",
        "great",
        "nice"
    ];

    const negative = [
        "погано",
        "сумно",
        "проблема",
        "не працює",
        "зламалось",
        "погано",
        "грустно",
        "проблема",
        "не работает",
        "broken",
        "problem"
    ];

    let positiveScore = 0;
    let negativeScore = 0;

    for (const word of positive) {
        if (lower.includes(word)) {
            positiveScore++;
        }
    }

    for (const word of negative) {
        if (lower.includes(word)) {
            negativeScore++;
        }
    }

    if (positiveScore > negativeScore) {
        return "positive";
    }

    if (negativeScore > positiveScore) {
        return "negative";
    }

    return "neutral";
}


/* =========================================================
   МАТЕМАТИЧНИЙ ВИРАЗ
========================================================= */

function calculateExpression(text) {

    const cleaned = text
        .replace(/,/g, ".")
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .trim();

    const match = cleaned.match(
        /^(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)$/
    );

    if (!match) {
        return null;
    }

    const a = Number(match[1]);
    const operator = match[2];
    const b = Number(match[3]);

    if (operator === "+") {
        return a + b;
    }

    if (operator === "-") {
        return a - b;
    }

    if (operator === "*") {
        return a * b;
    }

    if (operator === "/") {

        if (b === 0) {
            return null;
        }

        return a / b;
    }

    return null;
}


/* =========================================================
   АНАЛІЗ
========================================================= */

export function analyzeText(text) {

    const lower = text.toLowerCase();

    const words = lower
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    const numbers = extractNumbers(text);

    const language = detectLanguage(text);

    const intent = detectIntent(text);

    const style = detectStyle(text);

    const mood = detectMood(text);

    const wantsCalculation =
        lower.includes("порахуй") ||
        lower.includes("посчитай") ||
        lower.includes("calculate") ||
        lower.includes("compute") ||
        /^\s*-?\d+(?:[.,]\d+)?\s*[+\-*/×÷]\s*-?\d+(?:[.,]\d+)?\s*$/.test(text);

    return {

        originalText: text,

        words,

        wordCount: words.length,

        numbers,

        language,

        intent,

        style,

        mood,

        hasNumbers:
            numbers.length > 0,

        wantsCalculation
    };
}


/* =========================================================
   МІРКУВАННЯ
========================================================= */

export function reason(analysis) {

    /* -------------------------
       МАТЕМАТИКА
    ------------------------- */

    if (
        analysis.wantsCalculation
    ) {

        const expression =
            analysis.originalText
                .replace(/[^\d+\-*/()., ×÷]/g, "")
                .replace(/×/g, "*")
                .replace(/÷/g, "/")
                .trim();

        const result =
            calculateExpression(expression);

        if (result !== null) {

            return {

                type: "calculation",

                value: result
            };
        }
    }


    /* -------------------------
       ЗВИЧАЙНА РОЗМОВА
    ------------------------- */

    return {

        type: "generation",

        intent: analysis.intent,

        mood: analysis.mood,

        style: analysis.style
    };
}


/* =========================================================
   КОНТЕКСТ
========================================================= */

function getContextText(chatId) {

    const conversation =
        getConversation(chatId);

    if (conversation.length === 0) {
        return "";
    }

    return conversation
        .slice(-6)
        .map(message =>
            `${message.role}: ${message.text}`
        )
        .join("\n");
}


/* =========================================================
   ГЕНЕРАТОР
=========================================================

   ВАЖЛИВО:

   Тут немає:

       if (...) return "одна готова відповідь";

   Замість цього AI формує відповідь
   із декількох частин.

========================================================= */

function generateAnswer(
    analysis,
    reasoning,
    context
) {

    const lang =
        analysis.language;


    /* =====================================================
       ТОЧНА МАТЕМАТИКА
    ===================================================== */

    if (
        reasoning.type === "calculation"
    ) {

        if (lang === "en") {
            return `The result is ${reasoning.value}.`;
        }

        if (lang === "ru") {
            return `Результат: ${reasoning.value}.`;
        }

        return `Результат: ${reasoning.value}.`;
    }


    /* =====================================================
       УКРАЇНСЬКА
    ===================================================== */

    if (lang === "uk") {

        if (analysis.intent === "greeting") {

            const greetings = [
                "Привіт! 👋 Чим можу допомогти?",
                "О, привіт! 😎 Що будемо робити?",
                "Привіт! Радий тебе бачити. Про що поговоримо?",
                "Хей! 👋 Розповідай, що в тебе сталося."
            ];

            return random(greetings);
        }


        if (analysis.intent === "thanks") {

            return random([
                "Будь ласка! 😎",
                "Нема за що!",
                "Завжди радий допомогти!",
                "Без проблем 👍"
            ]);
        }


        if (analysis.intent === "idea") {

            const openings = [
                "Можна підійти до цього так:",
                "Я б спробував такий варіант:",
                "Є кілька цікавих напрямків.",
                "Тут можна придумати дещо цікаве."
            ];

            const ideas = [
                "почати з найпростішої механіки, а потім поступово додавати складніші системи",
                "зробити одну основну механіку дуже цікавою замість великої кількості недороблених функцій",
                "спочатку створити маленький робочий прототип і вже після цього його розширювати",
                "взяти основну ідею та додати до неї одну особливість, яка буде відрізняти гру від інших"
            ];

            return `${random(openings)} ${random(ideas)}.`;
        }


        if (analysis.intent === "opinion") {

            return random([
                "Я думаю, що тут найкраще спочатку подивитися на плюси й мінуси обох варіантів.",
                "На мою думку, кращий вибір залежить від того, що саме ти хочеш отримати в результаті.",
                "Я б не поспішав вибирати. Спочатку порівняв би основні відмінності.",
                "Мені здається, що тут є сенс вибрати простіший варіант і потім його розширити."
            ]);
        }


        if (analysis.intent === "help") {

            return random([
                "Так, давай розберемося. Напиши, що саме зараз не виходить.",
                "Звісно. Розкажи трохи детальніше про проблему, і спробуємо знайти рішення.",
                "Так, допоможу. Покажи, що саме сталося або що ти хочеш зробити.",
                "Давай. Опиши проблему своїми словами — не обов'язково технічно."
            ]);
        }


        if (
            analysis.intent === "question" ||
            analysis.intent === "why" ||
            analysis.intent === "how"
        ) {

            return generateQuestionAnswer(
                analysis,
                context
            );
        }


        return generateConversationAnswer(
            analysis,
            context
        );
    }


    /* =====================================================
       РОСІЙСЬКА
    ===================================================== */

    if (lang === "ru") {

        if (analysis.intent === "greeting") {

            return random([
                "Привет! 👋 Чем могу помочь?",
                "О, привет! 😎 Что будем делать?",
                "Привет! Рад тебя видеть. О чём поговорим?",
                "Хей! Рассказывай, что случилось."
            ]);
        }


        if (analysis.intent === "thanks") {

            return random([
                "Пожалуйста! 😎",
                "Не за что!",
                "Всегда рад помочь!",
                "Без проблем 👍"
            ]);
        }


        if (analysis.intent === "help") {

            return random([
                "Конечно. Расскажи, что именно не получается.",
                "Давай разберёмся. Опиши проблему немного подробнее.",
                "Помогу. Покажи, что сейчас происходит.",
                "Без проблем. Расскажи, что ты хочешь сделать."
            ]);
        }


        if (analysis.intent === "idea") {

            return random([
                "Я бы начал с самой простой версии идеи, а потом постепенно её расширял.",
                "Можно сделать одну главную механику действительно интересной, вместо множества недоделанных функций.",
                "Я бы сначала сделал небольшой рабочий прототип и только потом добавлял новые системы.",
                "Можно взять основную идею и добавить одну необычную механику, которая будет отличать проект."
            ]);
        }


        return generateConversationAnswer(
            analysis,
            context
        );
    }


    /* =====================================================
       ENGLISH
    ===================================================== */

    if (analysis.intent === "greeting") {

        return random([
            "Hey! 👋 What can I help you with?",
            "Hello! 😎 What are we working on?",
            "Hi! Nice to see you. What do you want to talk about?",
            "Hey! Tell me what's going on."
        ]);
    }


    if (analysis.intent === "thanks") {

        return random([
            "You're welcome!",
            "No problem! 😎",
            "Glad I could help!",
            "Anytime!"
        ]);
    }


    if (analysis.intent === "help") {

        return random([
            "Sure. Tell me what isn't working.",
            "Let's figure it out. Describe the problem a little more.",
            "Of course. Show me what is happening.",
            "Sure. Tell me what you're trying to build."
        ]);
    }


    if (analysis.intent === "idea") {

        return random([
            "I would start with the simplest version and expand it later.",
            "It may be better to make one main mechanic really interesting instead of adding many unfinished systems.",
            "I would build a small working prototype first and add more features afterward.",
            "You could take the main idea and add one unique mechanic to make it stand out."
        ]);
    }


    return generateConversationAnswer(
        analysis,
        context
    );
}


/* =========================================================
   ГЕНЕРАЦІЯ ПИТАННЯ
========================================================= */

function generateQuestionAnswer(
    analysis,
    context
) {

    const lang = analysis.language;

    if (lang === "ru") {

        return random([
            "Хороший вопрос. Тут важно посмотреть на ситуацию целиком, а не только на один момент.",
            "Здесь всё зависит от контекста. Если расскажешь немного подробнее, можно будет разобрать это точнее.",
            "Я бы начал с основной причины, а уже потом смотрел на остальные детали.",
            "Тут есть несколько вариантов ответа, и правильный зависит от того, что именно ты имеешь в виду."
        ]);
    }

    if (lang === "en") {

        return random([
            "That's a good question. The answer depends on the situation as a whole.",
            "It depends on the context. A little more detail would make the answer more precise.",
            "I would start with the main reason and then look at the other details.",
            "There are several possible answers here, depending on what exactly you mean."
        ]);
    }

    return random([
        "Цікаве питання. Тут важливо подивитися на ситуацію повністю, а не лише на один момент.",
        "Це залежить від контексту. Якщо розібрати деталі, відповідь буде точнішою.",
        "Я б почав з головної причини, а вже потім дивився на інші деталі.",
        "Тут може бути кілька варіантів відповіді — усе залежить від того, що саме ти маєш на увазі."
    ]);
}


/* =========================================================
   ГЕНЕРАЦІЯ ЗВИЧАЙНОЇ РОЗМОВИ
========================================================= */

function generateConversationAnswer(
    analysis,
    context
) {

    const lang = analysis.language;

    if (lang === "ru") {

        const starts = [
            "Понял тебя.",
            "Да, понимаю.",
            "Интересная мысль.",
            "Похоже на интересную ситуацию.",
            "Я бы посмотрел на это так:"
        ];

        const continuations = [
            "Здесь главное понять, чего именно ты хочешь получить в итоге.",
            "Я бы сначала разобрал основную часть, а потом уже переходил к деталям.",
            "Можно попробовать несколько вариантов и выбрать тот, который лучше подходит.",
            "Если смотреть практично, я бы начал с самого простого решения.",
            "Тут есть смысл не усложнять всё сразу, а постепенно развивать идею."
        ];

        return `${random(starts)} ${random(continuations)}`;
    }


    if (lang === "en") {

        const starts = [
            "I see.",
            "Yeah, I understand.",
            "That's interesting.",
            "I get what you mean.",
            "I would look at it this way:"
        ];

        const continuations = [
            "The main thing is to understand what you want to achieve.",
            "I would start with the main part and then move to the details.",
            "You could try several approaches and keep the one that works best.",
            "Practically, I would start with the simplest solution.",
            "There is no need to make everything complicated right away."
        ];

        return `${random(starts)} ${random(continuations)}`;
    }


    const starts = [
        "Розумію.",
        "Так, я тебе зрозумів.",
        "Цікава думка.",
        "Зрозуміло.",
        "Я б подивився на це так:"
    ];

    const continuations = [
        "Головне тут — зрозуміти, чого саме ти хочеш отримати в результаті.",
        "Я б спочатку розібрав основну частину, а потім уже переходив до деталей.",
        "Можна спробувати кілька варіантів і залишити той, який найкраще працює.",
        "Якщо дивитися практично, я б почав із найпростішого рішення.",
        "Не обов'язково одразу ускладнювати все — можна поступово розвивати ідею."
    ];

    return `${random(starts)} ${random(continuations)}`;
}


/* =========================================================
   ГОЛОВНИЙ МЕХАНІЗМ
========================================================= */

export function think(
    text,
    chatId = "default"
) {

    if (
        typeof text !== "string" ||
        !text.trim()
    ) {
        return "";
    }


    /* -------------------------
       АНАЛІЗ
    ------------------------- */

    const analysis =
        analyzeText(text);


    /* -------------------------
       КОНТЕКСТ ДО ПОВІДОМЛЕННЯ
    ------------------------- */

    const context =
        getContextText(chatId);


    /* -------------------------
       МІРКУВАННЯ
    ------------------------- */

    const reasoning =
        reason(analysis);


    /* -------------------------
       ГЕНЕРАЦІЯ
    ------------------------- */

    const answer =
        generateAnswer(
            analysis,
            reasoning,
            context
        );


    /* -------------------------
       ПАМ'ЯТЬ КОНТЕКСТУ
    ------------------------- */

    addToConversation(
        chatId,
        "user",
        text
    );

    addToConversation(
        chatId,
        "ai",
        answer
    );


    /* -------------------------
       DEBUG
    ------------------------- */

    console.log(
        "AI analysis:",
        analysis
    );

    console.log(
        "AI reasoning:",
        reasoning
    );

    console.log(
        "AI context:",
        context
    );

    console.log(
        "AI generated:",
        answer
    );


    return answer;
}


/* =========================================================
   ОЧИЩЕННЯ КОНТЕКСТУ
========================================================= */

export function clearMemory(
    chatId = "default"
) {

    conversations.delete(chatId);
}


/* =========================================================
   ОТРИМАТИ КОНТЕКСТ
========================================================= */

export function getMemory(
    chatId = "default"
) {

    return [
        ...getConversation(chatId)
    ];
}