/**
 * Renders HN's server-rendered, sanitised HTML (comment bodies, story text,
 * profile "about") with consistent typographic defaults via the `.ehn-prose`
 * style block. HN only emits a small markup subset — paragraphs, links,
 * <i>, and <pre><code> — but we style the common extras defensively too.
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
