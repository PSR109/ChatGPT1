export default function CenteredInfoText({
  text,
  line,
  style = {},
}) {
  return <p style={{ ...line, textAlign: 'center', ...style }}>{text}</p>
}
