export default function AdminTextInput({
  value,
  onChange,
  placeholder,
  style,
}) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={style}
    />
  )
}
