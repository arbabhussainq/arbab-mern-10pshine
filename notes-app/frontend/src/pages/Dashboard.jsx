import { useState, useEffect } from "react";
import {
  NotebookPen,
  Plus,
  Search,
  Trash2,
  Star,
  Sun,
  Moon,
  LogOut,
  StickyNote,
  X,
  Menu,
  Pin,
  PinOff,
  RotateCcw,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import useTheme from "../hooks/useTheme";
import { notesService } from "../services/notesService";
import { tagsService } from "../services/tagsService";
import NoteEditor from "./NoteEditor";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [trashNotes, setTrashNotes] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState("all");
  const [activeTag, setActiveTag] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hoveredTag, setHoveredTag] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [notesData, tagsData] = await Promise.all([
          notesService.getNotes(),
          tagsService.getTags(),
        ]);
        setNotes(notesData);
        setTags(tagsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fetchNotes = async () => {
    try {
      const data = await notesService.getNotes();
      setNotes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTrash = async () => {
    try {
      const data = await notesService.getTrashNotes();
      setTrashNotes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setActiveTag(null);
    if (section === "trash") fetchTrash();
  };

  const handleTagClick = (tagId) => {
    setActiveTag(activeTag === tagId ? null : tagId);
    setActiveSection("all");
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setIsEditorOpen(true);
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setIsEditorOpen(true);
  };

  const handleSaveNote = async (noteData) => {
    try {
      if (selectedNote) {
        await notesService.updateNote(selectedNote._id, noteData);
      } else {
        await notesService.createNote(noteData);
      }
      // Refetch notes so tags are fully populated (backend returns ObjectIds otherwise)
      await fetchNotes();
      const updatedTags = await tagsService.getTags();
      setTags(updatedTags);
      setIsEditorOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSoftDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notesService.updateNote(id, { deleted: true });
      setNotes(notes.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestore = async (id) => {
    try {
      await notesService.updateNote(id, { deleted: false });
      setTrashNotes(trashNotes.filter((n) => n._id !== id));
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePermanentDelete = async (id) => {
    try {
      await notesService.deleteNote(id);
      setTrashNotes(trashNotes.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (note, e) => {
    if (e) e.stopPropagation();
    try {
      const updated = await notesService.updateNote(note._id, {
        pinned: !note.pinned,
      });
      setNotes(notes.map((n) => (n._id === updated._id ? updated : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFavourite = async (note, e) => {
    if (e) e.stopPropagation();
    try {
      const updated = await notesService.updateNote(note._id, {
        favourited: !note.favourited,
      });
      setNotes(notes.map((n) => (n._id === updated._id ? updated : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase());
    if (activeSection === "favourites") return matchesSearch && note.favourited;
    if (activeTag)
      return matchesSearch && note.tags?.some((t) => t._id === activeTag);
    return matchesSearch;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.pinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.pinned);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const activeTagName = tags.find((t) => t._id === activeTag)?.name;

  return (
    <div style={styles.app}>
      {/* Sidebar */}
      <div
        style={{
          ...styles.sidebar,
          width: sidebarOpen ? "240px" : "0px",
          overflow: "hidden",
          transition: "width 0.2s ease",
        }}>
        <div style={styles.sidebarInner}>
          <div style={styles.logo}>
            <NotebookPen size={18} strokeWidth={1.5} />
            <span style={styles.logoText}>Noted</span>
          </div>

          <nav style={styles.nav}>
            {[
              {
                id: "all",
                label: "All notes",
                icon: <StickyNote size={15} strokeWidth={1.5} />,
              },
              {
                id: "favourites",
                label: "Favourites",
                icon: <Star size={15} strokeWidth={1.5} />,
              },
              {
                id: "trash",
                label: "Trash",
                icon: <Trash2 size={15} strokeWidth={1.5} />,
              },
            ].map((item) => (
              <button
                key={item.id}
                style={{
                  ...styles.navItem,
                  ...(activeSection === item.id && !activeTag ?
                    styles.navItemActive
                  : {}),
                }}
                onClick={() => handleSectionChange(item.id)}>
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Tags section */}
          {tags.length > 0 && (
            <div style={styles.tagsSection}>
              <p style={styles.tagsSectionLabel}>Tags</p>
              <div style={styles.tagsSectionList}>
                {tags.map((tag) => (
                  <button
                    key={tag._id}
                    style={{
                      ...styles.tagSidebarItem,
                      ...(activeTag === tag._id ? styles.navItemActive : {}),
                    }}
                    onMouseEnter={() => setHoveredTag(tag._id)}
                    onMouseLeave={() => setHoveredTag(null)}
                    onClick={() => handleTagClick(tag._id)}>
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: tag.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                      {tag.name}
                    </span>
                    <Trash2
                      size={13}
                      strokeWidth={1.5}
                      style={{
                        flexShrink: 0,
                        opacity: hoveredTag === tag._id ? 0.4 : 0,
                      }}
                      onClick={async (e) => {
                        e.stopPropagation();
                        await tagsService.deleteTag(tag._id);
                        setTags(tags.filter((t) => t._id !== tag._id));
                        setNotes(
                          notes.map((n) => ({
                            ...n,
                            tags: n.tags.filter((t) => t._id !== tag._id),
                          })),
                        );
                        if (activeTag === tag._id) setActiveTag(null);
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={styles.sidebarBottom}>
            <button style={styles.themeBtn} onClick={toggleTheme}>
              {theme === "light" ?
                <>
                  <Moon size={14} strokeWidth={1.5} /> Dark mode
                </>
              : <>
                  <Sun size={14} strokeWidth={1.5} /> Light mode
                </>
              }
            </button>
            <div style={styles.userRow}>
              <div style={styles.avatar}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span
                style={{ ...styles.userName, cursor: "pointer" }}
                onClick={() => navigate("/profile")}
                title="View profile">
                {user?.name}
              </span>
              <button style={styles.logoutBtn} onClick={logout} title="Logout">
                <LogOut size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={styles.main}>
        <div style={styles.topbar}>
          <div style={styles.topbarLeft}>
            <button
              style={styles.menuBtn}
              onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ?
                <X size={16} strokeWidth={1.5} />
              : <Menu size={16} strokeWidth={1.5} />}
            </button>
            <span style={styles.pageTitle}>
              {activeTag ?
                activeTagName
              : activeSection === "all" ?
                "All notes"
              : activeSection === "favourites" ?
                "Favourites"
              : "Trash"}
            </span>
          </div>
          <div style={styles.topbarRight}>
            <div style={styles.searchBar}>
              <Search
                size={14}
                strokeWidth={1.5}
                color="var(--text-tertiary)"
              />
              <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            {activeSection !== "trash" && (
              <button style={styles.newBtn} onClick={handleNewNote}>
                <Plus size={15} strokeWidth={1.5} />
                New note
              </button>
            )}
          </div>
        </div>

        <div style={styles.content}>
          {/* Trash */}
          {activeSection === "trash" &&
            (trashNotes.length === 0 ?
              <div style={styles.emptyState}>
                <Trash2
                  size={32}
                  strokeWidth={1}
                  color="var(--text-tertiary)"
                />
                <p style={styles.emptyTitle}>Trash is empty</p>
                <p style={styles.emptySubtitle}>
                  Deleted notes will appear here
                </p>
              </div>
            : <>
                <p style={styles.sectionLabel}>Deleted notes</p>
                <div style={styles.grid}>
                  {trashNotes.map((note) => (
                    <TrashCard
                      key={note._id}
                      note={note}
                      onRestore={handleRestore}
                      onDelete={handlePermanentDelete}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </>)}

          {/* All notes / Favourites / Tag filter */}
          {activeSection !== "trash" &&
            (loading ?
              <div style={styles.emptyState}>
                <p style={styles.emptySubtitle}>Loading your notes...</p>
              </div>
            : filteredNotes.length === 0 ?
              <div style={styles.emptyState}>
                <StickyNote
                  size={32}
                  strokeWidth={1}
                  color="var(--text-tertiary)"
                />
                <p style={styles.emptyTitle}>
                  {activeSection === "favourites" ?
                    "No favourites yet"
                  : activeTag ?
                    "No notes with this tag"
                  : "No notes yet"}
                </p>
                <p style={styles.emptySubtitle}>
                  {activeSection === "favourites" ?
                    "Star a note to add it here"
                  : activeTag ?
                    "Add this tag to a note from the editor"
                  : 'Click "New note" to get started'}
                </p>
              </div>
            : <>
                {pinnedNotes.length > 0 && (
                  <>
                    <p style={styles.sectionLabel}>Pinned</p>
                    <div style={styles.grid}>
                      {pinnedNotes.map((note) => (
                        <NoteCard
                          key={note._id}
                          note={note}
                          onEdit={handleEditNote}
                          onDelete={handleSoftDelete}
                          onPin={handleTogglePin}
                          onFavourite={handleToggleFavourite}
                          formatDate={formatDate}
                        />
                      ))}
                    </div>
                  </>
                )}
                {unpinnedNotes.length > 0 && (
                  <>
                    {pinnedNotes.length > 0 && (
                      <p style={styles.sectionLabel}>Other notes</p>
                    )}
                    <div style={styles.grid}>
                      {unpinnedNotes.map((note) => (
                        <NoteCard
                          key={note._id}
                          note={note}
                          onEdit={handleEditNote}
                          onDelete={handleSoftDelete}
                          onPin={handleTogglePin}
                          onFavourite={handleToggleFavourite}
                          formatDate={formatDate}
                        />
                      ))}
                      <button style={styles.newCard} onClick={handleNewNote}>
                        <Plus
                          size={18}
                          strokeWidth={1.5}
                          color="var(--text-tertiary)"
                        />
                        <span
                          style={{
                            fontSize: "13px",
                            color: "var(--text-tertiary)",
                          }}>
                          New note
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </>)}
        </div>
      </div>

      {isEditorOpen && (
        <NoteEditor
          note={selectedNote}
          onSave={handleSaveNote}
          onClose={() => setIsEditorOpen(false)}
          onDelete={(id) => {
            handleSoftDelete(id);
            setIsEditorOpen(false);
          }}
        />
      )}
    </div>
  );
};

const NoteCard = ({
  note,
  onEdit,
  onDelete,
  onPin,
  onFavourite,
  formatDate,
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.card,
        borderColor:
          hovered ? "var(--border-secondary)" : "var(--border-primary)",
      }}
      onClick={() => onEdit(note)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <div style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>{note.title}</h3>
        <div style={{ ...styles.cardActions, opacity: hovered ? 1 : 0 }}>
          <button
            style={{
              ...styles.cardBtn,
              color: note.favourited ? "#e8b84b" : "var(--text-tertiary)",
            }}
            onClick={(e) => onFavourite(note, e)}
            title={note.favourited ? "Unfavourite" : "Favourite"}>
            <Star
              size={13}
              strokeWidth={1.5}
              fill={note.favourited ? "currentColor" : "none"}
            />
          </button>
          <button
            style={{
              ...styles.cardBtn,
              color:
                note.pinned ? "var(--text-primary)" : "var(--text-tertiary)",
            }}
            onClick={(e) => onPin(note, e)}
            title={note.pinned ? "Unpin" : "Pin"}>
            {note.pinned ?
              <PinOff size={13} strokeWidth={1.5} />
            : <Pin size={13} strokeWidth={1.5} />}
          </button>
          <button
            style={{ ...styles.cardBtn, color: "var(--danger)" }}
            onClick={(e) => onDelete(note._id, e)}
            title="Delete">
            <Trash2 size={13} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <p
        style={styles.cardPreview}
        dangerouslySetInnerHTML={{
          __html:
            note.content ||
            '<span style="opacity:0.5">No additional text</span>',
        }}
      />

      {note.tags?.length > 0 && (
        <div style={styles.cardTags}>
          {note.tags.slice(0, 3).map((tag) => (
            <span key={tag._id} style={styles.cardTagChip}>
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: tag.color,
                  flexShrink: 0,
                  display: "inline-block",
                }}
              />
              {tag.name}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span style={styles.cardTagChip}>+{note.tags.length - 3}</span>
          )}
        </div>
      )}

      <p style={styles.cardDate}>{formatDate(note.createdAt)}</p>
    </div>
  );
};

const TrashCard = ({ note, onRestore, onDelete, formatDate }) => {
  return (
    <div style={{ ...styles.card, opacity: 0.7 }}>
      <div style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>{note.title}</h3>
        <div style={styles.cardActions}>
          <button
            style={{ ...styles.cardBtn, color: "var(--text-secondary)" }}
            onClick={() => onRestore(note._id)}
            title="Restore">
            <RotateCcw size={13} strokeWidth={1.5} />
          </button>
          <button
            style={{ ...styles.cardBtn, color: "var(--danger)" }}
            onClick={() => onDelete(note._id)}
            title="Delete permanently">
            <Trash2 size={13} strokeWidth={1.5} />
          </button>
        </div>
      </div>
      <p style={styles.cardPreview}>{note.content || "No additional text"}</p>
      <p style={styles.cardDate}>{formatDate(note.updatedAt)}</p>
    </div>
  );
};

const styles = {
  app: {
    display: "flex",
    height: "100vh",
    background: "var(--bg-primary)",
    overflow: "hidden",
  },
  sidebar: {
    borderRight: "1px solid var(--border-primary)",
    background: "var(--bg-secondary)",
    flexShrink: 0,
  },
  sidebarInner: {
    width: "240px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    padding: "16px 8px",
    overflowY: "auto",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "4px 8px 20px",
    color: "var(--text-primary)",
  },
  logoText: {
    fontSize: "15px",
    fontWeight: "500",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "7px 8px",
    borderRadius: "6px",
    fontSize: "13px",
    color: "var(--text-secondary)",
    background: "none",
    border: "none",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    transition: "var(--transition)",
  },
  navItemActive: {
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    fontWeight: "500",
  },
  tagsSection: {
    marginTop: "16px",
    paddingTop: "12px",
    borderTop: "1px solid var(--border-primary)",
  },
  tagsSectionLabel: {
    fontSize: "11px",
    color: "var(--text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    padding: "0 8px",
    marginBottom: "4px",
  },
  tagsSectionList: {
    maxHeight: "180px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  tagSidebarItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "7px 8px",
    borderRadius: "6px",
    fontSize: "13px",
    color: "var(--text-secondary)",
    background: "none",
    border: "none",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    transition: "var(--transition)",
  },
  sidebarBottom: {
    marginTop: "auto",
    borderTop: "1px solid var(--border-primary)",
    paddingTop: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  themeBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "7px 8px",
    borderRadius: "6px",
    fontSize: "13px",
    color: "var(--text-secondary)",
    background: "none",
    border: "none",
    cursor: "pointer",
    width: "100%",
  },
  userRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "7px 8px",
  },
  avatar: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "var(--bg-tertiary)",
    border: "1px solid var(--border-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "500",
    color: "var(--text-secondary)",
    flexShrink: 0,
  },
  userName: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  logoutBtn: {
    color: "var(--text-tertiary)",
    display: "flex",
    alignItems: "center",
    padding: "4px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  topbar: {
    height: "52px",
    borderBottom: "1px solid var(--border-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    gap: "12px",
    flexShrink: 0,
  },
  topbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  menuBtn: {
    color: "var(--text-secondary)",
    display: "flex",
    alignItems: "center",
    padding: "6px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  pageTitle: {
    fontSize: "14px",
    fontWeight: "500",
    color: "var(--text-primary)",
  },
  topbarRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "7px 12px",
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-primary)",
    borderRadius: "8px",
    width: "220px",
  },
  searchInput: {
    background: "none",
    border: "none",
    outline: "none",
    fontSize: "13px",
    color: "var(--text-primary)",
    width: "100%",
  },
  newBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 14px",
    background: "var(--accent)",
    color: "var(--bg-primary)",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    border: "none",
    flexShrink: 0,
  },
  content: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
  },
  sectionLabel: {
    fontSize: "11px",
    color: "var(--text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "12px",
    fontWeight: "500",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "12px",
    marginBottom: "28px",
  },
  card: {
    border: "1px solid var(--border-primary)",
    borderRadius: "10px",
    padding: "14px",
    cursor: "pointer",
    transition: "border-color 0.15s ease",
    background: "var(--bg-primary)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "8px",
    gap: "8px",
  },
  cardTitle: {
    fontSize: "13px",
    fontWeight: "500",
    color: "var(--text-primary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
  },
  cardActions: {
    display: "flex",
    gap: "4px",
    transition: "opacity 0.15s ease",
    flexShrink: 0,
  },
  cardBtn: {
    color: "var(--text-tertiary)",
    display: "flex",
    alignItems: "center",
    padding: "3px",
    borderRadius: "4px",
    cursor: "pointer",
    background: "none",
    border: "none",
  },
  cardPreview: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    lineHeight: "1.5",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    marginBottom: "8px",
  },
  cardTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
    marginBottom: "8px",
  },
  cardTagChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "2px 7px",
    borderRadius: "20px",
    background: "var(--bg-tertiary)",
    border: "1px solid var(--border-primary)",
    fontSize: "11px",
    color: "var(--text-tertiary)",
  },
  cardDate: {
    fontSize: "11px",
    color: "var(--text-tertiary)",
  },
  newCard: {
    border: "1px dashed var(--border-primary)",
    borderRadius: "10px",
    padding: "14px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "none",
    minHeight: "120px",
    transition: "border-color 0.15s ease",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    gap: "12px",
  },
  emptyTitle: {
    fontSize: "15px",
    fontWeight: "500",
    color: "var(--text-secondary)",
  },
  emptySubtitle: {
    fontSize: "13px",
    color: "var(--text-tertiary)",
  },
};

export default Dashboard;
