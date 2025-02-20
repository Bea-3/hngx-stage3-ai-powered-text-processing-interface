import { useState, useEffect } from "react";
import { IoIosSend } from "react-icons/io";
import { initializeLanguageDetector, detectLanguage } from "./Components/LanguageDetector";
import { initializeTranslator, translateText } from "./Components/Translator";
import { Loader } from "./Components/Loader";

function App() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState([]);
  const [detector, setDetector] = useState(null);
  const [globalError, setGlobalError] = useState(""); 
  const [isTranslating, setIsTranslating] = useState(false);

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

    // Add the text to the output with a "Detecting..." placeholder
    const newOutput = {
      text,
      language: "Detecting...",
      translation: null,
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
      const newTranslator = await initializeTranslator(detectedLanguage, newOutput.targetLanguage);

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
        updatedOutput[updatedOutput.length - 1].language = "Error detecting language";
        updatedOutput[updatedOutput.length - 1].error = "Failed to detect language.";
        return updatedOutput;
      });
    }
  };

  // Function to handle translation
  const handleTranslate = async (index) => {
    const selectedOutput = output[index];

    if (!selectedOutput.translator) {
      // Update item-specific error instead of global error
      setOutput((prevOutput) => {
        const updatedOutput = [...prevOutput];
        updatedOutput[index].error = "Translation not available.";
        return updatedOutput;
      });
      return;
    }

    setIsTranslating(index);
    try {
      // Clear any previous errors
      setOutput((prevOutput) => {
        const updatedOutput = [...prevOutput];
        updatedOutput[index].error = null;
        return updatedOutput;
      });

      // Initialize a new translator with the current target language
      const translator = await initializeTranslator(
        selectedOutput.language,
        selectedOutput.targetLanguage
      );
      
      const translatedText = await translateText(
        translator,
        selectedOutput.text,
        selectedOutput.targetLanguage
      );
      
      setOutput((prevOutput) => {
        const updatedOutput = [...prevOutput];
        updatedOutput[index].translation = translatedText;
        updatedOutput[index].translator = translator;
        return updatedOutput;
      });
    } catch (err) {
      console.error("Translation error:", err);
      setOutput((prevOutput) => {
        const updatedOutput = [...prevOutput];
        updatedOutput[index].translation = null;
        updatedOutput[index].error = "Error translating text.";
        return updatedOutput;
      });
    } finally {
      setIsTranslating(null);
    }
  };

  // Function to update target language for a specific message
  // Modified: Now it just updates the language without triggering translation
  const handleTargetLanguageChange = (index, newLanguage) => {
    setOutput((prevOutput) => {
      const updatedOutput = [...prevOutput];
      updatedOutput[index].targetLanguage = newLanguage;
      // We're NOT clearing the previous translation here anymore
      // We'll let the user decide when to translate with the new language
      return updatedOutput;
    });
  };

  return (
    <div className="container border border-red-400 m-auto w-screen min-h-screen p-2 flex flex-col items-center gap-5">
      {/* Logo */}
      <h1 className="w-full border border-amber-200">LangAI</h1>

      {/* Display global errors (detector initialization) */}
      {globalError && <p className="text-red-500 w-full max-w-[800px]">{globalError}</p>}

      <div className="w-full min-h-[500px] max-w-[800px] border-green-300 rounded-lg shadow flex flex-col flex-1 justify-between">
        {/* Output Field */}
        <div className="h-fit overflow-y-auto border-b p-2">
          {output.map((item, index) => (
            <div key={index} className="text-black mb-2 flex flex-col justify-between">
              <div className="border border-gray-100 rounded-2xl p-3 my-3 w-full md:w-[70%] self-end">
              <p className="">{item.text}</p>
              {/* Display detected language */}
              <p className="text-sm text-gray-500 mt-1">Language: {item.language}</p>
              
              {/* Display item-specific error if present */}
              {item.error && (
                <p className="text-red-500 text-sm mt-1">{item.error}</p>
              )}

              {/* Language selection dropdown */}
              <div className="flex items-center gap-2 mt-4 text-sm">
                <div className="flex items-center gap-2 p-2 rounded-xl">
                <label className="text-sm">Translate to:</label>
                <select
                  className="border rounded w-[95px] py-0.5 text-[12px]"
                  value={item.targetLanguage}
                  onChange={(e) => handleTargetLanguageChange(index, e.target.value)}
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
                  className="bg-blue-500 text-white p-1 rounded text-xs"
                  onClick={() => handleTranslate(index)}
                >
                  Translate
                </button>


                {/* Summarize button */}
                <button className="bg-green-600 text-white p-1 rounded text-xs ml-4">Summarize</button>
                </div>
                
                
              </div>
              </div>
              

              {/* Show translated text here */}
              {isTranslating === index ? (
                <p className="text-gray-500 flex items-center gap-2 mt-1">
                  <Loader />
                </p>
              ) : item.translation ? (
                <p className="mt-3 mb-6 w-full md:w-[70%] border border-gray-300 rounded-2xl p-3 ">Translation: {item.translation}</p>
              ) : null}
            </div>
          ))}
        </div>

        {/* Input Field & Send Button */}
        <div className="border border-amber-600 rounded-2xl flex items-center justify-center gap-3 p-2 mt-5 sticky bottom-0 bg-white">
          <textarea
            className="border outline-0 resize-none w-[90%]"
            placeholder="Enter text here"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
          ></textarea>

          <button
            className="border flex justify-center items-center bg-purple-400 rounded-2xl"
            onClick={handleSend}
          >
            <IoIosSend className="w-10 h-10" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;