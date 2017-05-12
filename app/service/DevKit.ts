import * as fs from 'fs';
import * as path from 'path';

function readFile(filename: string) {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(filename, 'utf-8', (error, content) => {
      if (error) return reject(error);
      resolve(content);
    });
  });
}

export async function resolveSDK() {
  const code = await readFile(path.join(__dirname, '../../../sdk/lib/sdk.js'));
  return code.replace('\n//# sourceMappingURL=sdk.js.map', '');
}
