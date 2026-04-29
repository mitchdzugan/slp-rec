{ pkgs, ... }: pkgs.buildNpmPackage {
  pname = "slp-rec";
  version = "1.0.0";
  src = ./.;
  npmDepsHash = "sha256-CQynQAhfiZyNIGLzCadzpuS/WgT5VwXpdqf4RJCixUU=";
  nativeBuildInputs = [ pkgs.makeWrapper ];
  postInstall = ''
    wrapProgram $out/bin/slp-rec \
      --set NODE_OPTIONS "--experimental-specifier-resolution=node"
  '';

}
