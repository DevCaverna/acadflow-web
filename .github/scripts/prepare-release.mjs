import { readFileSync, writeFileSync } from 'node:fs';

const stable = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$/;

function prepare(version, date) {
  if (!stable.test(version)) throw new Error('Expected X.Y.Z without a v prefix.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Expected a release date in UTC.');

  const manifest = JSON.parse(readFileSync('package.json', 'utf8'));
  if (!stable.test(manifest.version)) throw new Error('Invalid package.json version.');
  const current = manifest.version.split('.').map(BigInt);
  const next = version.split('.').map(BigInt);
  const changed = next.findIndex((part, i) => part !== current[i]);
  if (changed === -1 || next[changed] < current[changed]) {
    throw new Error('Release version must be newer than package.json.');
  }

  const changelog = readFileSync('CHANGELOG.md', 'utf8');
  const headings = [...changelog.matchAll(/^## \[([^\]\n]+)\][^\n]*$/gm)];
  const unreleased = headings[0];
  if (
    unreleased?.[0] !== '## [Unreleased]' ||
    headings.slice(1).some((heading) => heading[1] === 'Unreleased')
  ) {
    throw new Error('Expected one leading [Unreleased] section in CHANGELOG.md.');
  }
  if (headings.some((heading) => heading[1] === version)) {
    throw new Error('Release version already exists in CHANGELOG.md.');
  }

  const end = headings[1]?.index ?? changelog.length;
  const notes = changelog.slice(unreleased.index + unreleased[0].length, end).trim();
  if (!/^- \S/m.test(notes)) throw new Error('[Unreleased] has no release notes.');

  const remainder = changelog.slice(end).trimEnd();
  const header = changelog.slice(0, unreleased.index);
  manifest.version = version;
  writeFileSync('package.json', `${JSON.stringify(manifest, null, 2)}\n`);
  writeFileSync(
    'CHANGELOG.md',
    `${header}## [Unreleased]\n\n## [${version}] - ${date}\n\n${notes}${remainder ? `\n\n${remainder}` : ''}\n`,
  );
  return notes;
}

try {
  process.stdout.write(`${prepare(process.argv[2] ?? '', process.argv[3] ?? '')}\n`);
} catch (error) {
  process.stderr.write(`Release: ${error.message}\n`);
  process.exitCode = 1;
}
