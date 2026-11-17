import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
const gh=(...args)=>JSON.parse(execFileSync('gh',['api',...args],{encoding:'utf8',maxBuffer:8e6}));
const sha=b=>createHash('sha256').update(b).digest('hex');
const comment=gh('repos/jf3096/todo-app-lab/issues/comments/6949310593');
const wrapper=JSON.parse(comment.body.match(/<!-- issue-card:execution (.*?) -->/s)[1]);
const sub=wrapper.record;
const refs=[...sub.checks.flatMap(c=>c.evidence),...sub.feedback_responses.flatMap(c=>c.evidence)];
const result={checked_started_at:new Date().toISOString(),reviewer_id:process.env.CODEX_THREAD_ID,submission_id:sub.id,comment_created_at:comment.created_at,items:[]};
for(const e of [...new Map(refs.map(e=>[e.uri,e])).values()]){
 const u=e.uri.replace('https://github.com/','https://raw.githubusercontent.com/').replace('/blob/','/');
 const res=await fetch(u); if(!res.ok)throw Error(`${res.status} ${u}`);
 const raw=Buffer.from(await res.arrayBuffer());
 const [commit,...parts]=e.uri.split('/blob/')[1].split('/');
 const blob=execFileSync('git',['show',`${commit}:${parts.join('/')}`],{maxBuffer:8e6});
 const item={uri:e.uri,checked_at:new Date().toISOString(),http:res.status,bytes:raw.length,expected_sha256:e.sha256,raw_sha256:sha(raw),git_blob_sha256:sha(blob),match:sha(raw)===e.sha256&&raw.equals(blob)};
 result.items.push(item); console.log(JSON.stringify(item));
 console.log(`CONTENT ${parts.at(-1)}\n${raw.toString('utf8')}`);
}
result.checked_finished_at=new Date().toISOString();
writeFileSync(new URL('./remote-inspection.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
if(result.items.some(i=>!i.match))process.exitCode=1;
