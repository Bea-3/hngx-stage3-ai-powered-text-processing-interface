import { useState, useEffect } from "react";
import { IoIosSend } from "react-icons/io";
import { initializeLanguageDetector, detectLanguage} from "./Components/LanguageDetector"

function App() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState([]);
  const [detector, setDetector] = useState(null);
  const [error, setError] = useState("");

  // Initialize language detector on mount
  useEffect(() => {
    const setupDetector = async () => {
      try {
        const newDetector = await initializeLanguageDetector();
        setDetector(newDetector);
      } catch (err) {
        setError("Failed to initialize language detector.");
        console.error(err);
      }
    };
    setupDetector();
  }, []);

  // Function to handle send
  const handleSend = async () => {
    if (text.trim() === "") return;

    // Add the text to the output with a "Detecting..." placeholder
    const newOutput = { text, language: "Detecting..." };
    setOutput((prevOutput) => [...prevOutput, newOutput]);

    try {
      if (!detector) {
        throw new Error("Language detector is not ready.");
      }

      // Detect language
      const detectedLanguage = await detectLanguage(detector, text);

      // Update the output with the detected language
      setOutput((prevOutput) => {
        const updatedOutput = [...prevOutput];
        updatedOutput[updatedOutput.length - 1].language = detectedLanguage;
        return updatedOutput;
      });

      setText(""); // Clear input field
    } catch (err) {
      setError("Failed to detect language.");
      console.error(err);

      // Update the output with an error message
      setOutput((prevOutput) => {
        const updatedOutput = [...prevOutput];
        updatedOutput[updatedOutput.length - 1].language = "Error detecting language";
        return updatedOutput;
      });
    }
  };

  return (
    <div className="container border border-red-400 m-auto w-screen min-h-screen p-2 flex flex-col items-center gap-5">
      {/* Logo */}
      <h1 className="w-full border border-amber-200">LangAI</h1>

      <div className="w-full min-h-[500px] max-w-[800px] border-green-300 rounded-lg shadow flex flex-col flex-1 justify-between">
        {/* Output Field */}
        <div className="h-fit overflow-y-auto border-b p-2">
          {output.map((item, index) => (
            <div key={index} className="text-black mb-2">
              <p>{item.text}</p>
              {error && <p className="text-red-500">{error}</p> || <p className="text-sm text-gray-500">Detected Language: {item.language}</p>}
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
