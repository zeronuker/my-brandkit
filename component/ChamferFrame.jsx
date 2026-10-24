// Double-line chamfered window frame for every modal, popup and card. Styles: .cf-* in static/css/brand.css.
// `color` overrides the line (default: --cf-line, then --cb-grad); `face` overrides the fill behind the content;
// `pad` pads the content inside the lines. Everything else (className, style, role, onClick...) goes on the outer box,
// so position, size and animation classes work on it as they did on the plain div it replaces.
export default function ChamferFrame({ color, face, pad, className = '', style, children, ...rest }) {
  const vars = { ...(color && { '--cf-line': color }), ...(face && { '--cf-face': face }), ...(pad && { '--cf-pad': pad }), ...style }
  return (
    <div className={'cf ' + className} style={vars} {...rest}>
      <div className="cf-shadow" aria-hidden="true"><i /></div>
      <div className="cf-l1"><div className="cf-l2"><div className="cf-l3"><div className="cf-l4">
        {children}
      </div></div></div></div>
    </div>
  )
}
