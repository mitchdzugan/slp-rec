{
  description = "slp-rec cli";
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    tsdown.url = "github:mitchdzugan/nix-tsdown";
    spago.url = "github:mitchdzugan/nix-spago";
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
        devShells = {
          default = pkgs.mkShell {
            buildInputs = [
              pkgs.nodejs_26
              pkgs.purescript
              inputs.tsdown.packages.${system}.tsdown
              inputs.spago.packages.${system}.spago
            ];
          };
        };
      }
    ))
  );
}
