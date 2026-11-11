import { useParticleField } from "../hooks/useParticleField";
export default function ParticleSphere() {
  const ref = useParticleField();
  return <canvas className="particle-sphere" ref={ref} aria-hidden="true" />;
}
