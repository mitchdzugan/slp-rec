{
  description = "slp-rec cli";
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = inputs: (
    inputs.flake-utils.lib.eachDefaultSystem (system: (
      let
        pkgs = inputs.nixpkgs.legacyPackages.${system};
        slp-rec = (pkgs.callPackage ./default.nix { });
      in {
        packages = {
          slp-rec = slp-rec;
          default = slp-rec;
        };
      }
    ))
  );
}
