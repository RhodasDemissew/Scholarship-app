import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { createHmac } from 'node:crypto';
export function totp(secret: string) {
 const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
 const bits = [...secret.toUpperCase()].map(c => alphabet.indexOf(c).toString(2).padStart(5,'0')).join('');
 const key = Buffer.from(bits.match(/.{8}/g)!.map(b => parseInt(b,2)));
 const counter = Buffer.alloc(8); counter.writeBigUInt64BE(BigInt(Math.floor(Date.now()/30000)));
 const hash = createHmac('sha1',key).update(counter).digest(); const offset = hash[19]&15;
 return ((hash.readUInt32BE(offset)&0x7fffffff)%1000000).toString().padStart(6,'0');
}
export function grant(email: string, role: string) {
 execFileSync('dotnet', ['bin/Release/net10.0/Scholarship.Api.dll','--grant-role',email,role], { cwd: resolve('../../src/Scholarship.Api'), env: { ...process.env, ASPNETCORE_ENVIRONMENT:'Development' }, stdio:'pipe' });
}

