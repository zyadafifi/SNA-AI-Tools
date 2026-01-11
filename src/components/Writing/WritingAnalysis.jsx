import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Filter,
  Download,
  ArrowRight,
  Star,
} from "lucide-react";
import { Badge } from "./ui";
import CollapsibleSection from "./CollapsibleSection";
import { generateAndDownloadPDF } from "../../utils/pdfExporter";

export default function WritingAnalysis({
  issues,
  improvements,
  source,
  quotaInfo,
  overallScore,
  articleContent,
  correctedContent,
}) {
  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    spelling: true,
    grammar: true,
    strengths: false,
  });

  // State for "show more" functionality
  const [showAll, setShowAll] = useState({
    spelling: false,
    grammar: false,
  });

  // Group issues by type
  const { spellingIssues, grammarIssues } = useMemo(() => {
    const spelling = issues.filter((issue) => issue.type === "spelling");
    const grammar = issues.filter((issue) => issue.type === "grammar");

    return {
      spellingIssues: spelling,
      grammarIssues: grammar,
    };
  }, [issues]);

  // Group similar issues (e.g., multiple gibberish words)
  const groupedSpellingIssues = useMemo(() => {
    const groups = {};

    spellingIssues.forEach((issue) => {
      const key = issue.explanation || issue.original;
      if (!groups[key]) {
        groups[key] = {
          ...issue,
          count: 1,
          words: [issue.original],
        };
      } else {
        groups[key].count += 1;
        groups[key].words.push(issue.original);
      }
    });

    return Object.values(groups);
  }, [spellingIssues]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleShowAll = (section) => {
    setShowAll((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getDisplayedIssues = (issues, section) => {
    if (showAll[section]) return issues;
    return issues.slice(0, 3);
  };

  // Use the overall score from grammar result
  const writingScore = overallScore || 0;

  // PDF Export handler
  const handlePDFExport = async () => {
    if (!articleContent) {
      alert("No article content available for export.");
      return;
    }

    try {
      const articleData = {
        title: "My Reflection",
        content: articleContent,
        correctedContent: correctedContent || articleContent,
        grammarResult: {
          issues,
          improvements,
          overallScore: writingScore,
          source,
        },
        showCorrected: false,
      };

      const options = {
        includeHeader: true,
        includeFooter: true,
        includeScore: true,
        includeFeedback: true,
      };

      const filename = `my-reflection-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      generateAndDownloadPDF(articleData, options, filename);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const IssueCard = ({ issue, type }) => {
    const variantMap = {
      spelling: "error",
      grammar: "warning",
    };

    return (
      <motion.div
        className="p-3 rounded-lg border text-sm hover:shadow-sm transition-shadow"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-start justify-between mb-1">
          <Badge size="sm" variant={variantMap[type]}>
            {type}
          </Badge>
          {issue.suggestion && (
            <span className="text-xs text-green-600">✓ Fix available</span>
          )}
        </div>

        {issue.suggestion ? (
          <div className="flex items-center space-x-2 my-2">
            <span className="text-red-600 line-through text-sm">
              {issue.original}
            </span>
            <ArrowRight className="w-3 h-3 text-gray-400" />
            <span className="text-green-600 font-medium text-sm">
              {issue.suggestion}
            </span>
          </div>
        ) : (
          <div className="text-gray-700 font-medium text-sm my-2">
            {issue.original}
          </div>
        )}

        <p className="text-xs text-gray-600 leading-relaxed">
          {issue.explanation}
        </p>
      </motion.div>
    );
  };

  const GroupedIssueCard = ({ groupedIssue, type }) => {
    const variantMap = {
      spelling: "error",
      grammar: "warning",
    };

    return (
      <motion.div
        className="p-3 rounded-lg border text-sm hover:shadow-sm transition-shadow"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between mb-2">
          <Badge size="sm" variant={variantMap[type]}>
            {type}
          </Badge>
          <span className="text-xs text-gray-600 font-medium">
            {groupedIssue.count} occurrences
          </span>
        </div>

        <div className="text-sm text-gray-700 mb-2">
          {groupedIssue.explanation}
        </div>

        <div className="text-xs text-gray-500">
          Words: {groupedIssue.words.slice(0, 3).join(", ")}
          {groupedIssue.words.length > 3 &&
            ` +${groupedIssue.words.length - 3} more`}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-surface-200 transition-all duration-300 p-6 sticky top-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center mr-3 shadow-soft">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-surface-900">
            Writing Analysis
          </h3>
        </div>

        {/* Source indicator */}
        {source && (
          <div className="flex items-center space-x-2 text-xs text-surface-500">
            <div
              className={`w-2 h-2 rounded-full ${
                source === "languagetool" ? "bg-green-500" : "bg-yellow-500"
              }`}
            ></div>
            <span>
              {source === "languagetool"
                ? "LanguageTool API"
                : "Custom Checker"}
            </span>
          </div>
        )}
      </div>

      {/* Writing Score */}
      <div className="text-center p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-200 mb-6">
        <div className="text-sm text-gray-600 mb-2">Writing Score</div>
        <div
          className={`text-4xl font-bold ${
            writingScore >= 90
              ? "text-green-600"
              : writingScore >= 75
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {writingScore}
        </div>
        <div className="text-xs text-gray-500">out of 100</div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-600">
            {spellingIssues.length}
          </div>
          <div className="text-xs text-red-600 font-medium">Spelling</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">
            {grammarIssues.length}
          </div>
          <div className="text-xs text-yellow-600 font-medium">Grammar</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2 mb-4">
        <button className="flex-1 px-3 py-2 text-xs bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition">
          <Filter className="w-3 h-3 inline mr-1" />
          Filter
        </button>
        <button
          onClick={handlePDFExport}
          className="flex-1 px-3 py-2 text-xs bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition cursor-pointer"
        >
          <Download className="w-3 h-3 inline mr-1" />
          Export PDF
        </button>
      </div>

      {/* Issues Sections */}
      <div className="space-y-4">
        {/* Spelling Issues */}
        {spellingIssues.length > 0 && (
          <CollapsibleSection
            title="Spelling Issues"
            count={spellingIssues.length}
            icon={<AlertCircle className="w-5 h-5" />}
            iconColor="text-red-500"
            isExpanded={expandedSections.spelling}
            onToggle={() => toggleSection("spelling")}
          >
            <div className="space-y-2">
              {groupedSpellingIssues.map((issue, idx) => (
                <GroupedIssueCard
                  key={idx}
                  groupedIssue={issue}
                  type="spelling"
                />
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Grammar Issues */}
        {grammarIssues.length > 0 && (
          <CollapsibleSection
            title="Grammar Issues"
            count={grammarIssues.length}
            icon={<AlertCircle className="w-5 h-5" />}
            iconColor="text-yellow-500"
            isExpanded={expandedSections.grammar}
            onToggle={() => toggleSection("grammar")}
          >
            <div className="space-y-2">
              {getDisplayedIssues(grammarIssues, "grammar").map(
                (issue, idx) => (
                  <IssueCard key={idx} issue={issue} type="grammar" />
                )
              )}
              {grammarIssues.length > 3 && (
                <button
                  onClick={() => toggleShowAll("grammar")}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium mt-2"
                >
                  {showAll.grammar
                    ? "Show Less"
                    : `Show ${grammarIssues.length - 3} More`}
                </button>
              )}
            </div>
          </CollapsibleSection>
        )}
      </div>

      {/* Strengths Section */}
      {improvements && improvements.length > 0 && (
        <CollapsibleSection
          title="Strengths"
          count={improvements.length}
          icon={<CheckCircle className="w-5 h-5" />}
          iconColor="text-green-500"
          isExpanded={expandedSections.strengths}
          onToggle={() => toggleSection("strengths")}
          defaultCollapsed={true}
        >
          <div className="space-y-2">
            {improvements.map((item, idx) => (
              <motion.div
                key={idx}
                className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.1 }}
              >
                <Star className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-800">{item}</p>
              </motion.div>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}
