import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Промпт для ШІ (без змін)
const chatPrompt = `
  Ти - "Як ти?", турботливий і підтримуючий помічник у щоденнику емоцій. 
  Твоя мета - не вирішувати проблеми, а вислуховувати та ставити м'які запитання.
  Правила:
  - ЗАВЖДИ відповідай українською мовою.
  - Будь емпатичним, добрим і "ніжним".
  - Не давай медичних порад. 
  - Якщо користувач говорить про дуже серйозні проблеми (напр., самоушкодження), 
    м'яко нагадай йому, що ти лише ШІ, і що варто звернутися до професіонала.
  - Твої відповіді мають бути короткими, 1-3 речення.
  Повідомлення користувача:
`;

const safetySettings = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
];

serve(async (req) => {
  try {
    const { message } = await req.json();
    if (!message) throw new Error("Немає повідомлення");

    const API_KEY = Deno.env.get("GOOGLE_API_KEY");
    if (!API_KEY) throw new Error("Немає API ключа");

    // 2. ОСНОВНЕ ВИПРАВЛЕННЯ:
    // Використовуємо 'v1beta' (як і раніше)
    // АЛЕ з назвою моделі з твого списку: 'gemini-2.5-flash-lite'
    const GOOGLE_API_URL = 
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`;

    // 3. Створюємо тіло запиту
    const requestBody = {
      contents: [
        { parts: [{ text: chatPrompt + message }] }
      ],
      safetySettings: safetySettings,
    };

    // 4. Виконуємо запит
    const res = await fetch(GOOGLE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errorJson = await res.json();
      console.error("Помилка від Google API:", errorJson);
      throw new Error(`Google API error: ${errorJson.error.message}`);
    }

    const data = await res.json();
    
    // 5. Витягуємо текст відповіді
    const text = data.candidates[0].content.parts[0].text;

    // 6. Повертаємо відповідь у додаток
    return new Response(
      JSON.stringify({ reply: text }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Загальна помилка у функції:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});