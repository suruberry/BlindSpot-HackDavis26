export default function BlindSpotLogo({ className = "" }: { className?: string }) {
  return (
    <img
      src="/blindspot-logo.png"
      alt="BlindSpot"
      className={`block rounded-[28%] object-contain ${className}`}
      draggable={false}
    />
  )
}
