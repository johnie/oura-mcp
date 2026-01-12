import { cac } from 'cac';
import { version } from '../package.json';
import { startServer } from './server';

const cli = cac(`fetch-mcp`);

cli
  .command('[...args]', 'Start server')
  .option('--http [endpoint]', 'Use HTTP transport (default endpoint: /mcp)')
  .action(async (_args, flags) => {
    await startServer(
      flags.http
        ? {
            type: 'http',
            endpoint: typeof flags.http === 'string' ? flags.http : '/mcp',
          }
        : { type: 'stdio' },
    );
  });

cli.version(version);
cli.help();
cli.parse();
