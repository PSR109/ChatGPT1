export function buildCenteredTableStyles(th, td) {
  return {
    thCenter: { ...th, textAlign: 'center', verticalAlign: 'middle' },
    tdCenter: { ...td, textAlign: 'center', verticalAlign: 'middle' },
  }
}
