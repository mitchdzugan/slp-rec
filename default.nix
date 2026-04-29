{ pkgs, ... }: pkgs.buildNpmPackage {
  pname = "slp-rec";
  version = "1.0.0";
  src = ./.;
  npmDepsHash = "sha256-T+qxR8M+iy1+PFMRVk1SkQP3J8nI1CccNP5JgPOd8To=";
}
