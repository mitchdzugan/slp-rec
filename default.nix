{ pkgs, ... }: pkgs.buildNpmPackage {
  pname = "slp-rec";
  version = "1.0.0";
  src = ./.;
  npmDepsHash = "sha256-9aTI+DGBIqrO3ypeipKEE56OG/vBh9fjsjLyX3fyE4o=";
  npmFlags = [ "--legacy-peer-deps" ];
  npmDepsFetcherVersion = 2;
  makeCacheWritable = true;
}
