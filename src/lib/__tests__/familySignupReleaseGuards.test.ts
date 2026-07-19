import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '..', '..', '..');

describe('family signup release guards', () => {
  test('cache rules revalidate the shell and service worker while preserving hashed assets', () => {
    const config = fs.readFileSync(path.join(root, 'netlify.toml'), 'utf8');
    const staticRule = config.indexOf('for = "/static/*"');
    const serviceWorkerRule = config.indexOf('for = "/sw.js"');

    expect(config).toContain('for = "/*.html"');
    expect(config).toContain('Cache-Control = "public, max-age=0, must-revalidate"');
    expect(config.slice(staticRule, serviceWorkerRule)).toContain(
      'Cache-Control = "public, max-age=0, must-revalidate"',
    );
    expect(config.slice(staticRule, serviceWorkerRule)).toContain(
      'Netlify-CDN-Cache-Control = "public, s-maxage=31536000, immutable"',
    );
    expect(config.slice(serviceWorkerRule)).toContain(
      'Cache-Control = "public, max-age=0, must-revalidate"',
    );
    expect(serviceWorkerRule).toBeGreaterThan(staticRule);
  });

  test('service worker registration is build-versioned and bypasses HTTP cache', () => {
    const source = fs.readFileSync(path.join(root, 'src/index.js'), 'utf8');
    expect(source).toContain('APP_VERSION.buildTime');
    expect(source).toContain('APP_VERSION.commit');
    expect(source).toMatch(/`\/sw\.js\?v=\$\{workerVersion\}`/);
    expect(source).toContain("updateViaCache: 'none'");
  });

  test('the page always clears its synchronous duplicate-submit guard in finally', () => {
    const source = fs.readFileSync(path.join(root, 'src/pages/PilotProgramSignupPage.tsx'), 'utf8');
    expect(source).toContain('if (submittingRef.current) return;');
    expect(source).toMatch(/finally\s*\{[\s\S]*submittingRef\.current = false;[\s\S]*setSubmitting\(false\)/);
    expect(source).not.toContain('trackKitParentSignup');
  });
});
