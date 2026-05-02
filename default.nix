{ pkgs, ... }: pkgs.buildNpmPackage {
  pname = "slp-rec";
  version = "1.0.0";
  src = ./.;
  npmDepsHash = "sha256-ikA8dCxFZckYDOWf2EvIe3tvdfcHz1d64eO4fTrQKYg=";
}
