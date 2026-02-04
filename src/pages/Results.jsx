import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../components/Writing/Layout";
import { Button, Card } from "../components/Writing/ui";
import WritingAnalysis from "../components/Writing/WritingAnalysis";
import ResultsDialog from "../components/Writing/ResultsDialog";
import { FileText, Info, Download, RotateCcw, Award } from "lucide-react";
import { analyzeText } from "../utils/grammarChecker";
import { generateAndDownloadPDF } from "../utils/pdfExporter";
import { getQuotaInfo } from "../utils/languageToolService";

export default function Results() {
  const { topicId } = useParams();
  const [compiledArticle, setCompiledArticle] = useState("");
  const [grammarResult, setGrammarResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);

  useEffect(() => {
    // Get answers from sessionStorage
    const answersJson = sessionStorage.getItem("userAnswers");
    if (!answersJson) {
      setIsLoading(false);
      return;
    }

    const answers = JSON.parse(answersJson);

    // Compile article and analyze grammar
    const timer = setTimeout(async () => {
      // Compile answers into an article
      const compiledText = compileAnswersIntoArticle(answers);
      setCompiledArticle(compiledText);

      // Get quota info
      const quota = getQuotaInfo();
      setQuotaInfo(quota);

      try {
        // Analyze grammar with LanguageTool API (async)
        const grammarCheck = await analyzeText(compiledText);
        setGrammarResult(grammarCheck);
      } catch (error) {
        console.error("Grammar analysis failed:", error);
        // Fallback to sync version if async fails
        const { analyzeTextSync } = await import("../utils/grammarChecker");
        const grammarCheck = analyzeTextSync(compiledText);
        setGrammarResult(grammarCheck);
      }

      setIsLoading(false);
      // Show results dialog after analysis is complete
      setShowResultsDialog(true);
    }, 2000); // Processing time

    return () => clearTimeout(timer);
  }, []);

  const compileAnswersIntoArticle = (answers) => {
    const sections = {
      why: [],
      what: [],
      when: [],
      where: [],
      who: [],
      how: [],
    };

    // Group answers by category
    Object.entries(answers).forEach(([key, answer]) => {
      if (answer.trim()) {
        const [category] = key.split("-");
        if (sections[category]) {
          sections[category].push(answer.trim());
        }
      }
    });

    // Compile into article format
    let article = "My Reflection on This Topic\n\n";

    if (sections.why.length > 0) {
      article += "Why This Matters to Me\n";
      article += sections.why.join(" ") + "\n\n";
    }

    if (sections.what.length > 0) {
      article += "What I've Learned\n";
      article += sections.what.join(" ") + "\n\n";
    }

    if (sections.when.length > 0) {
      article += "My Experience with This Topic\n";
      article += sections.when.join(" ") + "\n\n";
    }

    if (sections.where.length > 0) {
      article += "Where I See the Impact\n";
      article += sections.where.join(" ") + "\n\n";
    }

    if (sections.who.length > 0) {
      article += "The People Involved\n";
      article += sections.who.join(" ") + "\n\n";
    }

    if (sections.how.length > 0) {
      article += "How I Plan to Apply This\n";
      article += sections.how.join(" ") + "\n\n";
    }

    article +=
      "In conclusion, this reflection has helped me gain deeper insights into this topic and how it relates to my personal experience and future goals.";

    return article;
  };

  // PDF Export handler
  const handlePDFExport = async () => {
    if (!compiledArticle || !grammarResult) return;

    setIsExporting(true);

    try {
      const articleData = {
        title: "My Reflection",
        content: compiledArticle,
        correctedContent: grammarResult.correctedText || compiledArticle,
        grammarResult: grammarResult,
        showCorrected: !showOriginal,
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
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Article Column */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center shadow-soft">
                  <FileText className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text ">
                    Your Reflection
                  </h1>
                  <p className="text-surface-600">
                    Compiled from your responses
                  </p>
                </div>
              </div>

              {grammarResult && (
                <motion.div
                  className="space-y-4 mb-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  {/* Score and Source Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Award className="w-5 h-5 text-primary-600" />
                        <span className="text-sm font-medium text-surface-700">
                          Writing Score:
                        </span>
                      </div>
                      <motion.div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-soft ${
                          grammarResult.overallScore >= 90
                            ? "bg-gradient-to-r from-green-500 to-emerald-600"
                            : grammarResult.overallScore >= 75
                            ? "bg-gradient-to-r from-yellow-500 to-orange-600"
                            : "bg-gradient-to-r from-red-500 to-pink-600"
                        }`}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {grammarResult.overallScore}
                      </motion.div>
                      <span className="text-sm text-surface-500">/100</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowOriginal(!showOriginal)}
                      className="text-primary-600 hover:text-primary-800 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {showOriginal ? "Show Corrected" : "Show Original"}
                    </Button>
                  </div>

                  {/* API Source and Quota Info */}
                  <div className="flex items-center justify-between text-xs text-surface-500">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          grammarResult.source === "languagetool"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      ></div>
                      <span>
                        {grammarResult.source === "languagetool"
                          ? "LanguageTool API"
                          : "Custom Checker"}
                      </span>
                    </div>

                    {quotaInfo && grammarResult.source === "languagetool" && (
                      <span>
                        {quotaInfo.remaining} requests remaining today
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>

            <Card className="p-8">
              {isLoading ? (
                <motion.div
                  className="text-center py-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.div
                    className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full mx-auto mb-6"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <motion.p
                    className="text-surface-600 text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    Compiling your reflection and analyzing your writing...
                  </motion.p>
                </motion.div>
              ) : compiledArticle ? (
                <motion.div
                  className="prose prose-lg max-w-none"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="whitespace-pre-line text-surface-700 leading-relaxed">
                    {showOriginal
                      ? compiledArticle
                      : grammarResult?.correctedText || compiledArticle}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="text-center py-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-8 h-8 text-surface-400" />
                  </div>
                  <p className="text-surface-600 mb-6">
                    No reflection found. Please go back and answer some
                    questions first.
                  </p>
                  <Link to={`/questions/${topicId}`}>
                    <Button className="cursor-pointer bg-primary-600 hover:bg-primary-700">
                      Start Reflection
                    </Button>
                  </Link>
                </motion.div>
              )}
            </Card>
          </motion.div>

          {/* Feedback Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {isLoading ? (
              <div className="bg-white rounded-2xl shadow-soft border border-surface-200 p-6 sticky top-8">
                <motion.div
                  className="text-center py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.div
                    className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full mx-auto mb-4"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <p className="text-surface-500 text-sm">
                    Analyzing your writing...
                  </p>
                </motion.div>
              </div>
            ) : grammarResult ? (
              <WritingAnalysis
                issues={grammarResult.issues}
                improvements={grammarResult.improvements}
                source={grammarResult.source}
                quotaInfo={quotaInfo}
                overallScore={grammarResult.overallScore}
                articleContent={compiledArticle}
                correctedContent={grammarResult.correctedText}
              />
            ) : (
              <div className="bg-white rounded-2xl shadow-soft border border-surface-200 p-6 sticky top-8">
                <motion.div
                  className="text-center py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Info className="w-8 h-8 text-surface-400 mx-auto mb-4" />
                  <p className="text-surface-500 text-sm">
                    No analysis available.
                  </p>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          className="mt-12 text-center space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Link to="/">
            <Button variant="secondary" size="lg" className="cursor-pointer">
              Try Another Topic
            </Button>
          </Link>

          <Button
            onClick={handlePDFExport}
            variant="gradient"
            size="lg"
            className="cursor-pointer"
            disabled={isExporting || !grammarResult}
          >
            {isExporting ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 w-5 h-5" />
                Export PDF
              </>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Results Dialog */}
      <ResultsDialog
        show={showResultsDialog}
        onClose={() => setShowResultsDialog(false)}
        overallScore={grammarResult?.overallScore || 0}
        grammarResult={grammarResult}
        compiledArticle={compiledArticle}
      />
    </Layout>
  );
}
