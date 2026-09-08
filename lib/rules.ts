import { Entry, Game, PICK_TYPES, PickInput, PickType, Score, SEASON, State, Week } from './types';
export class AppError extends Error { constructor(message:string, public status=400) { super(message); } }
export const signed = (n:number) => n > 0 ? `+${n}` : `${n}`;
export function deadline(week: Week) { return Math.min(...week.games.filter(g=>g.state!=='canceled').map(g=>Date.parse(g.kickoff))); }
export function freezeTime(week: Week) {
  // Wednesday 09:00 America/Los_Angeles in the NFL week containing its opening game.
  const start = new Date(deadline(week));
  const parts = new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(start);
  const part = (key:string) => Number(parts.find(p=>p.type===key)?.value);
  const day = new Date(Date.UTC(part('year'),part('month')-1,part('day'),12));
  day.setUTCDate(day.getUTCDate()-((day.getUTCDay()+4)%7));
  const offsetName = new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',timeZoneName:'shortOffset'}).formatToParts(day).find(p=>p.type==='timeZoneName')!.value;
  const offset = Number(offsetName.replace('GMT',''));
  day.setUTCHours(9-offset,0,0,0);
  return day.getTime();
}
export function currentWeek(weeks:Week[], now=Date.now()) {
  return weeks.find(w=>now < Math.max(...w.games.map(g=>Date.parse(g.kickoff)))+30*60*60*1000)?.number ?? 18;
}
export function gameOpen(game:Game,now=Date.now()) { return game.timeConfirmed && game.state==='scheduled' && Date.parse(game.kickoff)>now; }
export function selection(week:Week,type:PickType,id:string) {
  const game=week.games.find(g=>g.id===id); if(!game) throw new AppError('That game is not in this week.');
  const odds=week.lines[id]; if(!odds) throw new AppError('Lines have not been published for this game.');
  if(type==='favorite'||type==='underdog') {
    if(odds.homeSpread===null||odds.homeSpread===0) throw new AppError('This game has no eligible spread.');
    const home=(type==='favorite') === (odds.homeSpread<0); const team=home?game.home:game.away;
    const line=home?odds.homeSpread:-odds.homeSpread;
    return {gameId:id,teamId:team.id,line,label:`${team.name} ${signed(line)}`};
  }
  if(odds.total===null) throw new AppError('This game has no total.');
  return {gameId:id,line:odds.total,label:`${game.away.abbreviation} @ ${game.home.abbreviation} · ${type==='over'?'Over':'Under'} ${odds.total}`};
}
export function saveEntry(state:State,userId:string,input:PickInput,now=Date.now()) {
  const week=state.weeks.find(w=>w.number===input.week); if(!week||!week.publishedAt) throw new AppError('Picks open once the weekly lines are published.');
  const old=state.entries.find(e=>e.userId===userId&&e.week===input.week&&e.season===SEASON);
  const late=now>=deadline(week);
  if(old&&late) throw new AppError('Your submitted picks are locked for the week.');
  if((old?.revision??0)!==input.revision) throw new AppError('Your picks changed in another tab. Refresh before saving again.',409);
  if(new Set(PICK_TYPES.map(t=>input.picks[t])).size!==4) throw new AppError('Choose four different games.');
  for(const type of PICK_TYPES) { const g=week.games.find(g=>g.id===input.picks[type]); if(!g||!gameOpen(g,now)) throw new AppError('A selected game has started or is unavailable. Choose another game.'); }
  if(late&&(input.superSpread||input.totalHelper||input.perfectPrediction)) throw new AppError('Late entries cannot use powerups.');
  const other=state.entries.filter(e=>e.userId===userId&&e.season===SEASON&&e.week!==input.week);
  for(const power of ['superSpread','totalHelper','perfectPrediction'] as const) if(input[power]&&other.some(e=>e[power])) throw new AppError('That powerup has already been used this season.');
  const picks=Object.fromEntries(PICK_TYPES.map(t=>[t,selection(week,t,input.picks[t])])) as Entry['picks'];
  if(input.superSpread&&picks.favorite.line>-5) throw new AppError('Super Spread requires a favorite of -5 or greater.');
  const time=new Date(now).toISOString();
  const entry:Entry={id:old?.id??crypto.randomUUID(),userId,week:input.week,season:SEASON,picks,superSpread:input.superSpread,totalHelper:input.totalHelper,perfectPrediction:input.perfectPrediction,late,submittedAt:old?.submittedAt??time,updatedAt:time,revision:(old?.revision??0)+1};
  state.entries=state.entries.filter(e=>e.id!==entry.id).concat(entry);
  return entry;
}
export function scoreEntry(entry:Entry,games:Game[]):Score {
  const outcomes={} as Score['outcomes']; let points=0,wins=0;
  for(const type of PICK_TYPES) {
    const pick=entry.picks[type], game=games.find(g=>g.id===pick.gameId);
    if(game?.state==='canceled') { outcomes[type]='void'; points+=0.5; continue; }
    if(!game||game.state!=='final'||game.homeScore===null||game.awayScore===null) { outcomes[type]='pending'; continue; }
    let margin:number;
    if(type==='favorite'||type==='underdog') {
      const isHome=pick.teamId===game.home.id;
      if(!isHome&&pick.teamId!==game.away.id) {outcomes[type]='pending';continue;}
      const line=type==='favorite'&&entry.superSpread&&!entry.late?pick.line*2:pick.line;
      margin=(isHome?game.homeScore-game.awayScore:game.awayScore-game.homeScore)+line;
    } else {
      const adjusted=pick.line+(entry.totalHelper===type&&!entry.late?(type==='over'?-5:5):0);
      margin=(game.homeScore+game.awayScore-adjusted)*(type==='over'?1:-1);
    }
    outcomes[type]=margin>0?'win':margin===0?'push':'loss';
    const superPick=type==='favorite'&&entry.superSpread&&!entry.late;
    if(margin>0) {wins++; points+=superPick?2.5:1;} else if(margin===0) points+=superPick?1:0.5;
  }
  const perfect=wins===4, complete=Object.values(outcomes).every(o=>o!=='pending');
  if(perfect) {if(entry.perfectPrediction&&!entry.late) points=8; else if(!entry.superSpread) points+=1;}
  if(entry.late) points=Math.max(0,points-1);
  return {points,wins,perfect,complete,outcomes};
}
export function publishWeek(week:Week,now=Date.now()) {
  if(week.publishedAt) throw new AppError('This week’s lines are already frozen.',409);
  if(now>=deadline(week)) throw new AppError('Cannot publish new lines after the opening kickoff.');
  const eligible=week.games.filter(g=>gameOpen(g,now)&&(g.homeSpread!==null||g.total!==null));
  if(eligible.length<4) throw new AppError('At least four games with real lines are needed.');
  week.lines=Object.fromEntries(eligible.map(g=>[g.id,{homeSpread:g.homeSpread,total:g.total,provider:g.provider}]));
  week.publishedAt=new Date(now).toISOString();
}
