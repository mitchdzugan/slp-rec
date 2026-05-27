{ pkgs, ... }: pkgs.buildNpmPackage {
  pname = "slp-rec";
  version = "1.0.0";
  src = ./.;
  npmDepsHash = "sha256-FoJYvKAxA60tF2YlfadtKiHK58r5hIdFfLJj9QDBvBc=";
  npmFlags = [ "--legacy-peer-deps" ];
  npmDepsFetcherVersion = 2;
  makeCacheWritable = true;
}
