{ pkgs, ... }: pkgs.buildNpmPackage {
  pname = "slp-rec";
  version = "1.0.0";
  src = ./.;
  npmDepsHash = "sha256-CQynQAhfiZyNIGLzCadzpuS/WgT5VwXpdqf4RJCixUU=";
}
