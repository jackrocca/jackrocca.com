import { fetchWeek } from './feed';
import { audit, mutate, readState } from './store';
import { currentWeek, deadline, freezeTime, publishWeek } from './rules';
export async function syncWeeks(numbers?:number[],force=false) {
  const {state}=await readState(); const current=currentWeek(state.weeks);
  const selected=numbers??[...new Set([Math.max(1,current-1),current,Math.min(18,current+1)])];
  const results=await Promise.all(selected.map(async number=>{
    const week=state.weeks.find(w=>w.number===number)!;
    if(!force&&week.fetchedAt&&Date.now()-Date.parse(week.fetchedAt)<60_000)return {number,skipped:true};
    try {
      const games=await fetchWeek(number), at=new Date().toISOString();
      await mutate(s=>{const w=s.weeks.find(w=>w.number===number)!;if(w.fetchedAt&&Date.parse(w.fetchedAt)>Date.parse(at))return;w.games=games.map(g=>{const old=w.games.find(old=>old.id===g.id);if(old?.resultOverride){g.resultOverride=old.resultOverride;g.homeScore=old.resultOverride.homeScore;g.awayScore=old.resultOverride.awayScore;g.state=old.resultOverride.state;g.detail="Commissioner correction";}if(old?.linesOverride){g.linesOverride=old.linesOverride;g.homeSpread=old.linesOverride.homeSpread;g.total=old.linesOverride.total;g.provider="Commissioner";}return g;});w.fetchedAt=at;w.error=null;
        if(!w.publishedAt&&Date.now()>=freezeTime(w)&&Date.now()<deadline(w)) {try{publishWeek(w);audit(s,'system','publish-lines',`Week ${number}: Wednesday lines frozen.`);}catch(e){w.error=(e as Error).message;}}
      });
      return {number,ok:true,games:games.length};
    } catch(e) {const message=e instanceof Error?e.message:'Feed unavailable';await mutate(s=>{s.weeks.find(w=>w.number===number)!.error=message;});return {number,ok:false,error:message};}
  }));return results;
}
