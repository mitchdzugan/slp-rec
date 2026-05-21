import * as $ from "@dz/-";
import { fs } from "@dz/-/node";

async function main() {
  console.log({ fs });
}

$.execAndExit(main());
