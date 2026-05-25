import { useState, useRef } from "react";
import {
  X,
  Download,
  Upload,
  FileJson,
  FileText,
  FileType,
  Trash2,
  Check,
  AlertCircle,
} from "lucide-react";
import useTheme from "../hooks/useTheme";
import {
  exportAsJSON,
  exportAsTXT,
  exportAsPDF,
} from "../services/exportService";
import { notesService } from "../services/notesService";

const ExportImportModal = ({ notes, onClose, onImportSuccess }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("export");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleExportJSON = () => {
    exportAsJSON(notes);
  };

  const handleExportTXT = () => {
    exportAsTXT(notes);
  };

  const handleExportPDF = async () => {
    setPdfLoading(true);
    try {
      await exportAsPDF(notes);
    } catch (err) {
      console.error(err);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportError("");
    setImportResult(null);

    if (!file.name.endsWith(".json")) {
      setImportError("Only JSON files are supported for import");
      return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!Array.isArray(parsed)) {
        setImportError(
          "Invalid format — JSON file must contain an array of notes",
        );
        return;
      }

      const validNotes = parsed.filter(
        (n) => n.title && typeof n.title === "string",
      );
      if (validNotes.length === 0) {
        setImportError("No valid notes found in the file");
        return;
      }

      const result = await notesService.importNotes(validNotes);
      setImportResult(result);
      if (result.imported > 0) {
        onImportSuccess();
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        setImportError("Invalid JSON file — please check the file format");
      } else {
        setImportError(err.message);
      }
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  return (
    <div style={styles.overlay}>
      <div
        style={{
          ...styles.modal,
          background: theme === "dark" ? "#1f1f1f" : "#ffffff",
          borderColor: "var(--border-primary)",
        }}>
        {/* Header */}
        <div style={{ ...styles.header, borderColor: "var(--border-primary)" }}>
          <h2 style={styles.title}>Export & Import</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ ...styles.tabs, borderColor: "var(--border-primary)" }}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "export" ? styles.tabActive : {}),
              borderColor:
                activeTab === "export" ? "var(--text-primary)" : "transparent",
            }}
            onClick={() => setActiveTab("export")}>
            <Download size={13} strokeWidth={1.5} />
            Export
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "import" ? styles.tabActive : {}),
              borderColor:
                activeTab === "import" ? "var(--text-primary)" : "transparent",
            }}
            onClick={() => setActiveTab("import")}>
            <Upload size={13} strokeWidth={1.5} />
            Import
          </button>
        </div>

        <div style={styles.content}>
          {/* Export tab */}
          {activeTab === "export" && (
            <div style={styles.section}>
              <p style={styles.desc}>
                Export all your notes ({notes.length} note
                {notes.length !== 1 ? "s" : ""}) in your preferred format.
              </p>

              <div style={styles.exportOptions}>
                {/* JSON */}
                <div
                  style={{
                    ...styles.exportCard,
                    borderColor: "var(--border-primary)",
                    background: "var(--bg-secondary)",
                  }}>
                  <div style={styles.exportCardLeft}>
                    <div
                      style={{ ...styles.exportIcon, background: "#e8f5e9" }}>
                      <FileJson size={18} strokeWidth={1.5} color="#2e7d32" />
                    </div>
                    <div>
                      <p style={styles.exportFormat}>JSON</p>
                      <p style={styles.exportDesc}>
                        Full data with all metadata. Perfect for reimporting
                        later.
                      </p>
                    </div>
                  </div>
                  <button style={styles.exportBtn} onClick={handleExportJSON}>
                    <Download size={13} strokeWidth={1.5} />
                    Export
                  </button>
                </div>

                {/* TXT */}
                <div
                  style={{
                    ...styles.exportCard,
                    borderColor: "var(--border-primary)",
                    background: "var(--bg-secondary)",
                  }}>
                  <div style={styles.exportCardLeft}>
                    <div
                      style={{ ...styles.exportIcon, background: "#e3f2fd" }}>
                      <FileText size={18} strokeWidth={1.5} color="#1565c0" />
                    </div>
                    <div>
                      <p style={styles.exportFormat}>Plain Text</p>
                      <p style={styles.exportDesc}>
                        Simple readable format. Open in any text editor.
                      </p>
                    </div>
                  </div>
                  <button style={styles.exportBtn} onClick={handleExportTXT}>
                    <Download size={13} strokeWidth={1.5} />
                    Export
                  </button>
                </div>

                {/* PDF */}
                <div
                  style={{
                    ...styles.exportCard,
                    borderColor: "var(--border-primary)",
                    background: "var(--bg-secondary)",
                  }}>
                  <div style={styles.exportCardLeft}>
                    <div
                      style={{ ...styles.exportIcon, background: "#fce4ec" }}>
                      <FileType size={18} strokeWidth={1.5} color="#c62828" />
                    </div>
                    <div>
                      <p style={styles.exportFormat}>PDF</p>
                      <p style={styles.exportDesc}>
                        Beautifully formatted. Includes cover page and table of
                        contents.
                      </p>
                    </div>
                  </div>
                  <button
                    style={{
                      ...styles.exportBtn,
                      opacity: pdfLoading ? 0.6 : 1,
                    }}
                    onClick={handleExportPDF}
                    disabled={pdfLoading}>
                    {pdfLoading ?
                      "Generating..."
                    : <>
                        <Download size={13} strokeWidth={1.5} /> Export
                      </>
                    }
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Import tab */}
          {activeTab === "import" && (
            <div style={styles.section}>
              <p style={styles.desc}>
                Import notes from a JSON file. Duplicate notes (same title and
                content) will be skipped automatically.
              </p>

              {importError && (
                <div style={styles.errorBox}>
                  <AlertCircle size={14} strokeWidth={1.5} />
                  {importError}
                </div>
              )}

              {importResult && (
                <div style={styles.successBox}>
                  <Check size={14} strokeWidth={2} />
                  <div>
                    <p style={{ margin: 0, fontWeight: "500" }}>
                      {importResult.message}
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: "12px",
                        opacity: 0.8,
                      }}>
                      {importResult.imported} imported · {importResult.skipped}{" "}
                      skipped
                    </p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                style={{ display: "none" }}
              />

              <button
                style={{
                  ...styles.uploadBtn,
                  borderColor: "var(--border-secondary)",
                  opacity: importing ? 0.6 : 1,
                }}
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}>
                <Upload
                  size={20}
                  strokeWidth={1.5}
                  color="var(--text-tertiary)"
                />
                <p style={styles.uploadTitle}>
                  {importing ? "Importing..." : "Click to select a JSON file"}
                </p>
                <p style={styles.uploadSubtitle}>
                  Only .json files exported from Noted are supported
                </p>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: "24px",
    backdropFilter: "blur(3px)",
  },
  modal: {
    width: "100%",
    maxWidth: "480px",
    borderRadius: "12px",
    border: "1px solid",
    overflow: "hidden",
    boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid",
  },
  title: {
    fontSize: "15px",
    fontWeight: "500",
    color: "var(--text-primary)",
  },
  closeBtn: {
    color: "var(--text-secondary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  tabs: {
    display: "flex",
    borderBottom: "1px solid",
    padding: "0 20px",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "12px 4px",
    marginRight: "20px",
    fontSize: "13px",
    color: "var(--text-secondary)",
    background: "none",
    border: "none",
    borderBottom: "2px solid",
    cursor: "pointer",
    fontFamily: "var(--font)",
    transition: "all 0.15s ease",
  },
  tabActive: {
    color: "var(--text-primary)",
    fontWeight: "500",
  },
  content: {
    padding: "20px",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  desc: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
  },
  exportOptions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  exportCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid",
    gap: "12px",
  },
  exportCardLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
  },
  exportIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  exportFormat: {
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--text-primary)",
    margin: "0 0 2px",
  },
  exportDesc: {
    fontSize: "11px",
    color: "var(--text-tertiary)",
    margin: 0,
    lineHeight: "1.4",
  },
  exportBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 14px",
    background: "var(--accent)",
    color: "var(--bg-primary)",
    borderRadius: "7px",
    fontSize: "12px",
    fontWeight: "500",
    border: "none",
    cursor: "pointer",
    flexShrink: 0,
    fontFamily: "var(--font)",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#fff0f0",
    border: "1px solid #fcc",
    color: "#c00",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
  },
  successBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#16a34a",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
  },
  uploadBtn: {
    width: "100%",
    padding: "32px 20px",
    border: "2px dashed",
    borderRadius: "10px",
    background: "none",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    fontFamily: "var(--font)",
    transition: "border-color 0.15s ease",
  },
  uploadTitle: {
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--text-secondary)",
    margin: 0,
  },
  uploadSubtitle: {
    fontSize: "11px",
    color: "var(--text-tertiary)",
    margin: 0,
  },
};

export default ExportImportModal;
