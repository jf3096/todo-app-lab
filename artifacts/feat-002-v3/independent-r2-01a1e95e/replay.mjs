import {chromium} from 'file:///C:/Users/KSG/Documents/ChatGPT/todo-app-lab/node_modules/playwright/index.mjs';
import {spawn,spawnSync,execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createConnection} from 'node:net';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
const dir=fileURLToPath(new URL('.',import.meta.url));
const base='C:/Users/KSG/AppData/Local/Temp/feat002-r2-review-01a1e95e';
const candidate='6b2d3cc987b09a05d85276d2f36b02be85a67040';
const git=(...args)=>execFileSync('git',args,{cwd:base,encoding:'utf8'}).trim();
const gh=(path)=>JSON.parse(execFileSync('gh',['api',path],{encoding:'utf8'}));
const clock=()=>new Date().toISOString();
const portOpen=()=>new Promise(resolve=>{const s=createConnection({host:'127.0.0.1',port:4173});s.once('connect',()=>{s.destroy();resolve(true)});s.once('error',()=>resolve(false));s.setTimeout(1500,()=>{s.destroy();resolve(false)})});
const r={schema:'feat-002.independent-r2-review/v1',started_at:clock(),session_id:process.env.CODEX_SESSION_ID,reviewer_id:process.env.CODEX_THREAD_ID,submission_id:'feat-002-sop1-r2-submission-ceff34ba341a',revision:2,candidate_sha:candidate,baseline_head:git('rev-parse','HEAD'),baseline_status_before:git('status','--porcelain=v1'),remote_main:git('ls-remote','origin','refs/heads/main'),environment:{os:process.platform,node:process.version,playwright:JSON.parse(readFileSync('C:/Users/KSG/Documents/ChatGPT/todo-app-lab/node_modules/playwright/package.json','utf8')).version,entry:'http://127.0.0.1:4173/',viewport:{width:1280,height:900},theme:'light',locale:'zh-CN',input:'v3-created-at-check'},requests:[],page_errors:[],console_errors:[],cleanup:{port_open_before:await portOpen()}};
assert.equal(r.baseline_head,candidate);assert.equal(r.baseline_status_before,'');assert.equal(r.cleanup.port_open_before,false,'Do not reuse an existing listener');
r.pages_build=gh('repos/jf3096/todo-app-lab/pages/builds/latest');
r.deployment=gh('repos/jf3096/todo-app-lab/deployments?environment=github-pages&per_page=1')[0];
r.evidence_changed_paths=git('diff','--name-only',candidate,'ceff34ba341abf39038ee035bb72db728884c1a9').split('\n');
assert(r.evidence_changed_paths.every(p=>p.startsWith('artifacts/feat-002-v3/')));
r.public_source=[];
for(const f of ['index.html','app.js','styles.css']){
 const res=await fetch('https://jf3096.github.io/todo-app-lab/'+f);
 const bytes=Buffer.from(await res.arrayBuffer());
 const blob=execFileSync('git',['show',`${candidate}:${f}`],{cwd:base});
 r.public_source.push({file:f,http:res.status,checked_at:clock(),matches_candidate:bytes.equals(blob),sha256:createHash('sha256').update(bytes).digest('hex')});
}
let service,browser,context;
try{
 service=spawn('cmd.exe',['/d','/s','/c','npm start'],{cwd:base,windowsHide:true,stdio:['ignore','pipe','pipe']});
 r.cleanup.self_started_pid=service.pid;r.cleanup.service_log='';
 service.stdout.on('data',d=>r.cleanup.service_log+=d);service.stderr.on('data',d=>r.cleanup.service_log+=d);
 const deadline=Date.now()+15000;while(!await portOpen()){if(Date.now()>deadline)throw Error('Own service did not become ready');await new Promise(resolve=>setTimeout(resolve,100))}
 r.service_ready_at=clock();
 browser=await chromium.launch({headless:true,executablePath:'C:/Users/KSG/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe'});
 r.environment.browser=browser.version();
 context=await browser.newContext({viewport:r.environment.viewport,colorScheme:'light',locale:'zh-CN'});
 context.on('request',req=>r.requests.push({url:req.url(),method:req.method(),observed_at:clock()}));
 const page=await context.newPage();page.on('pageerror',e=>r.page_errors.push(e.message));page.on('console',m=>{if(m.type()==='error')r.console_errors.push(m.text())});
 const response=await page.goto(r.environment.entry);r.http_status=response.status();
 const snap=async()=>{const observed=await page.evaluate(()=>({tasks:[...document.querySelectorAll('#task-list > li.task-item')].map(el=>({text:el.innerText,html:el.outerHTML,time_count:el.querySelectorAll('time').length,data_created_at_count:el.querySelectorAll('[data-created-at]').length,class_count:el.querySelectorAll('.task-created-at').length})),local_storage:{...localStorage},session_storage:{...sessionStorage},cookie:document.cookie,scroll_width:document.documentElement.scrollWidth,viewport_width:innerWidth}));return {captured_at:clock(),...observed}};
 r.initial=await snap();assert.equal(r.initial.tasks.length,0);assert.deepEqual(r.initial.local_storage,{});assert.equal(r.initial.cookie,'');
 await page.locator('#task-input').fill('v3-created-at-check');await page.locator('button[type=submit]').click();r.after_add=await snap();
 await page.reload();r.after_reload=await snap();
 assert.equal(r.after_add.tasks.length,1);assert.equal(r.after_reload.tasks.length,1);assert.deepEqual(r.after_add.local_storage,r.after_reload.local_storage);
 for(const s of [r.after_add,r.after_reload]){assert.equal(s.tasks[0].time_count+s.tasks[0].data_created_at_count+s.tasks[0].class_count,0);assert.deepEqual(Object.keys(JSON.parse(s.local_storage['todo-app-lab.tasks.v1'])[0]).sort(),['completed','id','text'])}
 await page.screenshot({path:dir+'after-reload.png',fullPage:true});r.screenshot_captured_at=clock();r.screenshot_sha256=createHash('sha256').update(readFileSync(dir+'after-reload.png')).digest('hex');
 r.cookies=await context.cookies();r.external_requests=r.requests.filter(q=>!q.url.startsWith(r.environment.entry));assert.equal(r.external_requests.length,0);
 await context.close();context=null;r.cleanup.synthetic_context_closed_at=clock();await browser.close();browser=null;
 const test=spawnSync(process.execPath,['C:/Users/KSG/Documents/ChatGPT/todo-app-lab/node_modules/@playwright/test/cli.js','test','--config',dir+'playwright.review.config.cjs'],{cwd:base,env:{...process.env,NODE_PATH:'C:/Users/KSG/Documents/ChatGPT/todo-app-lab/node_modules'},encoding:'utf8',windowsHide:true,timeout:60000,maxBuffer:4e6});
 writeFileSync(dir+'regression.txt',(test.stdout||'')+(test.stderr||''));r.regression={exit_code:test.status,error:test.error?.message||null,finished_at:clock()};assert.equal(test.status,0);
 r.conclusion='GAP_CONFIRMED';
}catch(e){r.error={message:e.message,stack:e.stack};process.exitCode=1}
finally{
 if(context)await context.close();if(browser)await browser.close();
 if(service){const stop=spawnSync('taskkill',['/PID',String(service.pid),'/T','/F'],{windowsHide:true,encoding:'utf8'});r.cleanup.stop_exit_code=stop.status;r.cleanup.stop_output=stop.stdout+stop.stderr;r.cleanup.stopped_at=clock()}
 r.cleanup.port_open_after=await portOpen();r.baseline_status_after=git('status','--porcelain=v1');r.baseline_diff_after=git('diff','--stat');r.finished_at=clock();
 writeFileSync(dir+'replay.json',JSON.stringify(r,null,2)+'\n');
 console.log(JSON.stringify(r,null,2));
}
