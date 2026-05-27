{ pkgs, ... }: pkgs.buildNpmPackage {
  pname = "slp-rec";
  version = "1.0.0";
  src = ./.;
  npmDepsHash = "sha256-OunZ9aHplnyyow73o/i8iXrM+hfosGCoUJmnIQEjqiM=";
}
