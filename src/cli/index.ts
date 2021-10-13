import { GraphBuilder } from '../lib/GraphBuilder';
import { NpmAdapter } from '../lib/PackageManagerAdapter/NpmAdapter';

const builder = new GraphBuilder(new NpmAdapter());

async function main() {
  const graph = await builder.buildDependencyGraph('@dashevo/feature-flags-contract');
  console.dir(graph, { depth: 100 });
  console.log(graph.listAllDependants());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
