const sourceSelect = document.getElementById("source-lang");
const targetSelect = document.getElementById("target-lang");
const sourceText = document.getElementById("source-text");
const resultText = document.getElementById("result-text");
const translateBtn = document.getElementById("translate-btn");
const swapBtn = document.getElementById("swap-btn");
const statusLabel = document.getElementById("status");

// WARNING: Never expose real API keys in production frontend code.
// This is only acceptable for local experiments / learning projects.
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";
const GEMINI_MODEL = "gemini-1.5-flash";

const languages = [
  { code: "af", name: "Afrikaans" },
  { code: "ar", name: "Arabic" },
  { code: "bn", name: "Bengali" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
  { code: "hr", name: "Croatian" },
  { code: "cs", name: "Czech" },
  { code: "da", name: "Danish" },
  { code: "nl", name: "Dutch" },
  { code: "en", name: "English" },
  { code: "fi", name: "Finnish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "el", name: "Greek" },
  { code: "hi", name: "Hindi" },
  { code: "hu", name: "Hungarian" },
  { code: "id", name: "Indonesian" },
  { code: "ga", name: "Irish" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "lv", name: "Latvian" },
  { code: "ms", name: "Malay" },
  { code: "no", name: "Norwegian" },
  { code: "fa", name: "Persian" },
  { code: "pl", name: "Polish" },
  { code: "pt", name: "Portuguese" },
  { code: "ro", name: "Romanian" },
  { code: "ru", name: "Russian" },
  { code: "sk", name: "Slovak" },
  { code: "es", name: "Spanish" },
  { code: "sv", name: "Swedish" },
  { code: "ta", name: "Tamil" },
  { code: "th", name: "Thai" },
  { code: "tr", name: "Turkish" },
  { code: "uk", name: "Ukrainian" },
  { code: "ur", name: "Urdu" },
  { code: "vi", name: "Vietnamese" },
];

function getLanguageName(code) {
  return languages.find((l) => l.code === code)?.name || code;
}

function populateSelects() {
  languages.forEach((lang) => {
    const optionFrom = document.createElement("option");
    optionFrom.value = lang.code;
    optionFrom.textContent = lang.name;

    const optionTo = optionFrom.cloneNode(true);

    sourceSelect.appendChild(optionFrom);
    targetSelect.appendChild(optionTo);
  });

  sourceSelect.value = "en";
  targetSelect.value = "es";
}

async function translate() {
  const text = sourceText.value.trim();
  if (!text) {
    setStatus("Please enter some text to translate.");
    return;
  }

  if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") {
    setStatus("Set your Gemini API key in `script.js` first.");
    return;
  }

  setBusy(true);
  setStatus("Translating...");

  const sourceLang = sourceSelect.value;
  const targetLang = targetSelect.value;

  try {
    const prompt = `Translate the following text from ${getLanguageName(
      sourceLang
    )} (language code: ${sourceLang}) to ${getLanguageName(
      targetLang
    )} (language code: ${targetLang}). 

Return only the translated text, without quotes or any additional explanation.

Text:
${text}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(
        GEMINI_API_KEY
      )}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    const translated =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!translated) {
      throw new Error("No translation returned from Gemini");
    }

    resultText.value = translated;
    setStatus("Done ✨");
  } catch (error) {
    console.error(error);
    resultText.value = "";
    setStatus("Translation failed. Please try again.");
  } finally {
    setBusy(false);
  }
}

function swapLanguages() {
  const prevSource = sourceSelect.value;
  sourceSelect.value = targetSelect.value;
  targetSelect.value = prevSource;

  if (resultText.value && sourceText.value.trim() === "") {
    sourceText.value = resultText.value;
    resultText.value = "";
  }
}

function setBusy(isBusy) {
  translateBtn.disabled = isBusy;
  swapBtn.disabled = isBusy;
}

function setStatus(message) {
  statusLabel.textContent = message;
}

translateBtn.addEventListener("click", translate);
swapBtn.addEventListener("click", swapLanguages);
sourceText.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
    translate();
  }
});

populateSelects();

