export async function Summarizer(text) {
  const options = {
    type: 'key-points',
    format: 'markdown', 
    length: 'medium',
  };

  try {
    // 1️⃣ Check if summarizer is available
    const available = (await self.ai.summarizer.capabilities()).available;
    if (available === 'no') {
      console.error("Summarizer API is not available.");
      return "Summarization is not available.";
    }

    // 2️⃣ Create summarizer instance
    let summarizer;
    if (available === 'readily') {
      summarizer = await self.ai.summarizer.create(options);
    } else {
      summarizer = await self.ai.summarizer.create(options);
      summarizer.addEventListener('downloadprogress', (e) => {
        console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
      });
      await summarizer.ready; // Wait for download
    }

    // 3️⃣ Run the summarization
    const summary = await summarizer.summarize(text, {
      context: "This is an output field summary.",
    });

    return summary;

  } catch (err) {
    console.error("Summarization error:", err);
    return "Error summarizing the text.";
  }
}
