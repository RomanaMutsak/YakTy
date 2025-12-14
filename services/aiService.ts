import { supabase } from '../supabaseConfig';

export async function getAIResponse(message: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-helper', {
      body: { message: message }, 
    });

    if (error) {
      throw error; 
    }

    return data.reply;

  } catch (error) {
    console.error("Помилка виклику функції Supabase:", error);
    if (error instanceof Error) {
        return `Помилка: ${error.message}`;
    }
    return "Вибач, у мене зараз виникла невелика технічна проблема з підключенням до сервера.";
  }
}