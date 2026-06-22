declare module 'html-pdf' {
  import { Readable } from 'stream';

  export interface CreateOptions {
    format?: string;
    orientation?: 'portrait' | 'landscape';
    border?: string | {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
    quality?: string;
    paginationOffset?: number;
    header?: { height: string };
    footer?: { height: string };
    timeout?: number;
  }

  export interface PdfObject {
    toBuffer(callback: (err: Error | null, buffer: Buffer) => void): void;
    toStream(callback: (err: Error | null, stream: Readable) => void): void;
    toFile(path: string, callback: (err: Error | null, res: { filename: string }) => void): void;
  }

  function create(html: string, options: CreateOptions): PdfObject;
  namespace create {}
  export = create;
}
