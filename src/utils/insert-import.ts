/**
 * Inserts an import statement in the appropriate location in the file:
 * 1. After the last existing import statement
 * 2. After directive blocks (like 'use client') if no imports exist
 * 3. At the beginning of the file if neither imports nor directives exist
 */
export function insertImportStatement(
  content: string,
  importStatement: string,
): string {
  // Check for existing import statements
  const importRegex =
    /^\s*(?:import\s+[^;]+?\s+from\s+["'][^"']+["'];|import\s*["'][^"']+["'];)/gm;

  const importMatches = [...content.matchAll(importRegex)];

  // Case 1: Insert after the last import statement
  if (importMatches.length > 0) {
    const lastImport = importMatches[importMatches.length - 1];
    const insertPosition = lastImport.index! + lastImport[0].length;
    return `${content.slice(0, insertPosition)}\n${importStatement}${content.slice(insertPosition)}`;
  }

  // Case 2: Check for directive blocks (like 'use client')
  const directiveRegex = /^(?:(?:\s*["']use \w+["'];?\s*\n?)+)/;
  const directiveMatch = content.match(directiveRegex);

  if (directiveMatch) {
    const endOfDirectives = directiveMatch[0].length;
    const needsNewline = !content.slice(0, endOfDirectives).endsWith('\n');
    const separator = needsNewline ? '\n' : '';

    return `${content.slice(0, endOfDirectives)}${separator}${importStatement}\n${content.slice(endOfDirectives)}`;
  }

  // Case 3: No imports or directives found, insert at the beginning
  return `${importStatement}\n${content}`;
}
