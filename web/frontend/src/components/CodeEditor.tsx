import Editor from "@monaco-editor/react";

function languageFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "yaml":
    case "yml":
      return "yaml";
    case "sh":
    case "bash":
      return "shell";
    case "go":
      return "go";
    case "ts":
    case "tsx":
      return "typescript";
    case "js":
    case "jsx":
      return "javascript";
    case "json":
      return "json";
    case "py":
      return "python";
    case "md":
      return "markdown";
    case "css":
      return "css";
    case "html":
      return "html";
    default:
      return "plaintext";
  }
}

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  filename?: string;
  theme?: string;
}

export function CodeEditor({ value, onChange, language, filename, theme }: CodeEditorProps) {
  const editorTheme = theme === "dark" ? "vs-dark" : "vs";
  const resolvedLanguage = filename ? languageFromFilename(filename) : (language ?? "go");

  return (
    <Editor
      height="100%"
      language={resolvedLanguage}
      value={value}
      onChange={(v) => onChange(v ?? "")}
      theme={editorTheme}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 4,
        wordWrap: "on",
      }}
    />
  );
}
