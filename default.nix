{ pkgs, ... }: pkgs.buildNpmPackage {
  pname = "slp-rec";
  version = "1.0.0";
  src = ./.;
  npmDepsHash = "sha256-KbXqmM/XK5P22KQQibAUvCfzKRK95eyrSYSoe0QkFeM=";
}
