// PDF Export Utility for Professional Article Formatting
import jsPDF from "jspdf";

/**
 * PDF Export Service
 * Generates professionally formatted PDFs from compiled articles
 */

// PDF configuration
const PDF_CONFIG = {
  pageWidth: 210, // A4 width in mm
  pageHeight: 297, // A4 height in mm
  margins: {
    top: 20,
    bottom: 20,
    left: 20,
    right: 20,
  },
  fonts: {
    title: 18,
    subtitle: 14,
    body: 12,
    small: 10,
  },
  colors: {
    primary: "#63a29b",
    secondary: "#275151",
    text: "#333333",
    light: "#666666",
  },
};

/**
 * Generate PDF from article data
 * @param {Object} articleData - Article and analysis data
 * @param {Object} options - Export options
 * @returns {jsPDF} PDF document
 */
export const generatePDF = (articleData, options = {}) => {
  const {
    title = "My Reflection",
    content = "",
    correctedContent = "",
    grammarResult = null,
    showCorrected = false,
    includeFeedback = true,
    includeScore = true,
  } = articleData;

  const {
    includeHeader = true,
    includeFooter = true,
    fontSize = 12,
    lineHeight = 1.5,
  } = options;

  // Create new PDF document
  const doc = new jsPDF();
  let yPosition = PDF_CONFIG.margins.top;
  const pageWidth =
    PDF_CONFIG.pageWidth - PDF_CONFIG.margins.left - PDF_CONFIG.margins.right;
  const maxWidth = pageWidth;

  // Helper function to add text with word wrapping
  const addText = (text, x, y, options = {}) => {
    const {
      fontSize: textSize = PDF_CONFIG.fonts.body,
      color = PDF_CONFIG.colors.text,
      align = "left",
      maxWidth: textMaxWidth = maxWidth,
    } = options;

    doc.setFontSize(textSize);
    doc.setTextColor(color);

    const lines = doc.splitTextToSize(text, textMaxWidth);
    doc.text(lines, x, y, { align });

    return y + lines.length * textSize * 0.4; // Return new Y position
  };

  // Helper function to add a line break
  const addLineBreak = (spacing = 5) => {
    return yPosition + spacing;
  };

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace = 20) => {
    if (
      yPosition + requiredSpace >
      PDF_CONFIG.pageHeight - PDF_CONFIG.margins.bottom
    ) {
      doc.addPage();
      yPosition = PDF_CONFIG.margins.top;
      return true;
    }
    return false;
  };

  // Header
  if (includeHeader) {
    // Title
    yPosition = addText(title, PDF_CONFIG.margins.left, yPosition, {
      fontSize: PDF_CONFIG.fonts.title,
      color: PDF_CONFIG.colors.primary,
      align: "center",
    });

    yPosition = addLineBreak(10);

    // Date
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    yPosition = addText(
      `Generated on ${currentDate}`,
      PDF_CONFIG.margins.left,
      yPosition,
      {
        fontSize: PDF_CONFIG.fonts.small,
        color: PDF_CONFIG.colors.light,
        align: "center",
      }
    );

    yPosition = addLineBreak(15);
  }

  // Writing Score (if available and requested)
  if (
    includeScore &&
    grammarResult &&
    grammarResult.overallScore !== undefined
  ) {
    checkNewPage(30);

    // Score badge
    const scoreColor =
      grammarResult.overallScore >= 90
        ? "#10B981"
        : grammarResult.overallScore >= 75
        ? "#F59E0B"
        : "#EF4444";

    yPosition = addText(
      "Writing Analysis",
      PDF_CONFIG.margins.left,
      yPosition,
      {
        fontSize: PDF_CONFIG.fonts.subtitle,
        color: PDF_CONFIG.colors.primary,
      }
    );

    yPosition = addLineBreak(5);

    yPosition = addText(
      `Overall Score: ${grammarResult.overallScore}/100`,
      PDF_CONFIG.margins.left,
      yPosition,
      {
        fontSize: PDF_CONFIG.fonts.body,
        color: scoreColor,
      }
    );

    yPosition = addLineBreak(10);
  }

  // Article Content
  const articleText =
    showCorrected && correctedContent ? correctedContent : content;

  if (articleText) {
    checkNewPage(20);

    yPosition = addText("Article Content", PDF_CONFIG.margins.left, yPosition, {
      fontSize: PDF_CONFIG.fonts.subtitle,
      color: PDF_CONFIG.colors.primary,
    });

    yPosition = addLineBreak(10);

    // Split content into sections for better formatting
    const sections = articleText.split("\n\n");

    sections.forEach((section) => {
      if (section.trim()) {
        checkNewPage(30);

        // Check if it's a section header (starts with capital letters and ends with colon or is short)
        const isHeader =
          section.length < 100 &&
          (section.includes(":") || section.split(" ").length <= 5);

        if (isHeader) {
          yPosition = addText(
            section.trim(),
            PDF_CONFIG.margins.left,
            yPosition,
            {
              fontSize: PDF_CONFIG.fonts.subtitle,
              color: PDF_CONFIG.colors.secondary,
            }
          );
        } else {
          yPosition = addText(
            section.trim(),
            PDF_CONFIG.margins.left,
            yPosition,
            {
              fontSize: PDF_CONFIG.fonts.body,
              color: PDF_CONFIG.colors.text,
            }
          );
        }

        yPosition = addLineBreak(8);
      }
    });
  }

  // Grammar Feedback (if available and requested)
  if (
    includeFeedback &&
    grammarResult &&
    grammarResult.issues &&
    grammarResult.issues.length > 0
  ) {
    checkNewPage(40);

    yPosition = addText(
      "Writing Feedback",
      PDF_CONFIG.margins.left,
      yPosition,
      {
        fontSize: PDF_CONFIG.fonts.subtitle,
        color: PDF_CONFIG.colors.primary,
      }
    );

    yPosition = addLineBreak(10);

    // Group issues by type
    const issuesByType = grammarResult.issues.reduce((acc, issue) => {
      if (!acc[issue.type]) acc[issue.type] = [];
      acc[issue.type].push(issue);
      return acc;
    }, {});

    Object.entries(issuesByType).forEach(([type, issues]) => {
      checkNewPage(30);

      yPosition = addText(
        `${type.charAt(0).toUpperCase() + type.slice(1)} Issues (${
          issues.length
        })`,
        PDF_CONFIG.margins.left,
        yPosition,
        {
          fontSize: PDF_CONFIG.fonts.body,
          color: PDF_CONFIG.colors.secondary,
        }
      );

      yPosition = addLineBreak(5);

      // Show first few issues to avoid overwhelming the PDF
      const issuesToShow = issues.slice(0, 5);

      issuesToShow.forEach((issue) => {
        checkNewPage(20);

        const issueText = issue.suggestion
          ? `${issue.original} → ${issue.suggestion}`
          : issue.original;

        yPosition = addText(
          `• ${issueText}`,
          PDF_CONFIG.margins.left + 5,
          yPosition,
          {
            fontSize: PDF_CONFIG.fonts.small,
            color: PDF_CONFIG.colors.text,
          }
        );

        yPosition = addLineBreak(3);
      });

      if (issues.length > 5) {
        yPosition = addText(
          `... and ${issues.length - 5} more`,
          PDF_CONFIG.margins.left + 5,
          yPosition,
          {
            fontSize: PDF_CONFIG.fonts.small,
            color: PDF_CONFIG.colors.light,
          }
        );
        yPosition = addLineBreak(5);
      }
    });
  }

  // Improvements (if available)
  if (
    includeFeedback &&
    grammarResult &&
    grammarResult.improvements &&
    grammarResult.improvements.length > 0
  ) {
    checkNewPage(30);

    yPosition = addText(
      "Writing Strengths",
      PDF_CONFIG.margins.left,
      yPosition,
      {
        fontSize: PDF_CONFIG.fonts.subtitle,
        color: PDF_CONFIG.colors.primary,
      }
    );

    yPosition = addLineBreak(10);

    grammarResult.improvements.forEach((improvement) => {
      checkNewPage(15);

      yPosition = addText(
        `✓ ${improvement}`,
        PDF_CONFIG.margins.left,
        yPosition,
        {
          fontSize: PDF_CONFIG.fonts.body,
          color: "#10B981",
        }
      );

      yPosition = addLineBreak(5);
    });
  }

  // Footer
  if (includeFooter) {
    const pageCount = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(PDF_CONFIG.fonts.small);
      doc.setTextColor(PDF_CONFIG.colors.light);
      doc.text(
        `Page ${i} of ${pageCount}`,
        PDF_CONFIG.pageWidth - PDF_CONFIG.margins.right - 20,
        PDF_CONFIG.pageHeight - 10,
        { align: "right" }
      );
    }
  }

  return doc;
};

/**
 * Download PDF
 * @param {jsPDF} doc - PDF document
 * @param {string} filename - Filename for download
 */
export const downloadPDF = (doc, filename = "my-reflection.pdf") => {
  doc.save(filename);
};

/**
 * Generate and download PDF in one function
 * @param {Object} articleData - Article and analysis data
 * @param {Object} options - Export options
 * @param {string} filename - Filename for download
 */
export const generateAndDownloadPDF = (
  articleData,
  options = {},
  filename = "my-reflection.pdf"
) => {
  const doc = generatePDF(articleData, options);
  downloadPDF(doc, filename);
};

/**
 * Get PDF as blob for preview or other uses
 * @param {Object} articleData - Article and analysis data
 * @param {Object} options - Export options
 * @returns {Blob} PDF blob
 */
export const generatePDFBlob = (articleData, options = {}) => {
  const doc = generatePDF(articleData, options);
  return doc.output("blob");
};

/**
 * Get PDF as data URL for embedding
 * @param {Object} articleData - Article and analysis data
 * @param {Object} options - Export options
 * @returns {string} PDF data URL
 */
export const generatePDFDataURL = (articleData, options = {}) => {
  const doc = generatePDF(articleData, options);
  return doc.output("dataurlstring");
};
