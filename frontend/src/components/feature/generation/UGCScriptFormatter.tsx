"use client";

import React from "react";
import { motion } from "framer-motion";
import { Copy, CheckCircle, Zap, Target, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface UGCScriptFormatterProps {
  content: {
    hook?: string;
    script?: string;
    title?: string;
  };
  platform: "tiktok" | "instagram";
  onCopy?: (section: "title" | "hook" | "script" | "all") => void;
  className?: string;
}

const formatText = (text: string): React.ReactNode => {
  if (!text) return null;

  // Handle various newline formats and clean up the text
  let cleanText = text
    // First handle literal \n\n and \n sequences
    .replace(/\\n\\n/g, "\n\n") // Double newlines
    .replace(/\\n/g, "\n") // Single newlines
    .replace(/\\\*/g, "*") // Handle escaped asterisks
    .replace(/\n{3,}/g, "\n\n") // Limit consecutive newlines to max 2
    .trim();

  // Split by line breaks and process each paragraph/line
  const paragraphs = cleanText.split(/\n\s*\n/); // Split by double newlines for paragraphs

  return paragraphs.map((paragraph, paragraphIndex) => {
    if (!paragraph.trim()) {
      return <div key={paragraphIndex} className="h-6" />; // Paragraph spacing
    }

    // Split paragraph into lines
    const lines = paragraph.split("\n").filter((line) => line.trim());

    return (
      <div key={paragraphIndex} className="mb-4">
        {lines.map((line, lineIndex) => {
          // Process inline formatting
          let processedLine = line.trim();

          // Apply formatting in order of priority
          processedLine = processedLine
            // Bold text **text** -> <strong>
            .replace(
              /\*\*(.*?)\*\*/g,
              '<strong class="font-bold text-gray-900">$1</strong>'
            )
            // Italic text *text* -> <em> (but not part of bold)
            .replace(
              /(?<!\*)\*([^*]+?)\*(?!\*)/g,
              '<em class="italic text-blue-600 font-medium">$1</em>'
            )
            // Headers ### -> larger text
            .replace(
              /^### (.+)$/gm,
              '<h3 class="text-lg font-bold text-purple-600 mt-4 mb-2 border-b border-purple-200 pb-1">$1</h3>'
            )
            .replace(
              /^## (.+)$/gm,
              '<h2 class="text-xl font-bold text-purple-700 mt-4 mb-2 border-b border-purple-300 pb-2">$1</h2>'
            )
            .replace(
              /^# (.+)$/gm,
              '<h1 class="text-2xl font-bold text-purple-800 mt-4 mb-3 border-b border-purple-400 pb-2">$1</h1>'
            )
            // Questions ending with ? -> highlighted
            .replace(
              /([^.!]*\?)/g,
              '<span class="font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">$1</span>'
            )
            // Quotes "text" -> highlighted quotes
            // .replace(
            //   /"([^"]+)"/g,
            //   '<span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">"$1"</span>'
            // )
            // Calls to action and power words -> highlighted
            // .replace(
            //   /\b(Try it now!?|Click the link|Get yours today|Don't miss out|Act fast|Limited time|Unbelievable|Amazing|Incredible|Game-changer|Life-changing|Must-have|Exclusive|Secret|Proven)\b/gi,
            //   '<span class="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-sm font-bold shadow-sm">$1</span>'
            // )
            // Emphasis words -> subtle highlight
            // .replace(
            //   /\b(exactly|honestly|really|actually|totally|definitely|absolutely|completely)\b/gi,
            //   '<span class="font-semibold text-gray-700 bg-gray-100 px-1 rounded">$1</span>'
            // )
            // Numbers with time periods -> highlight
            // .replace(
            //   /\b(\d+)\s+(days?|weeks?|months?|years?|minutes?|hours?)\b/gi,
            //   '<span class="font-bold text-green-600 bg-green-50 px-2 py-1 rounded">$1 $2</span>'
            // )
            // Hashtags #hashtag -> styled hashtags
            .replace(
              /#(\w+)/g,
              '<span class="text-blue-500 font-semibold hover:text-blue-600 transition-colors">#$1</span>'
            );
          // @mentions -> styled mentions
          // .replace(
          //   /@(\w+)/g,
          //   '<span class="text-green-600 font-semibold hover:text-green-700 transition-colors">@$1</span>'
          // )
          // Product names and brand mentions -> subtle emphasis
          // .replace(
          //   /\b([A-Z][a-z]+ [A-Z][a-z]+ \d+g|\b[A-Z][a-z]{2,} [A-Z][a-z]{2,}\b)/g,
          //   '<span class="font-semibold text-purple-600 bg-purple-50 px-1 rounded">$1</span>'
          // );

          return (
            <div
              key={lineIndex}
              className="leading-relaxed text-gray-800 mb-1"
              dangerouslySetInnerHTML={{ __html: processedLine }}
            />
          );
        })}
      </div>
    );
  });
};

const ScriptSection = ({
  title,
  content,
  icon: Icon,
  gradient,
  onCopy,
  copyLabel,
}: {
  title: string;
  content: string;
  icon: React.ComponentType<any>;
  gradient: string;
  onCopy?: () => void;
  copyLabel: string;
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    // Clean up the content for copying - remove markdown and escaped characters
    const cleanContent = content
      .replace(/\\n/g, "\n") // Convert escaped newlines
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markdown
      .replace(/\*([^*]+)\*/g, "$1") // Remove italic markdown
      .replace(/\\\*/g, "*") // Handle escaped asterisks
      .trim();

    navigator.clipboard.writeText(cleanContent);
    setCopied(true);
    onCopy?.();
    console.log(
      `✅ Individual copy - ${title}:`,
      cleanContent.substring(0, 50) + (cleanContent.length > 50 ? "..." : "")
    );
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      <div
        className={cn(
          "p-6 rounded-xl border-2 bg-gradient-to-br",
          gradient,
          "hover:shadow-lg transition-all duration-200"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-bold text-white text-lg">{title}</h3>
          </div>

          <Button
            onClick={handleCopy}
            variant="secondary"
            size="sm"
            className="opacity-80 hover:opacity-100 transition-opacity"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {copied ? "Copied!" : copyLabel}
          </Button>
        </div>

        {/* Content */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 text-gray-800 space-y-2">
          {formatText(content)}
        </div>

        {/* Character count */}
        <div className="mt-3 text-right">
          <span className="text-white/80 text-xs bg-black/20 px-3 py-1 rounded-full">
            {content.length} characters
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export const UGCScriptFormatter = ({
  content,
  platform,
  onCopy,
  className,
}: UGCScriptFormatterProps) => {
  const [allCopied, setAllCopied] = React.useState(false);

  const handleCopyAll = () => {
    // Debug: Log the content to see what we're working with
    console.log("🔍 Copy All - Full content object:", content);
    console.log("📝 Title:", content.title);
    console.log("🎣 Hook:", content.hook);
    console.log("📋 Script:", content.script);

    const cleanContent = (text: string) =>
      text
        .replace(/\\n/g, "\n")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/\\\*/g, "*")
        .trim();

    const fullContent = [
      content.title && `TITLE: ${cleanContent(content.title)}`,
      content.hook && `HOOK: ${cleanContent(content.hook)}`,
      content.script && `SCRIPT: ${cleanContent(content.script)}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    console.log("📄 Final content to copy:", fullContent);

    navigator.clipboard.writeText(fullContent);
    setAllCopied(true);
    onCopy?.("all");
    setTimeout(() => setAllCopied(false), 2000);
  };

  const platformConfig = {
    tiktok: {
      name: "TikTok",
      color: "text-black",
      bg: "from-black to-red-500",
    },
    instagram: {
      name: "Instagram",
      color: "text-purple-600",
      bg: "from-purple-500 via-pink-500 to-orange-500",
    },
  };

  const config = platformConfig[platform];

  if (!content.title && !content.hook && !content.script) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-center">
        <div>
          <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground/60" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Ready to create viral {config.name} content?
          </h3>
          <p className="text-muted-foreground">
            Your generated content will appear here with beautiful formatting
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with copy all button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className={cn("p-2 rounded-lg bg-gradient-to-r", config.bg)}>
              <Eye className="w-6 h-6 text-white" />
            </div>
            Your {config.name} Script
          </h2>
          <p className="text-muted-foreground mt-1">
            Formatted and ready to engage your audience
          </p>
        </div>

        {(content.title || content.hook || content.script) && (
          <Button
            onClick={handleCopyAll}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            size="lg"
          >
            {allCopied ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <Copy className="w-5 h-5 mr-2" />
            )}
            {allCopied ? "All Copied!" : "Copy Everything"}
          </Button>
        )}
      </div>

      {/* Content sections */}
      <div className="space-y-6">
        {content.title && (
          <ScriptSection
            title="📱 Title"
            content={content.title}
            icon={Eye}
            gradient="from-indigo-500 to-blue-500"
            onCopy={() => onCopy?.("title")}
            copyLabel="Copy Title"
          />
        )}

        {content.hook && (
          <ScriptSection
            title="🎣 Hook"
            content={content.hook}
            icon={Zap}
            gradient="from-blue-500 to-cyan-500"
            onCopy={() => onCopy?.("hook")}
            copyLabel="Copy Hook"
          />
        )}

        {content.script && (
          <ScriptSection
            title="📝 Full Script"
            content={content.script}
            icon={Target}
            gradient="from-purple-500 to-pink-500"
            onCopy={() => onCopy?.("script")}
            copyLabel="Copy Script"
          />
        )}
      </div>

      {/* Tips section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Target className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <h4 className="font-semibold text-yellow-800 mb-2">
              💡 Pro Tips for {config.name}
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Post during peak hours (7-9 PM) for maximum reach</li>
              <li>• Use trending hashtags relevant to your niche</li>
              <li>• Engage with comments within the first hour</li>
              <li>• Add captions for accessibility and better engagement</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
