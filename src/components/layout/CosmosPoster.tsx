/** CSS-only cosmos poster (§8.5): always underneath; the 3D canvas (M3) fades in over it. */
export function CosmosPoster() {
  return (
    <div className="cosmos-poster" aria-hidden="true">
      <div className="cosmos-poster__stars" />
      <div className="cosmos-poster__glow cosmos-poster__glow--wine" />
      <div className="cosmos-poster__glow cosmos-poster__glow--brass" />
    </div>
  );
}
