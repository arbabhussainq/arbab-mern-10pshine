import { useState, useEffect, useRef } from "react";
import {
  X,
  Save,
  Trash2,
  Maximize2,
  Minimize2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Minus,
} from "lucide-react";
import useTheme from "../hooks/useTheme";

const ToolbarBtn = ({ onClick, title, active, children }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "28px",
        height: "28px",
        borderRadius: "5px",
        border: "none",
        cursor: "pointer",
        background:
          active ? "var(--bg-tertiary)"
          : hovered ? "var(--bg-hover)"
          : "transparent",
        color: active ? "var(--text-primary)" : "var(--text-secondary)",
        transition: "all 0.1s ease",
        fontFamily: "var(--font)",
        fontSize: "13px",
        fontWeight: active ? "600" : "400",
      }}>
      {children}
    </button>
  );
};

const Divider = () => (
  <div
    style={{
      width: "1px",
      height: "18px",
      background: "var(--border-primary)",
      margin: "0 4px",
      flexShrink: 0,
    }}
  />
);

const NoteEditor = ({ note, onSave, onClose, onDelete }) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [activeFormats, setActiveFormats] = useState({});
  const [fontSize, setFontSize] = useState("16");
  const editorRef = useRef(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      if (editorRef.current) {
        editorRef.current.innerHTML = note.content || "";
      }
    }
  }, [note]);

  useEffect(() => {
    if (editorRef.current && !note) {
      editorRef.current.innerHTML = "";
    }
  }, []);

  const exec = (command, value = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      justifyLeft: document.queryCommandState("justifyLeft"),
      justifyCenter: document.queryCommandState("justifyCenter"),
      justifyRight: document.queryCommandState("justifyRight"),
      justifyFull: document.queryCommandState("justifyFull"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    });
    const size = document.queryCommandValue("fontSize");
    if (size) setFontSize(size);
  };


  const handleFontSize = (size) => {
    setFontSize(size);
    exec("fontSize", size);
  };

const handleSave = async () => {
  if (!title.trim()) return;
  setSaving(true);
  const content = editorRef.current ? editorRef.current.innerHTML : "";
  console.log("Saving content:", content); // temporary debug
  try {
    await onSave({ title, content });
  } finally {
    setSaving(false);
  }
};

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") onClose();
    if (e.ctrlKey && e.key === "b") {
      e.preventDefault();
      exec("bold");
    }
    if (e.ctrlKey && e.key === "i") {
      e.preventDefault();
      exec("italic");
    }
    if (e.ctrlKey && e.key === "u") {
      e.preventDefault();
      exec("underline");
    }
  };

  const toolbarGroups = [
    [
      {
        cmd: "bold",
        icon: <Bold size={14} strokeWidth={2} />,
        title: "Bold (Ctrl+B)",
      },
      {
        cmd: "italic",
        icon: <Italic size={14} strokeWidth={2} />,
        title: "Italic (Ctrl+I)",
      },
      {
        cmd: "underline",
        icon: <Underline size={14} strokeWidth={2} />,
        title: "Underline (Ctrl+U)",
      },
      {
        cmd: "strikeThrough",
        icon: <Strikethrough size={14} strokeWidth={2} />,
        title: "Strikethrough",
      },
    ],
    [
      {
        cmd: "justifyLeft",
        icon: <AlignLeft size={14} strokeWidth={1.5} />,
        title: "Align left",
      },
      {
        cmd: "justifyCenter",
        icon: <AlignCenter size={14} strokeWidth={1.5} />,
        title: "Align center",
      },
      {
        cmd: "justifyRight",
        icon: <AlignRight size={14} strokeWidth={1.5} />,
        title: "Align right",
      },
      {
        cmd: "justifyFull",
        icon: <AlignJustify size={14} strokeWidth={1.5} />,
        title: "Justify",
      },
    ],
    [
      {
        cmd: "insertUnorderedList",
        icon: <List size={14} strokeWidth={1.5} />,
        title: "Bullet list",
      },
      {
        cmd: "insertOrderedList",
        icon: <ListOrdered size={14} strokeWidth={1.5} />,
        title: "Numbered list",
      },
      {
        cmd: "insertHorizontalRule",
        icon: <Minus size={14} strokeWidth={1.5} />,
        title: "Divider",
      },
    ],
  ];

  return (
    <div style={styles.overlay} onKeyDown={handleKeyDown}>
      <div
        style={{
          ...styles.modal,
          ...(maximized ? styles.modalMax : {}),
          background: theme === "dark" ? "#1f1f1f" : "#ffffff",
        }}>
        {/* Header */}
        <div
          style={{
            ...styles.header,
            borderColor: "var(--border-primary)",
          }}>
          <input
            type="text"
            placeholder="Untitled"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              ...styles.titleInput,
              color: "var(--text-primary)",
            }}
            autoFocus
          />
          <div style={styles.headerActions}>
            {note && (
              <button
                style={{ ...styles.iconBtn, color: "#e03e3e" }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onDelete(note._id);
                  onClose();
                }}
                title="Delete note">
                <Trash2 size={15} strokeWidth={1.5} />
              </button>
            )}
            <button
              style={{
                ...styles.saveBtn,
                opacity: !title.trim() || saving ? 0.5 : 1,
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSave();
              }}
              disabled={!title.trim() || saving}>
              <Save size={13} strokeWidth={1.5} />
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              style={styles.iconBtn}
              onClick={() => setMaximized(!maximized)}
              title={maximized ? "Minimize" : "Maximize"}>
              {maximized ?
                <Minimize2 size={15} strokeWidth={1.5} />
              : <Maximize2 size={15} strokeWidth={1.5} />}
            </button>
            <button style={styles.iconBtn} onClick={onClose} title="Close">
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div
          style={{
            ...styles.toolbar,
            borderColor: "var(--border-primary)",
            background: theme === "dark" ? "#191919" : "#fafafa",
          }}>
          {/* Font size */}
          <select
            value={fontSize}
            onChange={(e) => handleFontSize(e.target.value)}
            style={{
              ...styles.fontSizeSelect,
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              borderColor: "var(--border-primary)",
            }}>
            {["1", "2", "3", "4", "5", "6", "7"].map((s, i) => (
              <option key={s} value={s}>
                {[10, 13, 16, 18, 24, 32, 48][i]}px
              </option>
            ))}
          </select>


          {toolbarGroups.map((group, gi) => (
            <div
              key={gi}
              style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {group.map((btn) => (
                <ToolbarBtn
                  key={btn.cmd}
                  onClick={() => exec(btn.cmd)}
                  title={btn.title}
                  active={activeFormats[btn.cmd]}>
                  {btn.icon}
                </ToolbarBtn>
              ))}
            </div>
          ))}
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          onSelect={updateActiveFormats}
          style={{
            ...styles.editor,
            color: "var(--text-primary)",
            caretColor: "var(--text-primary)",
          }}
          data-placeholder="Start writing..."
        />

        {/* Footer */}
        <div
          style={{
            ...styles.footer,
            borderColor: "var(--border-primary)",
          }}>
          <span style={styles.hint}>
            <kbd style={styles.kbd}>Ctrl+S</kbd> save ·{" "}
            <kbd style={styles.kbd}>Ctrl+B</kbd> bold ·{" "}
            <kbd style={styles.kbd}>Ctrl+I</kbd> italic ·{" "}
            <kbd style={styles.kbd}>Esc</kbd> close
          </span>
          <span style={styles.charCount}>
            {editorRef.current?.innerText?.length || 0} characters
          </span>
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
    maxWidth: "760px",
    maxHeight: "88vh",
    borderRadius: "12px",
    border: "1px solid var(--border-primary)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
    transition: "all 0.2s ease",
  },
  modalMax: {
    maxWidth: "100%",
    width: "100%",
    maxHeight: "100vh",
    height: "100vh",
    borderRadius: "0",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 18px",
    borderBottom: "1px solid",
    gap: "12px",
    flexShrink: 0,
  },
  titleInput: {
    flex: 1,
    fontSize: "18px",
    fontWeight: "500",
    background: "transparent",
    border: "none",
    outline: "none",
    fontFamily: "var(--font)",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  iconBtn: {
    color: "var(--text-secondary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "30px",
    height: "30px",
    borderRadius: "6px",
    cursor: "pointer",
    background: "none",
    border: "none",
    transition: "background 0.1s ease",
  },
  saveBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    background: "var(--accent)",
    color: "var(--bg-primary)",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    border: "none",
    transition: "opacity 0.15s ease",
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: "1px",
    padding: "6px 14px",
    borderBottom: "1px solid",
    flexShrink: 0,
    flexWrap: "wrap",
  },
  fontSizeSelect: {
    padding: "3px 6px",
    borderRadius: "5px",
    border: "1px solid",
    fontSize: "12px",
    cursor: "pointer",
    outline: "none",
    fontFamily: "var(--font)",
  },
  editor: {
    flex: 1,
    padding: "24px 28px",
    fontSize: "16px",
    lineHeight: "1.8",
    outline: "none",
    overflowY: "auto",
    fontFamily: "var(--font)",
    minHeight: "320px",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 18px",
    borderTop: "1px solid",
    flexShrink: 0,
  },
  hint: {
    fontSize: "11px",
    color: "var(--text-tertiary)",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    flexWrap: "wrap",
  },
  kbd: {
    background: "var(--bg-tertiary)",
    border: "1px solid var(--border-primary)",
    borderRadius: "3px",
    padding: "1px 5px",
    fontSize: "11px",
    fontFamily: "var(--font)",
  },
  charCount: {
    fontSize: "11px",
    color: "var(--text-tertiary)",
  },
};

export default NoteEditor;
