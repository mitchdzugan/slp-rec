{ pkgs, lib, ... }: pkgs.buildNpmPackage {
  pname = "slp-rec";
  version = "1.0.0";
  src = ./.;
  npmDepsHash = "sha256-jQoCcFWf+ZkX2cTadRYs7pXi4A6mbTWltIClXhr56R0=";
  npmFlags = [ "--legacy-peer-deps" ];
  npmDepsFetcherVersion = 2;
  makeCacheWritable = true;
}
