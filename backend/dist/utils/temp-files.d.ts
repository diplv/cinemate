export declare function createTempDir(): Promise<{
    id: string;
    path: string;
}>;
export declare function removeTempDir(id: string): Promise<void>;
export declare function scheduleCleanup(id: string, delayMs?: number): void;
export declare function getTempFilePath(id: string, filename: string): string;
export declare function cleanupOrphaned(): Promise<void>;
//# sourceMappingURL=temp-files.d.ts.map