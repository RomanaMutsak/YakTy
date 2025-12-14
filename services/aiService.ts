import { supabase } from '../supabaseConfig';

export async function getAIResponse(message: string): Promise<string> {
  try {
    // 1. Виклик "хмарної" функції 'ai-helper'
    const { data, error } = await supabase.functions.invoke('ai-helper', {
      body: { message: message }, 
    });

    if (error) {
      throw error; 
    }

    // 2. Повернення відповіді від функції
    return data.reply;

  } catch (error) {
    console.error("Помилка виклику функції Supabase:", error);
    if (error instanceof Error) {
        return `Помилка: ${error.message}`;
    }
    return "Вибач, у мене зараз виникла невелика технічна проблема з підключенням до сервера.";
  }
}