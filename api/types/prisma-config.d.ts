declare module "prisma/config" {
  export const env: (name: string) => string;
  export const defineConfig: (config: unknown) => unknown;
}
