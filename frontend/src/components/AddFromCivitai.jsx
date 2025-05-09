import { useState, useEffect } from "react";
import axios from "axios";

export default function AddFromCivitai() {
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("civitai-api-key");
    if (stored) setApiKey(stored);
  }, []);

  const handleImport = async () => {
    setMessage("");

    const headers = {
      "User-Agent": "Lokarni-Frontend/1.0",
    };

    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const isImageUrl = url.includes("/images/");

    try {
      let endpoint;
      let payload;

      if (isImageUrl) {
        const imageId = url.split("/images/")[1].split("?")[0];
        endpoint = `/api/import/from-civitai-image/${imageId}`;
        payload = {};
      } else {
        endpoint = "/api/assets/from-civitai";
        payload = { civitai_url: url, api_key: apiKey || null };
      }

      const res = await axios.post(endpoint, payload, { headers });

      if (apiKey) {
        localStorage.setItem("civitai-api-key", apiKey);
        document.cookie = `civitai-api-key=${apiKey};path=/`;
      }

      setMessage(`✅ Erfolgreich importiert: ${res.data.name}`);
    } catch (err) {
      setMessage(
        `❌ Fehler: ${err.response?.data?.detail || err.message || "Unbekannter Fehler"}`
      );
    }
  };

  return (
    <div className="space-y-10">
      {/* Importfeld */}
      <div className="bg-box p-6 rounded-md shadow-md space-y-4">
        <h2 className="text-lg font-bold">Von CivitAI importieren</h2>

        <input
          type="text"
          placeholder="CivitAi-Modell - https://civitai.com/models/1234567"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full p-2 rounded bg-zinc-900 text-white border border-zinc-700"
        />

        {/* Hinweis: Was NICHT funktioniert */}
        <div className="text-xs text-yellow-400 italic">
          ⚠️ Slugs wie <code>/models/sdxl</code> oder Bild-Links <code>/images/xyz</code> werden nicht unterstützt – bitte nutze die vollständige Modell-URL mit ID.
        </div>

        <input
          type="text"
          placeholder="Optional: CivitAI API-Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full p-2 rounded bg-zinc-900 text-white border border-zinc-700"
        />

        <div className="text-xs text-zinc-400">
          🔑 Du kannst einen API-Key auf{" "}
          <a
            href="https://civitai.com/user/account"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            civitai.com/account
          </a>{" "}
          erstellen und hier einfügen – notwendig für NSFW-Inhalte.
        </div>

        <button
          onClick={handleImport}
          className="bg-primary text-background font-semibold px-4 py-2 rounded hover:bg-opacity-90 transition"
        >
          Importieren
        </button>

        {message && (
          <p className={`text-sm mt-2 ${message.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>
            {message}
          </p>
        )}
      </div>

      {/* Metadaten-Tabelle */}
      <div className="bg-background p-6 rounded-md border border-box shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Verfügbare Metadaten von CivitAI</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-700 text-zinc-400 uppercase text-xs">
                <th className="px-3 py-2">Feld</th>
                <th className="px-3 py-2">API-Quelle</th>
                <th className="px-3 py-2">Beschreibung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {[
                ["name", "model_data.name", "Name des Modells"],
                ["type", "model_data.type", "Modelltyp (Checkpoint, LoRA, etc.)"],
                ["description", "model_data.description", "Modellbeschreibung"],
                ["model_version", "version.name", "Name der Version"],
                ["trigger_words", "version.trainedWords[]", "Trainierte Triggerwörter"],
                ["preview_image", "images[0].url", "Vorschaubild-URL"],
                ["positive_prompt", "images[0].meta.prompt", "Positiver Prompt"],
                ["negative_prompt", "images[0].meta.negativePrompt", "Negativer Prompt"],
                ["tags", "model_data.tags[]", "Tags"],
                ["used_resources", "images[0].resources[]", "Genutzte Ressourcen"],
                ["slug", "model_data.slug", "Slug (sprechender URL-Teil)"],
                ["creator", "model_data.creator.username", "Ersteller des Modells"],
                ["nsfw", "model_data.nsfw", "NSFW-Level"],
                ["base_model", "version.baseModel", "Basis-Modell (z. B. SDXL)"],
                ["created_at", "version.createdAt", "Erstellungsdatum"],
                ["download_url", "version.files[0].downloadUrl", "Downloadlink des Modells"],
              ].map(([field, source, desc]) => (
                <tr key={field}>
                  <td className="px-3 py-2 font-mono text-primary">{field}</td>
                  <td className="px-3 py-2 text-zinc-400">{source}</td>
                  <td className="px-3 py-2">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
