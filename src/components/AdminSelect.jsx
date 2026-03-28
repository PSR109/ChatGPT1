export default function AdminSelect({
  value,
  onChange,
  style,
  options = [],
  children = null,
}) {
  return (
    <select value={value} onChange={onChange} style={style}>
      {children
        ? children
        : options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
    </select>
  )
}
