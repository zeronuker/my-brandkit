// Fills {{LINE1}}/{{LINE2}} placeholders into the icon-source .svg.template files.
export function renderIconTemplate(templateSrc, { line1, line2 }) {
  return templateSrc
    .replaceAll('{{LINE1}}', line1)
    .replaceAll('{{LINE2}}', line2)
}
