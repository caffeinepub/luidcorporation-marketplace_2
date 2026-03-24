import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Script {
    id: bigint;
    accessKey?: string;
    title: string;
    changelog: string;
    createdAt: Time;
    description: string;
    isActive: boolean;
    language: string;
    version: string;
    imageKey: string;
    category: string;
    price: bigint;
    requirements: string;
    fileKey: string;
}
export interface Purchase {
    id: bigint;
    accessKey?: string;
    scriptId: bigint;
    purchasedAt: Time;
    buyerPrincipal: Principal;
}
export interface UserProfile {
    username: string;
    createdAt: Time;
    isActive: boolean;
    email: string;
    userPrincipal: Principal;
    isAdmin: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminCreateScript(title: string, description: string, version: string, price: bigint, language: string, category: string, requirements: string, changelog: string, fileKey: string, accessKey: string, imageKey: string): Promise<string>;
    adminDeleteScript(id: bigint): Promise<string>;
    adminGetAllPurchases(): Promise<Array<Purchase>>;
    adminGetAllUsers(): Promise<Array<UserProfile>>;
    adminGetStats(): Promise<string>;
    adminUpdateScript(id: bigint, title: string, description: string, version: string, price: bigint, language: string, category: string, requirements: string, changelog: string, fileKey: string, accessKey: string, imageKey: string, isActive: boolean): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    demoteFromAdmin(targetPrincipal: Principal): Promise<string>;
    getAllScripts(): Promise<Array<Script>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyProfile(): Promise<UserProfile | null>;
    getMyPurchases(): Promise<Array<Purchase>>;
    getScriptById(id: bigint): Promise<Script | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    promoteToAdmin(targetPrincipal: Principal): Promise<string>;
    purchaseScript(scriptId: bigint): Promise<string>;
    registerUser(username: string, email: string): Promise<string>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    suspendUser(targetPrincipal: Principal): Promise<string>;
    toggleUserStatus(targetPrincipal: Principal): Promise<string>;
}
