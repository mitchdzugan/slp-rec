module Main where

import Z.Prelude
import Z.SSBM.Slp.Rec.Node.Impl as SlpRec
import Z.Sys.Node.Module as Sys

main ∷ Effect Unit
main = Sys.xExecAndExitArgv SlpRec.run
