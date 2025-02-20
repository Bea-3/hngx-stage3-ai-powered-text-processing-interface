import { useState, useEffect } from "react";
import { IoIosSend } from "react-icons/io";
import {
  initializeLanguageDetector,
  detectLanguage,
} from "./Components/LanguageDetector";
import { initializeTranslator, translateText } from "./Components/Translator";
import { Loader } from "./Components/Loader";
import { Summarizer } from "./Components/Summarizer";

function App() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState([]);
  const [detector, setDetector] = useState(null);
  const [globalError, setGlobalError] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(null);
  const [welcome, setWelcome]  = useState(true);

  // Initialize language detector on mount
  useEffect(() => {
    const setupDetector = async () => {
      try {
        const newDetector = await initializeLanguageDetector();
        setDetector(newDetector);
      } catch (err) {
        setGlobalError("Failed to initialize language detector.");
        console.error(err);
      }
    };
    setupDetector();
  }, []);

  // Function to handle send
  const handleSend = async () => {
    if (text.trim() === "") return;

    setWelcome(false);

    // Add the text to the output with a "Detecting..." placeholder
    const newOutput = {
      text,
      language: "Detecting...",
      translation: null,
      summary: null,
      translator: null,
      targetLanguage: "es", // Default target language
      error: null, // Add an error field to each output item
    };
    setOutput((prevOutput) => [...prevOutput, newOutput]);

    try {
      if (!detector) {
        throw new Error("Language detector is not ready.");
      }

      // Detect language
      const detectedLanguage = await detectLanguage(detector, text);

      // Initialize translator
      const newTranslator = await initializeTranslator(
        detectedLanguage,
        newOutput.targetLanguage
      );

      // Update the output with the detected language and translator instance
      setOutput((prevOutput) => {
        const updatedOutput = [...prevOutput];
        updatedOutput[updatedOutput.length - 1].language = detectedLanguage;
        updatedOutput[updatedOutput.length - 1].translator = newTranslator;
        return updatedOutput;
      });

      setText(""); // Clear input field
    } catch (err) {
      console.error(err);

      // Update the output with an error message
      setOutput((prevOutput) => {
        const updatedOutput = [...prevOutput];
        updatedOutput[updatedOutput.length - 1].language =
          "Error detecting language";
        updatedOutput[updatedOutput.length - 1].error =
          "Failed to detect language.";
        return updatedOutput;
      });
    }
  };

   // Function to update target language for a specific message
   const handleTargetLanguageChange = (index, newLanguage) => {
    setOutput((prevOutput) => {
      const updatedOutput = [...prevOutput];
      updatedOutput[index].targetLanguage = newLanguage;
      // We'll let the user decide when to translate with the new language
      return updatedOutput;
    });
  };
  

  // Function to handle translation
  const handleTranslate = async (index) => {
    const selectedOutput = output[index];
  
    // Clear any previous errors
    setOutput((prevOutput) => {
      const updatedOutput = [...prevOutput];
      updatedOutput[index].error = null;
      return updatedOutput;
    });
  
    // If source and target languages are the same, return the original text
    if (selectedOutput.language === selectedOutput.targetLanguage) {
      setOutput((prevOutput) => {
        const updatedOutput = [...prevOutput];
        updatedOutput[index].translation = selectedOutput.text;
        return updatedOutput;
      });
      return;
    }
  
    setIsTranslating(index);
    
    try {
      const translatedText = await translateText(
        selectedOutput.language,
        selectedOutput.targetLanguage,
        selectedOutput.text
      );
  
      setOutput((prevOutput) => {
        const updatedOutput = [...prevOutput];
        updatedOutput[index].translation = translatedText;
        return updatedOutput;
      });
    } catch (err) {
      console.error("Translation error:", err);
      setOutput((prevOutput) => {
        const updatedOutput = [...prevOutput];
        updatedOutput[index].error = "Error translating text.";
        return updatedOutput;
      });
    } finally {
      setIsTranslating(null);
    }
  };
  
  

 
  const handleSummarize = async (index) => {
    const selectedOutput = output[index];

    if (!selectedOutput.text) return;

    setIsSummarizing(index);

    try {
      const summary = await Summarizer(selectedOutput.text); // Call Summarizer function
      setOutput((prevOutput) => {
        const updatedOutput = [...prevOutput];
        updatedOutput[index].summary = summary;
        return updatedOutput;
      });
    } catch (err) {
      console.error("Summarization error:", err);
      setOutput((prevOutput) => {
        const updatedOutput = [...prevOutput];
        updatedOutput[index].summary = "Error summarizing text.";
        return updatedOutput;
      });
    } finally {
      setIsSummarizing(null);
    }
  };

  return (
    <div className="container m-auto w-screen min-h-screen p-4 flex flex-col items-center gap-5 font-questrial">
      {/* Logo */}
      <h1 className="w-fit text-purple-700 font-atkinson text-3xl self-start p-2 shadow rounded-xl bg-gray-50">Lang<span className="text-gray-500">AI</span></h1>

      {/* Display global errors (detector initialization) */}
      {globalError && (
        <p className="text-red-500 w-full max-w-[800px]">{globalError}</p>
      )}

      {/* Show welcome message only if no output */}
      {welcome && output.length === 0 && (
        <div className="text-center text-gray-600 p-4 bg-gray-100 rounded-lg max-w-[800px] mt-4">
          <h2 className="text-2xl font-semibold">Welcome to LangAI 🎉</h2>
          <p className="mt-2 font-">
            Type something to **detect the language, translate, and summarize your text**. 
            <br/>
            Experience these features on desktop view!
          </p>
        </div>
      )}

      <div className="w-full min-h-[500px] max-w-[800px] flex flex-col flex-1 justify-between">
        {/* Output Field */}
        <div className="h-fit overflow-y-auto p-2">
          {output.map((item, index) => (
            <div
              key={index}
              className="text-black mb-2 flex flex-col justify-between"
            >
              <div className="border border-gray-100 rounded-2xl p-3 my-3 w-full md:w-[70%] self-end">
                <p className="">{item.text}</p>

                <div className="flex justify-between items-center mt-2">
                  {/* Display detected language */}
                <p className="text-sm text-gray-500 mt-1">
                  Language: {item.language}
                </p>
                 {/* Display character count */}
                <p className="text-xs text-gray-500 mt-1">
                  {item.text.length}/150 characters
                </p>                
                </div>
               

                {/* Display item-specific error if present */}
                {item.error && (
                  <p className="text-red-500 text-sm mt-1">{item.error}</p>
                )}

                {/* Language selection dropdown */}
                <div className="flex items-center gap-2 mt-2 text-sm justify-end">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Translate to:</label>
                    <select
                      className="border rounded w-[95px] py-0.5 text-[12px]"
                      value={item.targetLanguage}
                      onChange={(e) =>
                        handleTargetLanguageChange(index, e.target.value)
                      }
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="pt">Portuguese</option>
                      <option value="ru">Russian</option>
                      <option value="tr">Turkish</option>
                      <option value="fr">French</option>
                    </select>

                    {/* Translate button */}
                    <button
                      className="border bg-purple-400 hover:border-purple-500 hover:bg-gray-50 hover:text-gray-800 text-white p-1 rounded text-xs"
                      onClick={() => handleTranslate(index)}
                      aria-label="Translate"
                    >
                      Translate
                    </button>

                    {/* Summarize button - only appears if text length > 150 */}
                    {item.text.length > 150 && item.language === "en" && (
                      <button className="border border-purple-500 text-gray-600 hover:bg-purple-400 hover:text-white p-1 rounded text-xs ml-2
                      "
                      onClick={() => handleSummarize(index)}
                      aria-label="Summarize">
                        {isSummarizing === index ? "Summarizing..." : "Summarize"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {item.summary && (
                <p className="mt-3 mb-6 w-full md:w-[70%] border border-gray-300 rounded-2xl p-3">
                  Summary: {item.summary}
                </p>
              )}

              {/* Show translated text here */}
              {isTranslating === index ? (
                <p className="text-gray-500 flex items-center gap-2 mt-1">
                  <Loader />
                </p>
              ) : item.translation ? (
                <p className="mt-3 mb-6 w-full md:w-[70%] border border-gray-300 bg-gray-50 rounded-2xl p-3 ">
                  <b>Translation:</b><br/>{item.translation}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        {/* Input Field & Send Button */}
        <div className="border border-purple-400 rounded-2xl flex items-center justify-center gap-3 p-2 mt-5 sticky bottom-0 bg-white shadow text-gray-700">
          <textarea
            className="outline-0 resize-none w-[90%]"
            placeholder="Enter text here"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            aria-label="textarea"
          ></textarea>

          <button
            className="border border-purple-500 flex justify-center items-center rounded-xl"
            onClick={handleSend}
          >
            <IoIosSend className="w-10 h-10 p-1 text-purple-500 hover:text-purple-700" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
