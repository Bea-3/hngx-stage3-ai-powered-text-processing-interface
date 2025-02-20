export const initializeTranslator = async (sourceLang, targetLang) => {
    try {
      const translatorCapabilities = await self.ai.translator.capabilities();
      if (!translatorCapabilities.languagePairAvailable(sourceLang, targetLang)) {
        console.log(`Translation from ${sourceLang} to ${targetLang} is not supported.`);
        return null;
      }
  
      const translator = await self.ai.translator.create({
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        monitor(m) {
          m.addEventListener("downloadprogress", (e) => {
            console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
          });
        },
      });
  
      return translator;
    } catch (error) {
      console.error("Error initializing translator:", error);
      return null;
    }
  };
  
  export const translateText = async (translator, text) => {
    if (!translator) return "Translation not available";
    try {
      const translatedText = await translator.translate(text);
      return translatedText;
    } catch (error) {
      console.error("Translation error:", error);
      return "Error translating text";
    }
  };
  