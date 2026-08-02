/**
 * Renders HN's own sanitised HTML (comment bodies, story text, profile "about");
 * typography lives in the `.ehn-prose` block. HN emits only paragraphs, links,
 * <i> and <pre><code>, but the stylesheet covers common extras defensively.
 */
export function Prose({
  html,
  className = '',
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={`ehn-prose ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
