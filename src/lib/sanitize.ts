import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - The potentially unsafe HTML string
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return as-is (will be sanitized on client)
    // Or use a server-side DOMPurify alternative like isomorphic-dompurify
    return dirty;
  }
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'br', 'span', 'div', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['class'],
  });
}

/**
 * Sanitize HTML with more permissive settings for rich content
 * @param dirty - The potentially unsafe HTML string
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeRichHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    return dirty;
  }
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'u', 'p', 'br', 'span', 'div', 
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre', 'a', 'img'
    ],
    ALLOWED_ATTR: ['class', 'href', 'target', 'rel', 'src', 'alt'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

/**
 * Strip all HTML tags from a string
 * @param dirty - The string with HTML tags
 * @returns Plain text string with all HTML removed
 */
export function stripHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    // Simple server-side stripping
    return dirty.replace(/<[^>]*>/g, '');
  }
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}
