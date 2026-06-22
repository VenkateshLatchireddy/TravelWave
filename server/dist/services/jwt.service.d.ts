export interface ITokenPayload {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
}
export interface ITokenResponse {
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: Date;
    refreshTokenExpires: Date;
}
export declare class JWTService {
    private static instance;
    private readonly accessTokenSecret;
    private readonly refreshTokenSecret;
    private readonly accessTokenExpiry;
    private readonly refreshTokenExpiry;
    private constructor();
    static getInstance(): JWTService;
    generateTokens(payload: ITokenPayload): ITokenResponse;
    verifyAccessToken(token: string): ITokenPayload;
    verifyRefreshToken(token: string): {
        userId: string;
    };
    generatePasswordResetToken(): string;
    generateEmailVerificationToken(): string;
}
//# sourceMappingURL=jwt.service.d.ts.map