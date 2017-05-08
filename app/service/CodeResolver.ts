import * as sourcemap from 'source-map';
import { requestGet } from '../Utils';

class CodeResolver {
  fetchSourceCode(url: string) {
    return requestGet({
      url,
      headers: {
        'User-Agent': 'WebTracker'
      }
    });
  }

  decompressCode(sourceMap: string, line: number, column: number) {
    const consumer = new sourcemap.SourceMapConsumer(sourceMap);
    const decompressed = consumer.originalPositionFor({ line, column });
    return decompressed;
  }
}

export const codeResolver = new CodeResolver();
