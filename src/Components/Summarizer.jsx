export const Summarizer = async (text) => {
  if (!("ai" in self && "summarizer" in self.ai)) {
    console.error("Summarizer API not available.");
    return "Summarizer API is unavailable.";
  }

  const available = (await self.ai.summarizer.capabilities()).available;
  if (available === "no") {
    console.error("Summarizer API cannot be used.");
    return "Summarizer API is not accessible.";
  }

  const summarizer = await self.ai.summarizer.create({
    monitor(m) {
      m.addEventListener("downloadprogress", (e) => {
        console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
      });
    },
  });

  await summarizer.ready;

  const options = {
    sharedContext: "This is a scientific article",
    type: "key-points",
    format: "markdown",
    length: "medium",
  };

  const summarizers = await self.ai.summarizer.create(options);
  const summary = await summarizers.summarize(text, {
    context: "This article is intended for a tech-savvy audience.",
  });

  return summary;
};
