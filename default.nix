{ pkgs, ... }: pkgs.buildNpmPackage {
  pname = "slp-rec";
  version = "1.0.0";
  src = ./.;
  npmDepsHash = "sha256-mKYJsX2V0xr61cw6TioGXDaf2ItVVs+vY9fCCODX+mg=";
}
