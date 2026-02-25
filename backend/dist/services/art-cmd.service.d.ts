export interface ArtCmdResult {
    stdout: string;
    stderr: string;
    exitCode: number;
}
export declare function isArtCmdAvailable(): Promise<{
    available: boolean;
    error?: string;
}>;
export declare function runArtCmd(args: string[], cwd?: string): Promise<ArtCmdResult>;
export declare function runLookBuilder(args: string[], cwd?: string): Promise<ArtCmdResult>;
//# sourceMappingURL=art-cmd.service.d.ts.map