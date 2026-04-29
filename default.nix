{ pkgs, ... }: pkgs.buildNpmPackage {
  pname = "slp-rec";
  version = "1.0.0";
  src = ./.;
  npmDepsHash = "sha256-6TviJZOGGszDDJ8kE11UCZj43d6DwVIgeHS7vGW7LN8=";
}
