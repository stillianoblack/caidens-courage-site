import packageJson from '../../package.json';

export type AppVersionInfo = {
  packageVersion: string;
  buildTime: string;
  commit: string;
  nodeEnv: string;
  signupContract: 'family-function-v2';
};

export const APP_VERSION: AppVersionInfo = {
  packageVersion: packageJson.version,
  buildTime: process.env.REACT_APP_BUILD_TIME ?? 'unknown',
  commit:
    process.env.REACT_APP_COMMIT_REF ??
    process.env.REACT_APP_VERCEL_GIT_COMMIT_SHA ??
    process.env.REACT_APP_GIT_COMMIT ??
    'local',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  signupContract: 'family-function-v2',
};

export function logAppVersion(): void {
  console.info('[APP_VERSION]', JSON.stringify(APP_VERSION));
}
