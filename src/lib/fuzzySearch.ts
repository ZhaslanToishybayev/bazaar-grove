
/**
 * Функция для нечеткого поиска с учетом опечаток
 * Использует расстояние Левенштейна для определения схожести строк
 */

/**
 * Вычисляет расстояние Левенштейна между двумя строками
 * @param str1 - первая строка
 * @param str2 - вторая строка
 * @returns число - расстояние между строками
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1).fill(null).map(() => 
    Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // удаление
        track[j - 1][i] + 1, // вставка
        track[j - 1][i - 1] + indicator, // замена
      );
    }
  }
  
  return track[str2.length][str1.length];
}

/**
 * Проверяет схожесть строк с учетом возможных опечаток
 * @param text - текст для проверки
 * @param query - поисковый запрос
 * @param threshold - порог схожести (по умолчанию 0.3 - означает до 30% отличий)
 * @returns boolean - true если строки схожи, false иначе
 */
export function isFuzzyMatch(text: string, query: string, threshold = 0.3): boolean {
  if (!text || !query) return false;
  
  // Для коротких запросов используем более строгий порог
  const adjustedThreshold = query.length < 4 ? threshold * 0.7 : threshold;
  
  const lowercaseText = text.toLowerCase();
  const lowercaseQuery = query.toLowerCase();
  
  // Точное совпадение
  if (lowercaseText.includes(lowercaseQuery)) {
    return true;
  }
  
  // Если запрос короткий, проверяем каждое слово отдельно
  if (query.length <= 3) {
    const words = lowercaseText.split(/\s+/);
    for (const word of words) {
      if (word.startsWith(lowercaseQuery)) return true;
    }
  }
  
  // Если запрос длинный, используем расстояние Левенштейна
  const maxDistance = Math.ceil(query.length * adjustedThreshold);
  
  // Проверяем по словам в тексте
  const textWords = lowercaseText.split(/\s+/);
  
  for (const word of textWords) {
    // Пропускаем слишком короткие слова
    if (word.length < 3) continue;
    
    // Если длина слов сильно отличается, пропускаем
    if (Math.abs(word.length - lowercaseQuery.length) > maxDistance * 1.5) continue;
    
    const distance = levenshteinDistance(word, lowercaseQuery);
    if (distance <= maxDistance) {
      return true;
    }
  }
  
  // Если запрос из нескольких слов, проверяем каждое слово отдельно
  if (lowercaseQuery.includes(' ')) {
    const queryWords = lowercaseQuery.split(/\s+/);
    let matchedWordsCount = 0;
    
    for (const queryWord of queryWords) {
      if (queryWord.length < 3) continue;
      
      for (const textWord of textWords) {
        if (textWord.length < 3) continue;
        
        const wordMaxDistance = Math.ceil(queryWord.length * adjustedThreshold);
        const wordDistance = levenshteinDistance(textWord, queryWord);
        
        if (wordDistance <= wordMaxDistance) {
          matchedWordsCount++;
          break;
        }
      }
    }
    
    // Если большинство слов запроса найдены в тексте
    const significantQueryWords = queryWords.filter(w => w.length >= 3).length;
    if (significantQueryWords > 0 && matchedWordsCount / significantQueryWords >= 0.7) {
      return true;
    }
  }
  
  return false;
}

/**
 * Выполняет нечеткий поиск в массиве строк
 * @param items - массив строк для поиска
 * @param query - поисковый запрос
 * @param threshold - порог схожести
 * @returns массив строк, соответствующих запросу
 */
export function fuzzySearch(items: string[], query: string, threshold = 0.3): string[] {
  if (!query || query.length < 2) return [];
  
  return items.filter(item => isFuzzyMatch(item, query, threshold));
}
