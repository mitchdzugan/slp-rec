{
  description = "slp-rec cli";
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    flake-parts.url = "github:hercules-ci/flake-parts";
    flake-root.url = "github:srid/flake-root";
    tsdown.url = "github:mitchdzugan/nix-tsdown";
    spago.url = "github:mitchdzugan/nix-spago";
  };
  outputs = inputs: (
    inputs.flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [ inputs.flake-root.flakeModule ];
      perSystem = { pkgs, system, config, ... }: (
        let slp-rec = (pkgs.callPackage ./default.nix { }); in {
          packages = {
            slp-rec = slp-rec;
            default = slp-rec;
          };
          devShells = {
            default = pkgs.mkShell {
              inputsFrom = [ config.flake-root.devShell ];
              buildInputs = [
                pkgs.nodejs_26
                pkgs.purescript
                inputs.tsdown.packages.${system}.tsdown
                inputs.spago.packages.${system}.spago
                (pkgs.writeShellScriptBin "build" ''
                  cd $FLAKE_ROOT
                  spago build
                  tsdown index.js
                '')
              ];
            };
          };
        }
      );
      systems = inputs.nixpkgs.lib.systems.flakeExposed;
    }
  );
}
