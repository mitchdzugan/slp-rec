{ pkgs, ... }: pkgs.buildNpmPackage {
  pname = "slp-rec";
  version = "1.0.0";
  src = ./.;
  npmDepsHash = "sha256-mE+wZDCjSOhCa4GEl/fRQj6yh9Sa3bWLUc+ybAMw8h0=";
}
