{ pkgs, lib, ... }: pkgs.buildNpmPackage {
  pname = "slp-rec";
  version = "1.0.0";
  src = ./.;
  npmDepsHash = "sha256-wdi3CSVHC1qhe25wk+p6PXRwHBRL+qTKdlJH6ZONevE=";
}
