import jsPDF from "jspdf";

// Strip HTML tags for plain text
const stripHtml = (html) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

// Export as JSON
export const exportAsJSON = (notes, filename = "noted-export") => {
  const exportData = notes.map((note) => ({
    title: note.title,
    content: note.content,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    pinned: note.pinned,
    favourited: note.favourited,
    tags: note.tags?.map((t) => t.name) || [],
  }));

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, `${filename}.json`);
};

// Export as TXT
export const exportAsTXT = (notes, filename = "noted-export") => {
  const text = notes
    .map((note) => {
      const divider = "─".repeat(50);
      const date = new Date(note.createdAt).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const tags = note.tags?.map((t) => t.name).join(", ") || "None";
      const content = stripHtml(note.content) || "No content";

      return [
        divider,
        `📝 ${note.title}`,
        `📅 ${date}`,
        `🏷️  Tags: ${tags}`,
        divider,
        content,
        "",
      ].join("\n");
    })
    .join("\n\n");

  const blob = new Blob([text], { type: "text/plain" });
  downloadBlob(blob, `${filename}.txt`);
};

// Export as PDF
export const exportAsPDF = async (notes, filename = "noted-export") => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Colors
  const colors = {
    black: [26, 26, 26],
    gray: [107, 107, 107],
    lightGray: [230, 230, 230],
    accent: [47, 47, 47],
    bg: [247, 247, 245],
  };

  const addNewPageIfNeeded = (neededHeight) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      addPageHeader();
    }
  };

  const addPageHeader = () => {
    // Subtle top bar
    doc.setFillColor(...colors.bg);
    doc.rect(0, 0, pageWidth, 12, "F");
    doc.setFontSize(8);
    doc.setTextColor(...colors.gray);
    doc.setFont("helvetica", "normal");
    doc.text("Noted", margin, 8);
    doc.text(
      `Page ${doc.internal.getCurrentPageInfo().pageNumber}`,
      pageWidth - margin,
      8,
      { align: "right" },
    );
    y = Math.max(y, 18);
  };

  // Cover page
  doc.setFillColor(...colors.black);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Logo area
  doc.setFontSize(32);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Noted", pageWidth / 2, pageHeight / 2 - 20, { align: "center" });

  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 180, 180);
  doc.text("Your exported notes", pageWidth / 2, pageHeight / 2, {
    align: "center",
  });

  doc.setFontSize(11);
  doc.setTextColor(120, 120, 120);
  const exportDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(exportDate, pageWidth / 2, pageHeight / 2 + 12, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `${notes.length} note${notes.length !== 1 ? "s" : ""}`,
    pageWidth / 2,
    pageHeight / 2 + 24,
    { align: "center" },
  );

  // Table of contents page
  doc.addPage();
  y = margin;
  addPageHeader();

  doc.setFontSize(18);
  doc.setTextColor(...colors.black);
  doc.setFont("helvetica", "bold");
  doc.text("Contents", margin, y + 8);
  y += 20;

  doc.setDrawColor(...colors.lightGray);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  notes.forEach((note, index) => {
    addNewPageIfNeeded(8);
    doc.setFontSize(10);
    doc.setTextColor(...colors.gray);
    doc.setFont("helvetica", "normal");
    doc.text(`${index + 1}.`, margin, y);
    doc.setTextColor(...colors.black);
    doc.text(note.title, margin + 8, y);
    const date = new Date(note.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    doc.setTextColor(...colors.gray);
    doc.text(date, pageWidth - margin, y, { align: "right" });
    y += 8;
  });

  // Notes pages
  notes.forEach((note, index) => {
    doc.addPage();
    y = margin;
    addPageHeader();

    // Note number badge
    doc.setFillColor(...colors.bg);
    doc.roundedRect(margin, y, 24, 7, 2, 2, "F");
    doc.setFontSize(8);
    doc.setTextColor(...colors.gray);
    doc.setFont("helvetica", "normal");
    doc.text(`${index + 1} / ${notes.length}`, margin + 12, y + 5, {
      align: "center",
    });
    y += 14;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(...colors.black);
    doc.setFont("helvetica", "bold");
    const titleLines = doc.splitTextToSize(note.title, contentWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 9 + 4;

    // Meta row
    const createdDate = new Date(note.createdAt).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.setFontSize(9);
    doc.setTextColor(...colors.gray);
    doc.setFont("helvetica", "normal");
    doc.text(createdDate, margin, y);

    // Tags
    if (note.tags?.length > 0) {
      const tagsText = note.tags
        .map((t) => (typeof t === "string" ? t : t.name))
        .join("  ·  ");
      doc.text(`  ·  ${tagsText}`, margin + doc.getTextWidth(createdDate), y);
    }
    y += 6;

    // Badges row
    if (note.pinned || note.favourited) {
      const badges = [];
      if (note.pinned) badges.push("📌 Pinned");
      if (note.favourited) badges.push("⭐ Favourite");
      doc.setFontSize(8);
      doc.setTextColor(...colors.gray);
      doc.text(badges.join("   "), margin, y);
      y += 6;
    }

    // Divider
    y += 4;
    doc.setDrawColor(...colors.lightGray);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Content
    const plainContent = stripHtml(note.content);
    if (plainContent.trim()) {
      doc.setFontSize(11);
      doc.setTextColor(...colors.accent);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(plainContent, contentWidth);

      lines.forEach((line) => {
        addNewPageIfNeeded(7);
        doc.text(line, margin, y);
        y += 7;
      });
    } else {
      doc.setFontSize(10);
      doc.setTextColor(...colors.lightGray);
      doc.setFont("helvetica", "italic");
      doc.text("No content", margin, y);
      y += 7;
    }

    // Bottom border on last line
    y += 6;
    doc.setDrawColor(...colors.lightGray);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
  });

  doc.save(`${filename}.pdf`);
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
