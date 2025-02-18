"use client"; // Required for Client Components

import { useState, useEffect } from "react";
import "remixicon/fonts/remixicon.css";


export default function SubtitleConverter() {
  const [subtitleText, setSubtitleText] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("Markdown");
  const [aiPrompt, setAiPrompt] = useState("");
  const [convertedText, setConvertedText] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);


  useEffect(() => {
    setSubtitleText(""); // Prevent SSR issues
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setSubtitleText(e.target?.result as string);
    };
    reader.readAsText(file);
  };

  const convertSubtitles = () => {
    if (!subtitleText) {
      setConvertedText("No content provided");
      return;
    }

    const lines = subtitleText.split('\n');
    let formattedContent = '';
    let currentText = '';
    
    if (selectedFormat === "Markdown") {
      // Process for Markdown format
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines, subtitle numbers, and timestamps
        if (!line || /^\d+$/.test(line) || line.includes('-->')) continue;
        
        // Add subtitle text
        currentText += line + ' ';
        
        // If next line is a timestamp or empty, finish current paragraph
        if (!lines[i + 1]?.trim() || lines[i + 1]?.includes('-->')) {
          formattedContent += currentText.trim() + '\n\n';
          currentText = '';
        }
      }
    } else {
      // Process for Indented Text format
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Skip empty lines, subtitle numbers, and timestamps
        if (!line || /^\d+$/.test(line) || line.includes('-->')) continue;
        
        // Add subtitle text with indentation
        currentText += line + ' ';
        
        // If next line is a timestamp or empty, finish current paragraph
        if (!lines[i + 1]?.trim() || lines[i + 1]?.includes('-->')) {
          formattedContent += `    ${currentText.trim()}\n\n`;
          currentText = '';
        }
      }
    }

    setConvertedText(formattedContent.trim());
    
    if (aiPrompt) {
      setAiSummary(`Summary based on prompt: "${aiPrompt}"`);
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000); // Hide after 3 seconds
  };
  

  return (
    <div className="bg-gray-50 min-h-screen flex justify-center items-center p-6">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-5xl w-full">
        {/* Title & Subtitle */}
        <h1 className="text-4xl font-['Pacifico'] text-primary text-center">Subtitle Converter</h1>
        <p className="text-gray-600 text-center mb-6">Transform your subtitle files into well-structured documents</p>

        {/* Textarea Input */}
        <textarea
          className="w-full h-40 p-4 border border-gray-200 rounded focus:outline-none focus:border-primary resize-none"
          placeholder="Paste your subtitles here..."
          value={subtitleText}
          onChange={(e) => setSubtitleText(e.target.value)}
        />

        {/* File Upload */}
        <div className="flex items-center gap-4 mt-4">
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-button cursor-pointer hover:bg-gray-100 transition whitespace-nowrap">
            <i className="ri-upload-line w-5 h-5 flex items-center justify-center"></i>
            Upload File
            <input type="file" accept=".srt,.vtt" className="hidden" onChange={handleFileUpload} />
          </label>
          <span className="text-sm text-gray-500">Supported formats: .srt, .vtt</span>
        </div>

        {/* Output Format & AI Prompt */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
            <select
              className="w-full px-4 py-2 border border-gray-200 rounded-button focus:outline-none focus:border-primary"
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              <option value="Markdown">Markdown</option>
              <option value="Indented">Indented Text</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">AI Prompt (Optional)</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-200 rounded-button focus:outline-none focus:border-primary"
              placeholder="E.g., Summarize this content..."
              value={aiPrompt || "// summarise this, highlight keypoints, use tables if appropriate"}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-4 mt-6">
          <button
            className="px-6 py-2 bg-primary text-white rounded-button hover:bg-opacity-90 transition flex items-center gap-2 whitespace-nowrap"
            onClick={convertSubtitles}
          >
            <i className="ri-magic-line w-5 h-5 flex items-center justify-center"></i>
            Convert
          </button>
          <button
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-button hover:bg-gray-200 transition flex items-center gap-2 whitespace-nowrap"
            onClick={() => {
              navigator.clipboard.writeText(convertedText);
              showNotification("Content copied to clipboard");
            }}          >
            <i className="ri-clipboard-line w-5 h-5 flex items-center justify-center"></i>
            Copy
          </button>
          <button
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-button hover:bg-gray-200 transition flex items-center gap-2 whitespace-nowrap"
            onClick={() => {
              const textWithPrompt = aiPrompt 
                ? `${convertedText}\n\n${aiPrompt}`
                : convertedText;
              navigator.clipboard.writeText(textWithPrompt);
              showNotification("Content copied with prompt");
            }}
          >
            <i className="ri-ai-generate w-5 h-5 flex items-center justify-center"></i>
            Copy with Prompt
          </button>
        </div>

        {/* Converted Output */}
        {convertedText && (
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <h3 className="font-medium">Converted Output</h3>
            <pre className="text-sm">{convertedText}</pre>
          </div>
        )}

      {notification && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <i className="ri-check-line text-lg"></i>
          {notification}
        </div>
      )}
      </div>
    </div>
  );
}
