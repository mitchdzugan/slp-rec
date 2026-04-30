{ pkgs, ... }: pkgs.buildNpmPackage {
  pname = "slp-rec";
  version = "1.0.0";
  src = ./.;
  npmDepsHash = "sha256-saUOeKdY+TeS7uui2/fiTxA9pzz8RJopFWA4m8vq9/M=";
}
