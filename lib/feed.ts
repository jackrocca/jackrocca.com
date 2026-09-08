import { Game, Team } from './types';
import { z } from 'zod';
const competitorSchema=z.object({homeAway:z.enum(['home','away']),team:z.object({id:z.string(),displayName:z.string(),shortDisplayName:z.string(),abbreviation:z.string(),color:z.string().optional(),logo:z.string().optional()}),score:z.string().optional()});
const eventSchema=z.object({id:z.string(),date:z.string(),season:z.object({year:z.number(),type:z.number()}),week:z.object({number:z.number()}),status:z.object({type:z.object({name:z.string(),state:z.string(),completed:z.boolean(),shortDetail:z.string().optional()})}),competitions:z.array(z.object({timeValid:z.boolean().optional(),venue:z.object({fullName:z.string()}).optional(),competitors:z.array(competitorSchema),broadcasts:z.array(z.object({names:z.array(z.string())})).optional(),odds:z.array(z.object({provider:z.object({name:z.string()}).optional(),spread:z.number().optional(),overUnder:z.number().optional(),pointSpread:z.object({home:z.object({close:z.object({line:z.string().optional()}).optional()}).optional()}).optional()})).optional()}))});
export function parseFeed(raw:unknown,week:number):Game[] {
  const data=z.object({season:z.object({year:z.number(),type:z.number()}),week:z.object({number:z.number()}),events:z.array(eventSchema)}).parse(raw);
  if(data.season.year!==2026||data.season.type!==2||data.week.number!==week||data.events.length===0) throw new Error('Unexpected season or week from schedule provider.');
  return data.events.map(e=>{
    if(e.season.year!==2026||e.season.type!==2||e.week.number!==week||!Number.isFinite(Date.parse(e.date))) throw new Error('Invalid game season/date.');
    const c=e.competitions[0],h=c.competitors.find(t=>t.homeAway==='home')!,a=c.competitors.find(t=>t.homeAway==='away')!;
    if(!h||!a) throw new Error('Missing competitors.');
    const team=(t:typeof h):Team=>({id:t.team.id,name:t.team.displayName,short:t.team.shortDisplayName,abbreviation:t.team.abbreviation,color:`#${t.team.color??'334155'}`,logo:t.team.logo??''});
    const o=c.odds?.find(o=>/draft\s*kings/i.test(o.provider?.name??''));
    const rawLine=o?.pointSpread?.home?.close?.line;
    const homeSpread=rawLine!==undefined?Number(rawLine):o?.spread;
    const s=e.status.type;
    const state:Game['state']=/CANCEL|FORFEIT/.test(s.name)?'canceled':/POSTPON|SUSPEND|DELAY/.test(s.name)?'postponed':s.completed?'final':s.state==='in'?'live':'scheduled';
    const score=(value:string|undefined)=>value!==undefined&&Number.isFinite(Number(value))?Number(value):null;
    return {id:e.id,week,kickoff:e.date,timeConfirmed:c.timeValid!==false,home:team(h),away:team(a),venue:c.venue?.fullName??'',broadcast:c.broadcasts?.flatMap(b=>b.names).join(' / ')??'',state,detail:s.shortDetail??'',homeScore:state==='scheduled'?null:score(h.score),awayScore:state==='scheduled'?null:score(a.score),homeSpread:homeSpread!==undefined&&Number.isFinite(homeSpread)?homeSpread:null,total:o?.overUnder&&Number.isFinite(o.overUnder)?o.overUnder:null,provider:o?.provider?.name??null};
  }).sort((a,b)=>Date.parse(a.kickoff)-Date.parse(b.kickoff));
}
export async function fetchWeek(week:number) {
  const response=await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=2026&seasontype=2&week=${week}&limit=1000`,{cache:'no-store',signal:AbortSignal.timeout(12000)});
  if(!response.ok) throw new Error(`Schedule provider returned ${response.status}.`);
  return parseFeed(await response.json(),week);
}
