import fs from 'fs';
import path from 'path';

describe('legacy admin client credentials', () => {
  it('does not read admin email or passcode from client build variables', () => {
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'src/config/adminAccess.ts'),
      'utf8',
    );
    const keys = ['EMAIL', 'PASSCODE'].map((suffix) =>
      ['REACT', 'APP', 'ADMIN', suffix].join('_'));
    keys.forEach((key) => expect(source).not.toContain(key));
  });
});
