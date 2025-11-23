/*Need to check the width something is expanding beyond the screen to the left*/


import React, { useState, useRef } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import worker from "pdfjs-dist/build/pdf.worker.mjs?url";

GlobalWorkerOptions.workerSrc = worker;
export default function PdfHandleUpload({ onSelectedText }) {
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectedBlock, setSelectedBlock] = useState({ page: null, index: null });
  const [mode, setMode] = useState("paragraphs");
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  const MAX_SIZE = 10 * 1024 * 1024;

  const splitToParagraphs = (text) => {
    const p = text.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
    if (p.length > 1) return p;
    return text.split(/(?<=[।.!?])\s+/).map(s => s.trim()).filter(Boolean);
  };

  const handlePDF = async (e) => {
    setError("");
    setPages([]);
    setCurrentPage(0);
    setSelectedBlock({ page: null, index: null });
    setSelectedText("");

    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Upload a valid PDF file.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("File too large. Max 10 MB.");
      return;
    }

    setLoading(true);
    try {
      const buf = await file.arrayBuffer();
      const pdf = await getDocument({ data: buf }).promise;

      const arr = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const pg = await pdf.getPage(i);
        const content = await pg.getTextContent();
        const txt = content.items.map(item => item.str).join(" ");
        arr.push({ pageNumber: i, text: txt });
      }
      setPages(arr);
    } catch (err) {
      setError("Could not read PDF.");
    }
    setLoading(false);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleMouseUp = () => {
    const sel = window.getSelection();
    const tx = sel?.toString()?.trim();
    if (tx) {
      setSelectedText(tx);
      setSelectedBlock({ page: null, index: null });
    }
    sel.removeAllRanges();
  };

  const useSelected = () => {
    if (!selectedText.trim()) return;
    onSelectedText(selectedText);
  };

  const renderPreview = (text, highlight) => {
    if (!highlight) return text;
    const idx = text.indexOf(highlight);
    if (idx === -1) return text;

    const esc = (str) =>
      str.replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;");

    return (
      esc(text.slice(0, idx)) +
      `<mark>${esc(highlight)}</mark>` +
      esc(text.slice(idx + highlight.length))
    );
  };

  return (
    <div className="w-full mt-10 overflow-x-hidden max-w-full box-border">

      {/* File + Clear */}
      <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handlePDF}
          className="border px-3 py-2 rounded text-sm w-full"
        />
        <button
          onClick={() => {
            setPages([]);
            setSelectedText("");
            setSelectedBlock({ page: null, index: null });
            setError("");
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
          className="px-3 py-2 text-sm bg-gray-100 rounded"
        >
          Clear
        </button>
      </div>

      {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
      {loading && <div className="mt-2 text-sm">Extracting text…</div>}

      {pages.length > 0 && (
        <div className="w-full  mt-4 ml-2  space-y-4 max-w-4xl">

          {/* Mode + page selector */}
          <div className="flex items-center ml">
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                checked={mode === "paragraphs"}
                onChange={() => setMode("paragraphs")}
              />
              Paragraphs
            </label>

            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                checked={mode === "page"}
                onChange={() => setMode("page")}
              />
              Page view
            </label>

            <div className="ml-auto flex items-center gap-2 text-sm">
              <button
                className="px-2 py-1 border rounded"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                Prev
              </button>

              <span>
                Page {pages[currentPage].pageNumber}
              </span>

              <button
                className="px-2 py-1 border rounded"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, pages.length - 1))
                }
                disabled={currentPage === pages.length - 1}
              >
                Next
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row min-w-0 box-border gap-6  overflow-x-hidden">

            {/* Left side */}
            <div className="flex-1 min-w-0">
              {mode === "paragraphs" ? (
                <div className="border rounded p-3 h-96 overflow-auto bg-white  ">
                  {splitToParagraphs(pages[currentPage].text).map((p, idx) => {
                    const selected =
                      selectedBlock.page === currentPage &&
                      selectedBlock.index === idx;

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedBlock({ page: currentPage, index: idx });
                          setSelectedText(p);
                        }}
                        className={`gap-6  text-sm rounded cursor-pointer mb-2 
                          ${selected ? "bg-yellow-100 border border-yellow-300" : "bg-gray-50 border"}`
                        }
                      >
                        {p}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  onMouseUp={handleMouseUp}
                  className="border rounded  h-96 overflow-auto bg-white whitespace-pre-wrap text-sm wrap-break-words"
                  dangerouslySetInnerHTML={{
                    __html: renderPreview(
                      pages[currentPage].text,
                      selectedText
                    ),
                  }}
                />
              )}
            </div>

            {/* Right side */}
            <div className="w-full min-w-0 lg:w-72 max-w-full space-y-3">
              <div className="border rounded p-3 bg-white">
                <div className="text-xs text-gray-600 mb-2">
                  Selected text preview
                </div>

                <div className="border rounded bg-gray-50 p-2 h-32 overflow-auto text-sm whitespace-pre-wrap wrap-break-words">
                  {selectedText || (
                    <span className="text-gray-400">No text selected</span>
                  )}
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={useSelected}
                    disabled={!selectedText}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded disabled:opacity-50"
                  >
                    Use
                  </button>

                  <button
                    onClick={() => {
                      setSelectedText("");
                      setSelectedBlock({ page: null, index: null });
                    }}
                    className="px-3 py-1 bg-gray-200 text-sm rounded"
                  >
                    Clear
                  </button>
                </div>
              </div>
                    
              <div className="text-xs text-gray-500">
                Page {currentPage + 1} of {pages.length}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
