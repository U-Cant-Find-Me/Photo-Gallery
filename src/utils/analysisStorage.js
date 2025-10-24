import fs from 'fs';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), '.analysis-cache');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export class AnalysisStorage {
  static async save(imageId, analysis) {
    const filename = path.join(STORAGE_DIR, `${imageId}.json`);
    await fs.promises.writeFile(filename, JSON.stringify(analysis, null, 2));
    return { id: imageId };
  }

  static async get(imageId) {
    try {
      const filename = path.join(STORAGE_DIR, `${imageId}.json`);
      const data = await fs.promises.readFile(filename, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      if (err.code === 'ENOENT') return null;
      throw err;
    }
  }

  static async delete(imageId) {
    const filename = path.join(STORAGE_DIR, `${imageId}.json`);
    try {
      await fs.promises.unlink(filename);
      return true;
    } catch (err) {
      if (err.code === 'ENOENT') return false;
      throw err;
    }
  }

  static async list() {
    const files = await fs.promises.readdir(STORAGE_DIR);
    return files.map(f => path.basename(f, '.json'));
  }
}