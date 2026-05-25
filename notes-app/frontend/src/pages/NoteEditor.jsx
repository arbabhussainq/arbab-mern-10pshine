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
  Tag,
  Plus,
  Check,
  FileType,
} from "lucide-react";
import useTheme from "../hooks/useTheme";
import { tagsService } from "../services/tagsService";
import { exportAsPDF } from "../services/exportService";

const TAG_COLORS = [
  "#6b7280",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

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
  const [fontSize, setFontSize] = useState("3");
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6b7280");
  const [exportingPDF, setExportingPDF] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const data = await tagsService.getTags();
        setAllTags(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadTags();
  }, []);

  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setSelectedTags(note.tags?.map((t) => t._id) || []);
      if (editorRef.current) {
        editorRef.current.innerHTML = note.content || "";
      }
    } else {
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    }
  }, [note]);

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
    try {
      await onSave({ title, content, tags: selectedTags });
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!title.trim()) return;
    setExportingPDF(true);
    try {
      const noteData = {
        title,
        content: editorRef.current?.innerHTML || "",
        createdAt: note?.createdAt || new Date().toISOString(),
        updatedAt: note?.updatedAt || new Date().toISOString(),
        pinned: note?.pinned || false,
        favourited: note?.favourited || false,
        tags: note?.tags || [],
      };
      await exportAsPDF([noteData], title.trim());
    } catch (err) {
      console.error(err);
    } finally {
      setExportingPDF(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const tag = await tagsService.createTag({
        name: newTagName.trim(),
        color: newTagColor,
      });
      setAllTags([...allTags, tag]);
      setSelectedTags([...selectedTags, tag._id]);
      setNewTagName("");
      setNewTagColor("#6b7280");
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ?
        prev.filter((id) => id !== tagId)
      : [...prev, tagId],
    );
    setTagDropdownOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      if (tagDropdownOpen) {
        setTagDropdownOpen(false);
      } else {
        onClose();
      }
    }
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
        <div style={{ ...styles.header, borderColor: "var(--border-primary)" }}>
          <input
            type="text"
            placeholder="Untitled"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ ...styles.titleInput, color: "var(--text-primary)" }}
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
                ...styles.iconBtn,
                color:
                  exportingPDF ?
                    "var(--text-tertiary)"
                  : "var(--text-secondary)",
                opacity: exportingPDF || !title.trim() ? 0.5 : 1,
              }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleExportPDF}
              disabled={exportingPDF || !title.trim()}
              title="Export as PDF">
              {exportingPDF ?
                <span
                  style={{ fontSize: "10px", color: "var(--text-tertiary)" }}>
                  ...
                </span>
              : <FileType size={15} strokeWidth={1.5} />}
            </button>
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
              style={{ display: "flex", alignItems: "center", gap: "1px" }}>
              <Divider />
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

        {/* Tags row */}
        <div
          style={{
            ...styles.tagsRow,
            borderColor: "var(--border-primary)",
            background: theme === "dark" ? "#191919" : "#fafafa",
          }}>
          <Tag
            size={13}
            strokeWidth={1.5}
            color="var(--text-tertiary)"
            style={{ flexShrink: 0, marginTop: "2px" }}
          />
          <div style={styles.tagsList}>
            {selectedTags.map((tagId) => {
              const tag = allTags.find((t) => t._id === tagId);
              if (!tag) return null;
              return (
                <span key={tagId} style={styles.tagChip}>
                  <span style={{ ...styles.tagDot, background: tag.color }} />
                  {tag.name}
                  <button
                    style={styles.tagRemoveBtn}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      toggleTag(tagId);
                    }}>
                    <X size={10} strokeWidth={2} />
                  </button>
                </span>
              );
            })}
            <button
              style={styles.addTagBtn}
              onMouseDown={(e) => {
                e.preventDefault();
                setTagDropdownOpen(!tagDropdownOpen);
              }}>
              <Plus size={12} strokeWidth={2} />
              Add tag
            </button>
          </div>

          {/* Tag dropdown */}
          {tagDropdownOpen && (
            <div
              style={{
                ...styles.tagDropdown,
                background: theme === "dark" ? "#2a2a2a" : "#ffffff",
                borderColor: "var(--border-primary)",
              }}>
              <div style={styles.tagDropdownList}>
                {allTags.length === 0 && (
                  <p style={styles.tagDropdownEmpty}>No tags yet</p>
                )}
                {allTags.map((tag) => (
                  <button
                    key={tag._id}
                    style={{
                      ...styles.tagDropdownItem,
                      background: "none",
                      border: "none",
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      toggleTag(tag._id);
                    }}>
                    <span style={{ ...styles.tagDot, background: tag.color }} />
                    <span
                      style={{
                        flex: 1,
                        fontSize: "13px",
                        color: "var(--text-primary)",
                        textAlign: "left",
                      }}>
                      {tag.name}
                    </span>
                    {selectedTags.includes(tag._id) && (
                      <Check
                        size={12}
                        strokeWidth={2}
                        color="var(--text-secondary)"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div
                style={{
                  ...styles.tagCreateSection,
                  borderColor: "var(--border-primary)",
                }}>
                <p style={styles.tagCreateLabel}>Create new tag</p>
                <div style={styles.colorPickerRow}>
                  {TAG_COLORS.map((c) => (
                    <button
                      key={c}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setNewTagColor(c);
                      }}
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        background: c,
                        border:
                          newTagColor === c ?
                            "3px solid var(--text-primary)"
                          : "2px solid transparent",
                        cursor: "pointer",
                        flexShrink: 0,
                        boxShadow:
                          newTagColor === c ? `0 0 0 1px ${c}` : "none",
                      }}
                    />
                  ))}
                </div>
                <div style={styles.tagInputRow}>
                  <input
                    type="text"
                    placeholder="Tag name..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateTag();
                      }
                    }}
                    style={{
                      ...styles.tagInput,
                      background: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      borderColor: "var(--border-primary)",
                    }}
                  />
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleCreateTag();
                    }}
                    style={{
                      ...styles.tagCreateBtn,
                      opacity: !newTagName.trim() ? 0.5 : 1,
                    }}
                    disabled={!newTagName.trim()}>
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onKeyUp={updateActiveFormats}
          onMouseUp={updateActiveFormats}
          onSelect={updateActiveFormats}
          onClick={(e) => {
            if (e.target.tagName === "A") {
              e.preventDefault();
              window.open(e.target.href, "_blank");
            }
          }}
          style={{
            ...styles.editor,
            color: "var(--text-primary)",
            caretColor: "var(--text-primary)",
          }}
          data-placeholder="Start writing..."
        />

        {/* Footer */}
        <div style={{ ...styles.footer, borderColor: "var(--border-primary)" }}>
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
  tagsRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "8px 16px",
    borderBottom: "1px solid",
    flexShrink: 0,
    position: "relative",
    minHeight: "40px",
  },
  tagsList: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "6px",
    flex: 1,
  },
  tagChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "3px 8px",
    borderRadius: "20px",
    background: "var(--bg-tertiary)",
    border: "1px solid var(--border-primary)",
    fontSize: "12px",
    color: "var(--text-secondary)",
  },
  tagDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    flexShrink: 0,
    display: "inline-block",
  },
  tagRemoveBtn: {
    display: "flex",
    alignItems: "center",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--text-tertiary)",
    padding: "0",
  },
  addTagBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "3px 8px",
    borderRadius: "20px",
    background: "none",
    border: "1px dashed var(--border-secondary)",
    fontSize: "12px",
    color: "var(--text-tertiary)",
    cursor: "pointer",
  },
  tagDropdown: {
    position: "absolute",
    top: "44px",
    left: "16px",
    width: "260px",
    borderRadius: "10px",
    border: "1px solid",
    zIndex: 200,
    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
    overflow: "hidden",
  },
  tagDropdownList: {
    maxHeight: "160px",
    overflowY: "auto",
    padding: "8px",
  },
  tagDropdownEmpty: {
    fontSize: "12px",
    color: "var(--text-tertiary)",
    padding: "10px 8px",
    textAlign: "center",
    margin: 0,
  },
  tagDropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    padding: "8px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  tagCreateSection: {
    padding: "12px",
    borderTop: "1px solid",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  tagCreateLabel: {
    fontSize: "11px",
    color: "var(--text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: 0,
  },
  colorPickerRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  tagInputRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  tagInput: {
    flex: 1,
    padding: "7px 10px",
    borderRadius: "6px",
    border: "1px solid",
    fontSize: "12px",
    outline: "none",
    fontFamily: "var(--font)",
    minWidth: 0,
  },
  tagCreateBtn: {
    padding: "7px 14px",
    borderRadius: "6px",
    background: "var(--accent)",
    color: "var(--bg-primary)",
    border: "none",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    flexShrink: 0,
    whiteSpace: "nowrap",
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
