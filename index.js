const { Telegraf } = require('telegraf');
const axios = require('axios'); const fs = require('fs');
const http = require('http');
http.createServer((req, res) => { res.writeHead(200); res.end('Bot Online!'); }).listen(process.env.PORT || 3000)

const TOKEN = process.env.BOT_TOKEN
const bot = new Telegraf(TOKEN);
let db = { users:{}, game:{}, cooldown:{} };
try{ db = JSON.parse(fs.readFileSync('db.json')); }catch{}
const save = () => fs.writeFileSync('db.json', JSON.stringify(db));
const getUser = (id) => { if(!db.users[id]) db.users[id]={coin:100,exp:0,level:1,lastDaily:0,lastCmd:0}; return db.users[id]; };
bot.use(async (ctx, next) => {
  if(!ctx.from) return next();
  const user = getUser(String(ctx.from.id));
  const now = Date.now();
  if(now - user.lastCmd < 1500) return;
  user.lastCmd = now; user.exp+=1; save();
  return next();
});
bot.start((ctx) => ctx.reply(`Halo ${ctx.from.first_name}! 🤖\nBot Telegram Mewah Online!\nKetik /menu buat liat semua fitur`));
bot.command('menu', (ctx) => ctx.reply(`*🤖 BOT TELEGRAM V4 MEWAH*\n\n*INFO*\n/menu /ping /profile /speed\n\n*MAKER*\n/sticker - reply foto\n/toimg - reply stiker\n/smeme teks1|teks2\n/brat teks\n/qc teks\n\n*GAME & RPG*\n/rpg /daily /coin /adventure /slot /tebak /math /suit gunting /leaderboard\n\n*DOWNLOADER*\n/tiktok link\n/ig link\n/ytmp3 link\n/fb link\n\n*FUN & AI*\n/ai tanya apa aja\n/joke /quote /cek nama /gacha /cekjodoh nama /truth /dare\n\nGak perlu pairing, anti-spam ON ✅`, {parse_mode:'Markdown'}));
bot.command('ping', (ctx) => ctx.reply('Pong! Bot ONLINE ✅ Anti-Spam ON'));
bot.command('speed', (ctx) => ctx.reply('Speed: Cepet banget, server Telegram! ⚡'));
bot.command('profile', (ctx) => { const u=getUser(String(ctx.from.id)); ctx.reply(`*PROFILE*\nNama: ${ctx.from.first_name}\nCoin: ${u.coin}\nExp: ${u.exp} | Level: ${u.level}`, {parse_mode:'Markdown'}); });
bot.command('rpg', (ctx) => { const u=getUser(String(ctx.from.id)); ctx.reply(`Coin: ${u.coin} | Level: ${u.level} | /daily /adventure`); });
bot.command('daily', (ctx) => { const u=getUser(String(ctx.from.id)); const n=Date.now(); if(n-u.lastDaily<86400000) return ctx.reply('Daily udah diambil!'); u.lastDaily=n; u.coin+=100; save(); ctx.reply('Daily +100! Total: '+u.coin); });
bot.command('coin', (ctx) => { const u=getUser(String(ctx.from.id)); ctx.reply(`Coin lu: ${u.coin}`); });
bot.command('adventure', (ctx) => { const u=getUser(String(ctx.from.id)); const d=Math.floor(Math.random()*150)+30; u.coin+=d; save(); ctx.reply(`Petualangan dapet +${d} Coin!`); });
bot.command('slot', (ctx) => { const s=['🍒','🍋','⭐','💎']; const a=s[Math.floor(Math.random()*4)], b=s[Math.floor(Math.random()*4)], c=s[Math.floor(Math.random()*4)]; ctx.reply(`🎰 ${a} | ${b} | ${c}`); });
bot.command('tebak', (ctx) => { const soal=[{q:'Hewan apa yang paling setia?',a:'anjing'},{q:'Buah apa yang paling kaya?',a:'alpukat'},{q:'Apa yang naik tapi gak pernah turun?',a:'umur'}]; const p=soal[Math.floor(Math.random()*soal.length)]; db.game[ctx.chat.id]={answer:p.a}; save(); ctx.reply(`TEBAK: ${p.q}`); });
bot.command('math', (ctx) => { const a=Math.floor(Math.random()*20)+1, b=Math.floor(Math.random()*20)+1; db.game[ctx.chat.id]={answer:String(a+b)}; save(); ctx.reply(`MATH: ${a} + ${b} = ?`); });
bot.command('suit', (ctx) => { const p=['gunting','batu','kertas']; const b=p[Math.floor(Math.random()*3)]; ctx.reply(`Lu: ${ctx.message.text.split(' ')[1]||'?'} | Bot: ${b}`); });
bot.command('leaderboard', (ctx) => { let s=Object.entries(db.users).sort((a,b)=>b[1].coin-a[1].coin).slice(0,5); let t='*LEADERBOARD*\n'; s.forEach((u,i)=>t+=`${i+1}. ID ${u[0]} - ${u[1].coin}\n`); ctx.reply(t,{parse_mode:'Markdown'}); });
bot.command('sticker', async (ctx) => {
  const r = ctx.message.reply_to_message;
  if(!r || !r.photo) return ctx.reply('Reply foto + /sticker');
  try{ const link = await ctx.telegram.getFileLink(r.photo[r.photo.length-1].file_id); ctx.replyWithSticker({url: link.href}); }catch{ ctx.reply('Gagal bikin stiker'); }
});
bot.command('toimg', async (ctx) => {
  const r = ctx.message.reply_to_message;
  if(!r || !r.sticker) return ctx.reply('Reply stiker + /toimg');
  try{ const link = await ctx.telegram.getFileLink(r.sticker.file_id); ctx.replyWithPhoto({url: link.href}); }catch{ ctx.reply('Gagal'); }
});
bot.command('smeme', (ctx) => { const q=ctx.message.text.replace('/smeme ','').split('|'); ctx.replyWithPhoto({url:`https://api.memegen.link/images/drake/${encodeURIComponent(q[0]||' ')}/${encodeURIComponent(q[1]||' ')}.png`}); });
bot.command('brat', (ctx) => { const q=ctx.message.text.replace('/brat ',''); ctx.replyWithPhoto({url:`https://api.siputzx.my.id/api/canvas/brat?text=${encodeURIComponent(q)}`}); });
bot.command('qc', (ctx) => { const q=ctx.message.text.replace('/qc ',''); ctx.replyWithPhoto({url:`https://api.siputzx.my.id/api/canvas/qc?text=${encodeURIComponent(q||'Halo')}&name=${encodeURIComponent(ctx.from.first_name)}`}); });
bot.command('tiktok', async (ctx) => { const q=ctx.message.text.split(' ')[1]; if(!q) return ctx.reply('/tiktok link'); try{ const r=await axios.get(`https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(q)}`); ctx.replyWithVideo({url:r.data.data.play}); }catch{ ctx.reply('Link error'); } });
bot.command('ig', async (ctx) => { const q=ctx.message.text.split(' ')[1]; try{ const r=await axios.get(`https://api.siputzx.my.id/api/d/igdl?url=${encodeURIComponent(q)}`); ctx.replyWithVideo({url:r.data.data[0].url}); }catch{ ctx.reply('IG error'); } });
bot.command('ytmp3', async (ctx) => { const q=ctx.message.text.split(' ')[1]; try{ const r=await axios.get(`https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(q)}`); ctx.replyWithAudio({url:r.data.data.dl}); }catch{ ctx.reply('YT error'); } });
bot.command('fb', async (ctx) => { const q=ctx.message.text.split(' ')[1]; try{ const r=await axios.get(`https://api.siputzx.my.id/api/d/fbdl?url=${encodeURIComponent(q)}`); ctx.replyWithVideo({url:r.data.data[0].url}); }catch{ ctx.reply('FB error'); } });
bot.command('ai', async (ctx) => { const q=ctx.message.text.replace('/ai ',''); if(!q||q==='/ai') return ctx.reply('/ai halo'); try{ const r=await axios.get(`https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(q)}`); ctx.reply(r.data.data||'AI error'); }catch{ ctx.reply('AI tidur'); } });
bot.command('joke', (ctx) => ctx.reply('Kenapa ayam nyebrang? Mau ke seberang.'));
bot.command('quote', (ctx) => ctx.reply('Jangan menyerah, istirahat dulu baru gas lagi.'));
bot.command('cek', (ctx) => ctx.reply(`Khodam ${ctx.message.text.replace('/cek ','')||ctx.from.first_name}: Macan Putih`));
bot.command('gacha', (ctx) => ctx.reply(`Waifu lu: ${['Sakura','Hinata','Mikasa','Rem'][Math.floor(Math.random()*4)]}`));
bot.command('cekjodoh', (ctx) => ctx.reply(`Jodoh ${ctx.message.text.replace('/cekjodoh ','')}: ${Math.floor(Math.random()*101)}%`));
bot.command('truth', (ctx) => ctx.reply('Truth: Siapa mantan terakhir lu?'));
bot.command('dare', (ctx) => ctx.reply('Dare: Chat mantan lu "kangen"'));
bot.on('text', (ctx) => {
  const id = ctx.chat.id; const txt = ctx.message.text.toLowerCase();
  if(db.game[id] && !txt.startsWith('/')){ if(txt === db.game[id].answer.toLowerCase()){ const u=getUser(String(ctx.from.id)); u.coin+=50; delete db.game[id]; save(); ctx.reply('BENAR! +50 Coin'); } }
  if(txt==='halo'||txt==='p'||txt==='bot') ctx.reply(`Halo ${ctx.from.first_name}! Ketik /menu`);
});
bot.launch().then(()=>console.log('BOT TELEGRAM ONLINE! 🔥'));
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
                         
