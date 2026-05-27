{ pkgs, ... }: pkgs.buildNpmPackage {
  pname = "slp-rec";
  version = "1.0.0";
  src = ./.;
  npmDepsHash = "sha256-r0AmLEERqsVVloQTuNhIses9Wp96rLbhM6RCqYCSRlc=";
  npmFlags = [ "--legacy-peer-deps" ];
  npmDepsFetcherVersion = 2;
  makeCacheWritable = true;
}
