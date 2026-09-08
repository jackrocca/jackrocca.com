import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { SignJWT, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { AppError } from './rules';
import { State, User } from './types';
const scryptAsync=promisify(scrypt);
export const tokenHash=(token:string)=>createHash('sha256').update(token).digest('hex');
export const newToken=()=>randomBytes(32).toString('base64url');
export async function passwordHash(password:string) {const salt=randomBytes(16).toString('hex');const key=await scryptAsync(password,salt,64) as Buffer;return `${salt}:${key.toString('hex')}`;}
export async function verifyPassword(password:string,hash:string) {const [salt,stored]=hash.split(':');if(!salt||!stored)return false;const key=await scryptAsync(password,salt,64) as Buffer;const expected=Buffer.from(stored,'hex');return key.length===expected.length&&timingSafeEqual(key,expected);}
function secret() {const value=process.env.SESSION_SECRET;if(!value||value.length<32)throw new Error('SESSION_SECRET is not configured.');return new TextEncoder().encode(value);}
export function safeSecret(input:string,expected:string|undefined) {if(!expected)return false;return timingSafeEqual(Buffer.from(tokenHash(input)),Buffer.from(tokenHash(expected)));}
export async function session(req:NextRequest,state:State):Promise<User|null> {const token=req.cookies.get('pick4-session')?.value;if(!token)return null;try {const {payload}=await jwtVerify(token,secret(),{issuer:'pick4',audience:'pick4-league',algorithms:['HS256']});return state.users.find(u=>u.id===payload.sub&&u.sessionVersion===payload.version)??null;}catch{return null;}}
export async function loginResponse(user:User) {const token=await new SignJWT({version:user.sessionVersion}).setProtectedHeader({alg:'HS256'}).setSubject(user.id).setIssuer('pick4').setAudience('pick4-league').setIssuedAt().setExpirationTime('14d').sign(secret());const response=NextResponse.json({ok:true});response.cookies.set('pick4-session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:14*86400});return response;}
export function requireUser(user:User|null) {if(!user)throw new AppError('Sign in to continue.',401);return user;}
export function requireAdmin(user:User|null) {if(requireUser(user).role!=='admin')throw new AppError('Commissioner access required.',403);return user!;}
export function sameOrigin(req:NextRequest) {const origin=req.headers.get('origin');if(!origin||origin!==new URL(req.url).origin)throw new AppError('This request must come from the league app.',403);}
