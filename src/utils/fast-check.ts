import { regexLinariaSyntaxPattern } from '../loaders/consts';
import { logger } from './logger';

// Track if we've shown the fastCheck message already
let fastCheckMessageShown = false;

/**
 * Performs a fast check to determine if a file contains Linaria syntax.
 * If fastCheck is enabled and the file doesn't contain Linaria syntax,
 * the transformation can be skipped for better performance.
 *
 * @param content The file content to check
 * @param fastCheck Whether fast check is enabled
 * @returns true if the file contains Linaria syntax or fastCheck is disabled, false otherwise
 */
export function performFastCheck(
  content: string,
  fastCheck: boolean = true,
): boolean {
  // Show the fastCheck message once per build
  if (fastCheck && !fastCheckMessageShown) {
    logger.info(
      'Linaria fastCheck optimization enabled - skipping transform for files without Linaria syntax',
    );
    logger.info(
      'If you experience styling issues, try disabling fastCheck in your webpack config',
    );
    fastCheckMessageShown = true;
  }

  // Skip transform for files without Linaria syntax if fastCheck is enabled
  const hasLinariaSyntax = regexLinariaSyntaxPattern.test(content);
  const shouldTransform = !fastCheck || hasLinariaSyntax;

  return shouldTransform;
}
