import * as p5 from 'p5';
export { p5 };
export default p5;
export declare const readPng: (filename: string) => Promise<p5.Image>;
export declare const readPngSync: (filename: string) => p5.Image;
export declare const writePng: (g: p5 | p5.Image | p5.Graphics, filename: string) => Promise<void>;
export declare const writePngSync: (g: p5 | p5.Image | p5.Graphics, filename: string) => void;
