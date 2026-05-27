{ pkgs, ... }: pkgs.buildNpmPackage {
  pname = "slp-rec";
  version = "1.0.0";
  src = ./.;
  npmDepsHash = "sha256-aYyIYtftzttVn6NW8lY0EEUcGPLlfFdWXiltdWzyaaA=";
  npmFlags = [ "--legacy-peer-deps" ];
  npmDepsFetcherVersion = 2;
  makeCacheWritable = true;
}
