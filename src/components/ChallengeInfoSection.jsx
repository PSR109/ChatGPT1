import CenteredMessage from './CenteredMessage'

export default function ChallengeInfoSection({
  challenge,
  label,
  line,
}) {
  if (!challenge) {
    return (
      <CenteredMessage
        text={`No hay desafío ${label.toLowerCase()} activo`}
        line={line}
      />
    )
  }

  return (
    <>
      <CenteredMessage text={`Juego: ${challenge.game}`} line={line} />
      <CenteredMessage text={`Circuito / Etapa: ${challenge.track}`} line={line} />
      <CenteredMessage text={`Auto: ${challenge.car}`} line={line} />
    </>
  )
}
