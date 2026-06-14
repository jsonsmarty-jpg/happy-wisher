import { useState, useEffect, useRef } from "react";
import { api } from "./api.js";

const EVENTS = [
  { id:"birthday",  label:"Birthday",   emoji:"🎂", grad:"linear-gradient(135deg,#FF6B6B,#FF8E53)" },
  { id:"graduation",label:"Graduation", emoji:"🎓", grad:"linear-gradient(135deg,#4ECDC4,#44A8B3)" },
  { id:"newyear",   label:"New Year",   emoji:"🎆", grad:"linear-gradient(135deg,#FF9AA2,#E040FB)" },
  { id:"christmas", label:"Christmas",  emoji:"🎄", grad:"linear-gradient(135deg,#C0392B,#27AE60)" },
  { id:"easter",    label:"Easter",     emoji:"🐣", grad:"linear-gradient(135deg,#F9CA24,#A29BFE)" },
  { id:"eid",       label:"Eid",        emoji:"🌙", grad:"linear-gradient(135deg,#00B894,#6C5CE7)" },
];

const SONGS = {
  birthday: [
    { title:"Happy Birthday Song", artist:"Slowed Version", url:"https://res.cloudinary.com/dgrttojrj/video/upload/v1781442323/happybirday_song_slowed_.m4a" },
    { title:"Happy Birthday Vibe", artist:"Tone Mix", url:"https://res.cloudinary.com/dgrttojrj/video/upload/v1781442323/happybirthday_vibe_tone_q.m4a" },
    { title:"Happy Birthday Beat", artist:"Instrumental", url:"https://res.cloudinary.com/dgrttojrj/video/upload/v1781442323/happybirthday_beat_cdgron.mp3" },
  ],
  graduation: [
    { title:"He Said One Day", artist:"Suggested for Graduation", url:"https://res.cloudinary.com/dgrttojrj/video/upload/v1781442323/he_said_oneday_suggested_.mp3" },
    { title:"Dreamers", artist:"Graduation Special", url:"https://res.cloudinary.com/dgrttojrj/video/upload/v1781442323/dreamers_zesiqc.m4a" },
    { title:"Congratulations", artist:"Celebration", url:"https://res.cloudinary.com/dgrttojrj/video/upload/v1781442323/congratulations_d5kxum.mp3" },
  ],
  newyear: [
    { title:"Happy New Year Song", artist:"Celebration", url:"https://res.cloudinary.com/dgrttojrj/video/upload/v1781442323/happy_new_year_son.m4a" },
    { title:"Merry Christmas & Happy New Year", artist:"Slowed", url:"https://res.cloudinary.com/dgrttojrj/video/upload/v1781442323/marry_christmas_and_happ.mp3" },
    { title:"Merry Christmas & Happy New Year Beat", artist:"Instrumental", url:"https://res.cloudinary.com/dgrttojrj/video/upload/v1781442323/marry_christimas_and_hap.m4a" },
  ],
  christmas: [
    { title:"Christmas Bell Rings", artist:"Traditional", url:"https://res.cloudinary.com/dgrttojrj/video/upload/v1781442323/christmas_bell_rings_nvuasn.mp3" },
    { title:"Christmas Piano", artist:"Instrumental", url:"https://res.cloudinary.com/dgrttojrj/video/upload/v1781442323/christmas_piano_xhxakr.mp3" },
    { title:"Christmas Emotional Tone", artist:"Instrumental", url:"https://res.cloudinary.com/dgrttojrj/video/upload/v1781442323/christmass_emotional_tone.mp3" },
  ],
  easter: [
    { title:"Yeshua", artist:"Easter Special", url:"https://res.cloudinary.com/dgrttojrj/video/upload/v1781442323/YESHUA_suggested_for_ea.mp3" },
    { title:"Amazing Grace", artist:"Instrumental", url:"https://res.cloudinary.com/dgrttojrj/video/upload/v1781442323/YESHUA_suggested_for_ea.mp3" },
    { title:"Oceans", artist:"Hillsong", url:"https://res.cloudinary.com/dgrttojrj/video/upload/v1781442323/YESHUA_suggested_for_ea.mp3" },
  ],
  eid: [
    { title:"Eid Song", artist:"Celebration", url:"https://res.cloudinary.com/dgrttojrj/video/upload/v1781442323/eid_song_dqxcct.mp3" },
    { title:"Eid Song 2", artist:"Celebration", url:"https://res.cloudinary.com/dgrttojrj/video/upload/v1781442323/eid_song_2_kf5u05.mp3" },
    { title:"Eid Song 3", artist:"Celebration", url:"https://res.cloudinary.com/dgrttojrj/video/upload/v1781442323/eid_song_3_biogfo.mp3" },
  ],
};

const STEPS_SPECIAL = ["Welcome","Type","Details","Message","Event","Song","Gift","Done"];
const STEPS_RANDOM  = ["Welcome","Type","Details","Message","Event","Song","Done"];

function getEv(id){ return EVENTS.find(e=>e.id===id)||EVENTS[0]; }

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
:root{
  --gold:#B8860B;--gold2:#DAA520;--gold3:#8B6914;
  --bg:#FAF7F2;--surface:rgba(184,134,11,0.06);--surface2:rgba(184,134,11,0.1);
  --border:rgba(184,134,11,0.2);--border2:rgba(184,134,11,0.4);
  --text:#2C1810;--muted:#8B7355;--card:#FFFDF7;
}
body{font-family:'Outfit',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;min-height:100dvh;overflow-x:hidden;-webkit-font-smoothing:antialiased;}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--gold);border-radius:2px}
#star-canvas{position:fixed;inset:0;z-index:0;pointer-events:none}
.grain{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.018;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:150px}
.app{position:relative;z-index:2;min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:0 12px 60px;width:100%;}
.topbar{width:100%;max-width:600px;display:flex;align-items:center;justify-content:center;padding:24px 0 12px;animation:fadeDown .7s both;}
.logo-text{font-family:'Cormorant Garamond',serif;font-size:clamp(1.3rem,5vw,1.7rem);font-weight:700;background:linear-gradient(90deg,var(--gold3),var(--gold2),var(--gold3));background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite;letter-spacing:.02em;}
@keyframes shimmer{0%{background-position:0%}100%{background-position:200%}}
.card{width:100%;max-width:600px;background:var(--card);border:1px solid var(--border);border-radius:24px;box-shadow:0 0 0 1px rgba(184,134,11,.05),0 20px 60px rgba(184,134,11,.1),inset 0 1px 0 rgba(255,255,255,.9);overflow:hidden;position:relative;}
.card::before{content:'';position:absolute;top:0;left:10%;right:10%;height:2px;background:linear-gradient(90deg,transparent,var(--gold2),var(--gold),var(--gold2),transparent);animation:glowLine 3s ease-in-out infinite alternate;opacity:.6;}
@keyframes glowLine{0%{opacity:.3;left:20%;right:20%}100%{opacity:.8;left:5%;right:5%}}
.card-body{padding:clamp(20px,5vw,40px) clamp(16px,5vw,36px)}
.progress-wrap{padding:16px clamp(16px,5vw,36px);background:rgba(255,253,247,.95);border-bottom:1px solid var(--border);}
.progress-label{display:flex;align-items:center;justify-content:space-between;font-size:.72rem;font-weight:600;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;}
.progress-label span{color:var(--gold3)}
.progress-track{height:3px;background:rgba(184,134,11,.12);border-radius:2px;overflow:hidden}
.progress-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--gold3),var(--gold2),var(--gold));transition:width .6s cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden;}
.progress-fill::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent);animation:pShine 1.5s linear infinite;}
@keyframes pShine{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
.step-enter{animation:stepIn .45s cubic-bezier(.4,0,.2,1) both}
@keyframes stepIn{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
.step-title{font-family:'Cormorant Garamond',serif;font-size:clamp(1.4rem,5vw,2.1rem);font-weight:700;line-height:1.2;margin-bottom:6px;color:var(--text);}
.step-sub{font-size:clamp(.8rem,3vw,.88rem);color:var(--muted);line-height:1.6;margin-bottom:22px}
.btn{font-family:'Outfit',sans-serif;font-size:clamp(.82rem,3vw,.9rem);font-weight:600;padding:clamp(10px,3vw,12px) clamp(18px,4vw,26px);border-radius:50px;border:none;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:all .25s cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden;white-space:nowrap;min-height:44px;-webkit-tap-highlight-color:transparent;}
.btn-gold{background:linear-gradient(135deg,var(--gold3),var(--gold2),var(--gold));color:#fff;box-shadow:0 4px 20px rgba(184,134,11,.3),inset 0 1px 0 rgba(255,255,255,.2);}
.btn-gold:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(184,134,11,.45)}
.btn-gold:active{transform:translateY(0)}
.btn-ghost{background:rgba(184,134,11,.06);color:var(--muted);border:1px solid var(--border);}
.btn-ghost:hover{background:rgba(184,134,11,.12);color:var(--text);border-color:var(--border2)}
.btn-block{width:100%;justify-content:center}
.btn-lg{padding:clamp(12px,3vw,15px) clamp(24px,5vw,32px);font-size:clamp(.9rem,3vw,1rem)}
.btn-sm{padding:8px 14px;font-size:.78rem;min-height:36px}
.btn:disabled{opacity:.35;cursor:not-allowed;transform:none!important;box-shadow:none!important}
.ripple{position:absolute;border-radius:50%;background:rgba(255,255,255,.4);transform:scale(0);animation:ripOut .6s linear;pointer-events:none}
@keyframes ripOut{to{transform:scale(4);opacity:0}}
.form-group{margin-bottom:16px}
.form-label{display:block;font-size:.72rem;font-weight:600;color:var(--gold3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:7px;}
.form-input,.form-textarea{width:100%;padding:clamp(11px,3vw,14px) clamp(14px,4vw,18px);border:1.5px solid var(--border);border-radius:14px;background:#FFFEF9;font-family:'Outfit',sans-serif;font-size:clamp(.88rem,3vw,.95rem);color:var(--text);outline:none;transition:border-color .2s,box-shadow .2s,background .2s;-webkit-appearance:none;}
.form-input:focus,.form-textarea:focus{border-color:var(--gold2);background:#FFFDF5;box-shadow:0 0 0 3px rgba(184,134,11,.12);}
.form-input::placeholder,.form-textarea::placeholder{color:#C4A882}
.form-textarea{resize:vertical;min-height:110px;line-height:1.7}
.char-count{text-align:right;font-size:.7rem;color:var(--muted);margin-top:4px}
.type-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}
.type-card{border:1.5px solid var(--border);border-radius:18px;padding:clamp(16px,4vw,24px) clamp(12px,3vw,16px);text-align:center;cursor:pointer;background:#FFFEF9;transition:all .3s cubic-bezier(.4,0,.2,1);position:relative;overflow:hidden;-webkit-tap-highlight-color:transparent;}
.type-card::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% 0%,rgba(184,134,11,.1),transparent 70%);opacity:0;transition:opacity .3s;}
.type-card:hover::before,.type-card.active::before{opacity:1}
.type-card:hover{border-color:var(--border2);transform:translateY(-2px);box-shadow:0 8px 24px rgba(184,134,11,.12)}
.type-card.active{border-color:var(--gold2);background:rgba(184,134,11,.06);box-shadow:0 0 0 1px var(--gold2),0 8px 30px rgba(184,134,11,.15)}
.type-card-emoji{font-size:clamp(1.8rem,6vw,2.4rem);margin-bottom:10px;display:block;transition:transform .25s}
.type-card:hover .type-card-emoji,.type-card.active .type-card-emoji{transform:scale(1.15) rotate(-5deg)}
.type-card-name{font-weight:700;font-size:clamp(.85rem,3vw,.98rem);color:var(--text);margin-bottom:5px}
.type-card-desc{font-size:clamp(.7rem,2.5vw,.78rem);color:var(--muted);line-height:1.5}
.event-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.event-chip{border:1.5px solid var(--border);border-radius:14px;padding:clamp(10px,3vw,14px) 6px;text-align:center;cursor:pointer;background:#FFFEF9;transition:all .25s cubic-bezier(.4,0,.2,1);-webkit-tap-highlight-color:transparent;}
.event-chip:hover{border-color:var(--border2);transform:scale(1.04) translateY(-1px);background:rgba(184,134,11,.06)}
.event-chip.active{border-color:var(--gold2);background:rgba(184,134,11,.1);box-shadow:0 0 16px rgba(184,134,11,.15);transform:scale(1.06) translateY(-2px);}
.event-emoji{font-size:clamp(1.3rem,4vw,1.6rem);display:block;margin-bottom:4px;transition:transform .2s}
.event-chip:hover .event-emoji,.event-chip.active .event-emoji{transform:rotate(-8deg) scale(1.1)}
.event-label{font-size:clamp(.65rem,2vw,.72rem);font-weight:600;color:var(--muted)}
.event-chip.active .event-label{color:var(--gold3)}
.song-list{display:flex;flex-direction:column;gap:8px}
.song-row{display:flex;align-items:center;gap:10px;border:1.5px solid var(--border);border-radius:12px;padding:clamp(10px,3vw,13px) clamp(10px,3vw,14px);cursor:pointer;background:#FFFEF9;transition:all .25s cubic-bezier(.4,0,.2,1);-webkit-tap-highlight-color:transparent;}
.song-row:hover{border-color:var(--border2);background:rgba(184,134,11,.05);transform:translateX(3px)}
.song-row.active{border-color:var(--gold2);background:rgba(184,134,11,.08);transform:translateX(5px);box-shadow:0 0 16px rgba(184,134,11,.1)}
.song-info{flex:1;min-width:0}
.song-title{font-weight:600;font-size:clamp(.8rem,3vw,.88rem);color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.song-artist{font-size:clamp(.68rem,2vw,.75rem);color:var(--muted)}
.song-tick{color:var(--gold2);font-size:.95rem;flex-shrink:0}
.song-yt{font-size:.68rem;color:var(--gold3);text-decoration:none;display:flex;align-items:center;gap:3px;flex-shrink:0;background:rgba(184,134,11,.1);padding:3px 7px;border-radius:20px;border:1px solid var(--border);}
.song-yt:hover{background:rgba(184,134,11,.2)}
.gift-zone{border:2px dashed var(--border);border-radius:18px;padding:clamp(20px,5vw,28px);text-align:center;cursor:pointer;background:rgba(184,134,11,.03);transition:all .3s cubic-bezier(.4,0,.2,1);-webkit-tap-highlight-color:transparent;}
.gift-zone:hover{border-color:var(--border2);transform:scale(1.01);background:rgba(184,134,11,.06)}
.gift-zone.has-gift{border-style:solid;border-color:var(--gold2);background:rgba(184,134,11,.06)}
.gift-big-emoji{font-size:clamp(2.4rem,8vw,3.2rem);display:block;margin-bottom:10px;animation:giftBounce 2s ease-in-out infinite}
@keyframes giftBounce{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-8px) rotate(3deg)}}
.gift-zone:hover .gift-big-emoji{animation:none;transform:scale(1.15) rotate(-5deg)}
.gift-zone-title{font-weight:700;font-size:clamp(.88rem,3vw,.95rem);color:var(--text);margin-bottom:5px}
.gift-zone-sub{font-size:clamp(.73rem,2.5vw,.8rem);color:var(--muted)}
.upload-zone{border:1.5px dashed var(--border);border-radius:12px;padding:clamp(16px,4vw,20px);text-align:center;cursor:pointer;transition:all .25s;}
.upload-zone:hover{border-color:var(--gold2);background:rgba(184,134,11,.04)}
.upload-icon{font-size:1.6rem;margin-bottom:6px}.upload-label{font-size:clamp(.78rem,3vw,.85rem);color:var(--muted)}
.code-wrap{background:linear-gradient(160deg,#2C1810,#3D2314);border:1px solid rgba(184,134,11,.4);border-radius:18px;padding:clamp(20px,5vw,32px);text-align:center;position:relative;overflow:hidden;margin:8px 0 20px;}
.code-wrap::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% 0%,rgba(184,134,11,.2),transparent 60%)}
.code-label{font-size:.7rem;color:rgba(255,253,247,.5);letter-spacing:.15em;text-transform:uppercase;margin-bottom:8px;position:relative}
.code-val{font-family:'Cormorant Garamond',serif;font-size:clamp(1.4rem,6vw,2.4rem);font-weight:700;letter-spacing:.15em;background:linear-gradient(90deg,#DAA520,#F5DEB3,#DAA520,#F5DEB3,#DAA520);background-size:300%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:cShimmer 2.5s linear infinite;position:relative;word-break:break-all;}
@keyframes cShimmer{0%{background-position:0%}100%{background-position:300%}}
.code-sub{font-size:clamp(.72rem,2.5vw,.8rem);color:rgba(255,253,247,.45);margin-top:8px;position:relative}
.share-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.share-btn{border:none;border-radius:12px;padding:clamp(10px,3vw,14px) 6px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:5px;font-family:'Outfit',sans-serif;font-size:clamp(.7rem,2.5vw,.78rem);font-weight:600;transition:all .25s cubic-bezier(.4,0,.2,1);min-height:64px;-webkit-tap-highlight-color:transparent;}
.share-btn:hover{transform:translateY(-3px)}.share-btn:active{transform:translateY(0)}
.share-icon{font-size:clamp(1.2rem,4vw,1.5rem)}
.sh-wa{background:linear-gradient(135deg,#128C7E,#25D366);color:#fff}
.sh-fb{background:linear-gradient(135deg,#0056D6,#1877F2);color:#fff}
.sh-cp{background:rgba(184,134,11,.1);color:var(--gold3);border:1.5px solid var(--border2)}
.sh-wa:hover{box-shadow:0 6px 20px rgba(37,211,102,.3)}
.sh-fb:hover{box-shadow:0 6px 20px rgba(24,119,242,.3)}
.sh-cp:hover{box-shadow:0 6px 20px rgba(184,134,11,.2)}
.done-emoji{font-size:clamp(2.8rem,8vw,4rem);display:block;margin-bottom:12px;animation:celebrate .6s cubic-bezier(.4,0,.2,1)}
@keyframes celebrate{0%{transform:scale(0) rotate(-20deg)}60%{transform:scale(1.2) rotate(5deg)}100%{transform:scale(1) rotate(0)}}
.done-type-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(184,134,11,.1);border:1px solid var(--border2);border-radius:50px;padding:5px 14px;font-size:.75rem;font-weight:600;color:var(--gold3);margin-bottom:14px;}
.nav-row{display:flex;gap:10px;margin-top:10px}
.nav-row .btn-ghost{min-width:80px;flex-shrink:0}
.confetti-layer{position:fixed;inset:0;pointer-events:none;z-index:100;overflow:hidden}
.cf{position:absolute;top:-40px;font-size:1.4rem;animation:cfFall linear forwards}
@keyframes cfFall{to{transform:translateY(110vh) rotate(720deg);opacity:0}}
.toast{position:fixed;bottom:clamp(16px,4vw,28px);left:50%;transform:translateX(-50%);background:#2C1810;color:#FAF7F2;border:1px solid rgba(184,134,11,.4);padding:11px clamp(16px,4vw,24px);border-radius:50px;font-size:clamp(.78rem,3vw,.87rem);font-weight:500;box-shadow:0 8px 24px rgba(0,0,0,.2);z-index:999;display:flex;align-items:center;gap:8px;animation:toastUp .35s cubic-bezier(.4,0,.2,1);white-space:nowrap;max-width:90vw;}
.toast.error{border-color:rgba(255,80,80,.4);color:#ff6b6b}
@keyframes toastUp{from{transform:translateX(-50%) translateY(16px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
.orb{position:fixed;border-radius:50%;filter:blur(80px);pointer-events:none;z-index:0;animation:orbFloat ease-in-out infinite alternate}
.orb1{width:min(400px,80vw);height:min(400px,80vw);background:rgba(184,134,11,.08);top:-100px;right:-80px;animation-duration:8s}
.orb2{width:min(300px,60vw);height:min(300px,60vw);background:rgba(210,180,140,.06);bottom:100px;left:-100px;animation-duration:11s}
.orb3{width:min(250px,50vw);height:min(250px,50vw);background:rgba(255,218,185,.05);bottom:-80px;right:20%;animation-duration:9s}
@keyframes orbFloat{0%{transform:translate(0,0) scale(1)}100%{transform:translate(20px,30px) scale(1.08)}}
.welcome-center{text-align:center;padding:8px 0}
.welcome-title{font-family:'Cormorant Garamond',serif;font-size:clamp(1.8rem,8vw,3rem);font-weight:700;color:var(--text);margin-bottom:10px;line-height:1.15;}
.welcome-sub{font-size:clamp(.82rem,3vw,.95rem);color:var(--muted);line-height:1.7;max-width:300px;margin:0 auto 24px;}
.welcome-sparkles{display:flex;justify-content:center;gap:clamp(12px,4vw,20px);margin-bottom:24px;font-size:clamp(1.2rem,4vw,1.5rem)}
.ws{animation:wsSpin 4s ease-in-out infinite}
.ws:nth-child(1){animation-delay:0s}.ws:nth-child(2){animation-delay:.3s}.ws:nth-child(3){animation-delay:.6s}.ws:nth-child(4){animation-delay:.9s}
@keyframes wsSpin{0%,100%{transform:scale(1) rotate(0deg)}50%{transform:scale(1.3) rotate(15deg)}}
.wish-preview{background:linear-gradient(160deg,#FFFDF7,#FFF9EE);border:1.5px solid var(--border2);border-radius:18px;overflow:hidden;margin-bottom:16px;}
.wp-banner{padding:clamp(18px,4vw,28px);text-align:center;position:relative;overflow:hidden}
.wp-banner::before{content:'';position:absolute;inset:0;background:var(--ev-grad,linear-gradient(135deg,#FF6B6B,#FF8E53));opacity:.12}
.wp-emoji{font-size:clamp(2rem,6vw,3rem);display:block;margin-bottom:5px;position:relative}
.wp-event{font-size:.72rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--gold3);position:relative}
.wp-body{padding:clamp(16px,4vw,24px)}
.wp-to{font-size:.75rem;color:var(--muted);margin-bottom:2px}
.wp-name{font-family:'Cormorant Garamond',serif;font-size:clamp(1.3rem,5vw,1.7rem);font-weight:700;color:var(--text);margin-bottom:12px}
.wp-msg{font-size:clamp(.82rem,3vw,.92rem);line-height:1.75;color:#5C4033;border-left:2px solid var(--gold2);padding-left:12px;font-style:italic;margin-bottom:14px}
.wp-from{font-size:.82rem;color:var(--muted);font-weight:500}
.gm-overlay{position:fixed;inset:0;z-index:300;background:rgba(44,24,16,.6);backdrop-filter:blur(8px);display:flex;align-items:flex-end;justify-content:center;padding:0;animation:fadeIn .25s ease;}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.gm-card{background:#FFFDF7;border:1.5px solid var(--border2);border-radius:24px 24px 0 0;padding:clamp(20px,5vw,32px) clamp(16px,5vw,32px);padding-bottom:max(clamp(20px,5vw,32px),env(safe-area-inset-bottom));width:100%;max-width:600px;max-height:92vh;overflow-y:auto;animation:slideUp .35s cubic-bezier(.4,0,.2,1);box-shadow:0 -20px 60px rgba(44,24,16,.15);}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.gift-open-overlay{position:fixed;inset:0;z-index:400;background:rgba(44,24,16,.97);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:clamp(16px,5vw,24px);animation:fadeIn .3s ease;}
.gift-box-big{font-size:clamp(4rem,15vw,6rem);cursor:pointer;animation:giftPulse 1.5s ease-in-out infinite;display:block;filter:drop-shadow(0 0 30px rgba(184,134,11,.5));-webkit-tap-highlight-color:transparent;}
@keyframes giftPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
.gift-box-big:hover,.gift-box-big:active{transform:scale(1.1) rotate(-5deg)}
.gift-tap-hint{font-size:clamp(.78rem,3vw,.85rem);color:rgba(255,253,247,.5);margin-top:14px;animation:blink 1.5s ease-in-out infinite}
@keyframes blink{0%,100%{opacity:.4}50%{opacity:1}}
.spinner{width:18px;height:18px;border:2px solid rgba(184,134,11,.2);border-top-color:var(--gold2);border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0}
@keyframes spin{to{transform:rotate(360deg)}}
.anim-delay-1{animation-delay:.05s}.anim-delay-2{animation-delay:.1s}.anim-delay-3{animation-delay:.15s}.anim-delay-4{animation-delay:.2s}
@keyframes fadeDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
.viewer-page{width:100%;max-width:600px;animation:stepIn .6s cubic-bezier(.4,0,.2,1)}
.viewer-banner{border-radius:20px 20px 0 0;padding:clamp(28px,6vw,48px) clamp(16px,5vw,32px);text-align:center;position:relative;overflow:hidden;}
.viewer-banner::before{content:'';position:absolute;inset:0;background:var(--ev-grad);opacity:.18}
.viewer-banner-emoji{font-size:clamp(3rem,10vw,5rem);display:block;margin-bottom:8px;position:relative;animation:floatEmoji 3s ease-in-out infinite;}
@keyframes floatEmoji{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-10px) scale(1.05)}}
.viewer-banner-event{font-size:.78rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--gold3);position:relative;margin-bottom:4px}
.viewer-card{background:var(--card);border:1.5px solid var(--border2);border-radius:0 0 20px 20px;padding:clamp(20px,5vw,36px);margin-bottom:16px;box-shadow:0 20px 60px rgba(184,134,11,.1);}
.viewer-to{font-size:.78rem;color:var(--muted);margin-bottom:4px}
.viewer-name{font-family:'Cormorant Garamond',serif;font-size:clamp(1.8rem,6vw,2.6rem);font-weight:700;color:var(--text);margin-bottom:16px;animation:nameEntrance 1s cubic-bezier(.4,0,.2,1) .3s both;text-shadow:0 2px 12px rgba(184,134,11,.2);letter-spacing:.02em;border-bottom:2px solid var(--gold2);padding-bottom:10px;}
@keyframes nameEntrance{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.viewer-msg{font-size:clamp(.88rem,3vw,1rem);line-height:1.85;color:#5C4033;border-left:3px solid var(--gold2);padding-left:16px;font-style:italic;margin-bottom:18px;animation:msgEntrance 1s cubic-bezier(.4,0,.2,1) .5s both;}
@keyframes msgEntrance{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
.viewer-from{font-size:.88rem;color:var(--muted);font-weight:600;margin-bottom:16px}
.viewer-song{display:flex;align-items:center;gap:10px;padding:12px 16px;background:rgba(184,134,11,.07);border-radius:14px;margin-bottom:16px;border:1px solid var(--border);}
.viewer-gift-btn{width:100%;padding:16px;border-radius:16px;border:2px solid var(--gold2);background:rgba(184,134,11,.06);cursor:pointer;font-family:'Outfit',sans-serif;font-weight:700;font-size:clamp(.9rem,3vw,1rem);color:var(--gold3);display:flex;align-items:center;justify-content:center;gap:10px;transition:all .3s;-webkit-tap-highlight-color:transparent;animation:giftPulseBtn 2s ease-in-out infinite;}
@keyframes giftPulseBtn{0%,100%{box-shadow:0 0 0 0 rgba(184,134,11,.3)}50%{box-shadow:0 0 0 8px rgba(184,134,11,0)}}
.viewer-gift-btn:hover{background:rgba(184,134,11,.12);transform:scale(1.02)}
.viewer-gift-btn-emoji{font-size:1.8rem;animation:giftBounce 2s ease-in-out infinite}
.viewer-code{background:linear-gradient(160deg,#2C1810,#3D2314);border-radius:16px;padding:16px 20px;text-align:center;margin-bottom:16px;}
.viewer-code-label{font-size:.68rem;color:rgba(255,253,247,.45);letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px}
.viewer-code-val{font-family:'Cormorant Garamond',serif;font-size:clamp(1.1rem,4vw,1.4rem);font-weight:700;letter-spacing:.15em;background:linear-gradient(90deg,#DAA520,#F5DEB3,#DAA520);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:cShimmer 2.5s linear infinite;}
.viewer-loading{text-align:center;padding:60px 20px}
.viewer-not-found{text-align:center;padding:40px 20px}
.pin-overlay{position:fixed;inset:0;z-index:500;background:rgba(44,24,16,.95);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .3s ease;}
.pin-card{background:#FFFDF7;border:1.5px solid var(--border2);border-radius:24px;padding:36px 28px;width:100%;max-width:360px;text-align:center;animation:stepIn .4s cubic-bezier(.4,0,.2,1);}
.pin-input{width:100%;text-align:center;font-size:1.8rem;letter-spacing:.5em;padding:14px;border:1.5px solid var(--border);border-radius:14px;background:#FFFEF9;color:var(--text);outline:none;font-family:'Cormorant Garamond',serif;}
.pin-input:focus{border-color:var(--gold2);box-shadow:0 0 0 3px rgba(184,134,11,.12);}
.reaction-bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;}
.reaction-btn{background:rgba(184,134,11,.06);border:1.5px solid var(--border);border-radius:50px;padding:8px 14px;cursor:pointer;font-size:1.1rem;transition:all .2s;display:flex;align-items:center;gap:5px;-webkit-tap-highlight-color:transparent;}
.reaction-btn:hover{background:rgba(184,134,11,.14);border-color:var(--border2);transform:scale(1.08)}
.reaction-btn.reacted{border-color:var(--gold2);background:rgba(184,134,11,.12);}
.reaction-count{font-size:.75rem;font-weight:600;color:var(--gold3)}
.reply-section{margin-top:16px}
.reply-item{background:rgba(184,134,11,.04);border:1px solid var(--border);border-radius:12px;padding:12px 14px;margin-bottom:8px;}
.reply-name{font-weight:700;font-size:.85rem;color:var(--gold3);margin-bottom:3px;display:flex;align-items:center;gap:6px;}
.reply-msg{font-size:.85rem;color:var(--text);line-height:1.5}
@supports(padding:max(0px)){.app{padding-bottom:max(60px,env(safe-area-inset-bottom));}}
`;

function StarCanvas(){
  const ref=useRef();
  useEffect(()=>{
    const canvas=ref.current;if(!canvas)return;
    const ctx=canvas.getContext("2d");let raf;
    const stars=[];const resize=()=>{canvas.width=window.innerWidth;canvas.height=window.innerHeight;};
    resize();window.addEventListener("resize",resize);
    for(let i=0;i<100;i++)stars.push({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,r:Math.random()*1.1+.2,speed:Math.random()*.003+.001,phase:Math.random()*Math.PI*2});
    const draw=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);const t=Date.now()/1000;stars.forEach(s=>{const a=.05+.15*Math.abs(Math.sin(t*s.speed*60+s.phase));ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(184,134,11,${a})`;ctx.fill();});raf=requestAnimationFrame(draw);};draw();
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={ref} id="star-canvas"/>;
}

function Confetti({active}){
  const[pieces,setPieces]=useState([]);
  useEffect(()=>{
    if(!active)return;
    const emojis=["🎉","✨","🌟","🎊","⭐","🎈","🌸","💫","🎁","🪄"];
    const p=Array.from({length:24},(_,i)=>({id:i,emoji:emojis[i%emojis.length],left:`${Math.random()*100}%`,dur:`${1.5+Math.random()*1.5}s`,delay:`${Math.random()*.8}s`}));
    setPieces(p);const t=setTimeout(()=>setPieces([]),4000);return()=>clearTimeout(t);
  },[active]);
  if(!pieces.length)return null;
  return <div className="confetti-layer">{pieces.map(p=><span key={p.id} className="cf" style={{left:p.left,animationDuration:p.dur,animationDelay:p.delay}}>{p.emoji}</span>)}</div>;
}

function Toast({msg,type="success",onDone}){
  useEffect(()=>{const t=setTimeout(onDone,3200);return()=>clearTimeout(t);},[]);
  return <div className={`toast ${type==="error"?"error":""}`}>{type==="error"?"✕ ":"✓ "}{msg}</div>;
}

function Btn({children,className="",onClick,disabled,style}){
  const ref=useRef();
  function handle(e){
    if(disabled)return;
    const btn=ref.current;const rect=btn.getBoundingClientRect();
    const r=document.createElement("span");const d=Math.max(rect.width,rect.height);
    r.className="ripple";r.style.cssText=`width:${d}px;height:${d}px;left:${e.clientX-rect.left-d/2}px;top:${e.clientY-rect.top-d/2}px`;
    btn.appendChild(r);setTimeout(()=>r.remove(),700);onClick&&onClick(e);
  }
  return <button ref={ref} className={`btn ${className}`} onClick={handle} disabled={disabled} style={style}>{children}</button>;
}

function GiftModal({onClose,onSave,initial}){
  const[giftMsg,setGiftMsg]=useState(initial?.giftMsg||"");
  const[file,setFile]=useState(null);
  const[preview,setPreview]=useState(initial?.preview||null);
  const[fileType,setFileType]=useState(initial?.fileType||null);
  const fileRef=useRef();
  function handleFile(e){
    const f=e.target.files[0];if(!f)return;
    setFile(f);setPreview(URL.createObjectURL(f));
    setFileType(f.type.startsWith("video/")?"video":f.type.startsWith("audio/")?"audio":"image");
  }
  return(
    <div className="gm-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="gm-card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.4rem",fontWeight:700,color:"var(--text)"}}>🎁 Create a Gift</div>
            <div style={{fontSize:".8rem",color:"var(--muted)",marginTop:3}}>Add a surprise inside your wish</div>
          </div>
          <button style={{background:"rgba(184,134,11,.08)",border:"1px solid var(--border)",width:36,height:36,borderRadius:"50%",cursor:"pointer",color:"var(--muted)",fontSize:"1rem",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}} onClick={onClose}>✕</button>
        </div>
        <div className="form-group">
          <label className="form-label">Gift Message</label>
          <textarea className="form-textarea" placeholder="Write something special…" value={giftMsg} onChange={e=>setGiftMsg(e.target.value)} maxLength={300}/>
          <div className="char-count">{giftMsg.length}/300</div>
        </div>
        <div className="form-group">
          <label className="form-label">Attach Photo, Video or Audio</label>
          <div className="upload-zone" onClick={()=>fileRef.current.click()}>
            <input ref={fileRef} type="file" accept="image/*,video/*,audio/*" style={{display:"none"}} onChange={handleFile}/>
            <div className="upload-icon">📎</div>
            <div className="upload-label">{preview?"Change file":"Click to upload"}</div>
            <div style={{fontSize:".7rem",color:"var(--muted)",marginTop:4}}>Photo, video or audio file</div>
          </div>
          {preview&&fileType==="image"&&<img src={preview} alt="preview" style={{width:"100%",borderRadius:12,maxHeight:160,objectFit:"cover",marginTop:10}}/>}
          {preview&&fileType==="video"&&<video src={preview} controls style={{width:"100%",borderRadius:12,marginTop:10}}/>}
          {preview&&fileType==="audio"&&<audio src={preview} controls style={{width:"100%",marginTop:10}}/>}
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn className="btn-ghost btn-block" onClick={onClose}>Cancel</Btn>
          <Btn className="btn-gold btn-block" onClick={()=>{onSave({giftMsg,file,preview,fileType});onClose();}} disabled={!giftMsg.trim()&&!file}>Save Gift 🎁</Btn>
        </div>
      </div>
    </div>
  );
}

function GiftOpenViewer({gift,onClose}){
  const[opened,setOpened]=useState(false);
  const mediaUrl=gift.mediaUrl||gift.preview;
  const fType=gift.mediaType||gift.fileType;
  const audioUrl=gift.audioUrl||((fType==="audio"&&mediaUrl)?mediaUrl:null);
  return(
    <div className="gift-open-overlay">
      {!opened?(
        <div style={{textAlign:"center"}}>
          <span className="gift-box-big" onClick={()=>setOpened(true)}>🎁</span>
          <div className="gift-tap-hint">Tap the gift to open ✨</div>
        </div>
      ):(
        <div style={{textAlign:"center",maxWidth:"min(420px,90vw)",animation:"stepIn .5s cubic-bezier(.4,0,.2,1)"}}>
          <div style={{fontSize:"2.8rem",marginBottom:10}}>🎀</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(1.2rem,5vw,1.5rem)",marginBottom:14,color:"#DAA520"}}>Your Gift Is Here!</div>
          {(gift.giftMsg||gift.message)&&<div style={{fontStyle:"italic",fontSize:"clamp(.82rem,3vw,.95rem)",color:"rgba(255,253,247,.75)",lineHeight:1.7,marginBottom:14,borderLeft:"2px solid #DAA520",paddingLeft:12}}>"{gift.giftMsg||gift.message}"</div>}
          {mediaUrl&&fType==="image"&&<img src={mediaUrl} alt="gift" style={{width:"100%",borderRadius:14,marginBottom:14}}/>}
          {mediaUrl&&fType==="video"&&<video src={mediaUrl} controls style={{width:"100%",borderRadius:14,marginBottom:14}}/>}
          {audioUrl&&<audio src={audioUrl} controls style={{width:"100%",marginBottom:14}}/>}
        </div>
      )}
      <Btn className="btn-ghost" style={{marginTop:20,minWidth:110,background:"rgba(255,253,247,.1)",color:"rgba(255,253,247,.7)",border:"1px solid rgba(255,253,247,.2)"}} onClick={onClose}>Close</Btn>
    </div>
  );
}

// ── WISH VIEWER ───────────────────────────────────────────────────────────────
function WishViewer({code,onBack}){
  const[wish,setWish]=useState(null);
  const[loading,setLoading]=useState(true);
  const[notFound,setNotFound]=useState(false);
  const[expired,setExpired]=useState(false);
  const[hasPIN,setHasPIN]=useState(false);
  const[pinVal,setPinVal]=useState("");
  const[pinError,setPinError]=useState("");
  const[pinLoading,setPinLoading]=useState(false);
  const[giftOpen,setGiftOpen]=useState(false);
  const[confetti,setConfetti]=useState(false);
  const[reactions,setReactions]=useState([]);
  const[replies,setReplies]=useState([]);
  const[replyName,setReplyName]=useState("");
  const[replyMsg,setReplyMsg]=useState("");
  const[showReply,setShowReply]=useState(false);
  const[replyLoading,setReplyLoading]=useState(false);
  const viewerAudioRef = useRef(new Audio());
  const[songPlaying,setSongPlaying]=useState(false);

  useEffect(()=>{
    return ()=>{
      viewerAudioRef.current.pause();
    };
  },[]);
    setLoading(true);
    api.getWish(code)
      .then(({wish,hasPIN})=>{
        if(hasPIN){setHasPIN(true);setLoading(false);return;}
        setWish(wish);
        setReactions(wish.reactions||[]);
        setReplies(wish.replies||[]);
        setLoading(false);
        setTimeout(()=>setConfetti(true),600);
      })
      .catch(err=>{
        if(err.message?.includes("expired")) setExpired(true);
        else setNotFound(true);
        setLoading(false);
      });
  },[code]);

  async function handleVerifyPin(){
    setPinLoading(true);setPinError("");
    try{
      const{wish}=await api.verifyPin(code,pinVal);
      setWish(wish);setReactions(wish.reactions||[]);setReplies(wish.replies||[]);
      setHasPIN(false);setTimeout(()=>setConfetti(true),600);
    }catch(err){
      setPinError(err.message||"Wrong PIN");
    }finally{setPinLoading(false);}
  }

  async function handleReact(emoji){
    try{
      await api.reactToWish(code,emoji);
      setReactions(prev=>[...prev,{emoji,id:Date.now()}]);
    }catch{}
  }

  async function handleReply(){
    if(!replyName.trim()||!replyMsg.trim())return;
    setReplyLoading(true);
    try{
      const{reply}=await api.replyToWish(code,replyName,replyMsg);
      setReplies(prev=>[...prev,reply]);
      setReplyName("");setReplyMsg("");setShowReply(false);
    }catch{}finally{setReplyLoading(false);}
  }

  const ev=wish?getEv(wish.event):null;

  // Count reactions by emoji
  const reactionCounts={};
  reactions.forEach(r=>{reactionCounts[r.emoji]=(reactionCounts[r.emoji]||0)+1;});

  if(loading)return(
    <div className="viewer-page">
      <div className="viewer-loading">
        <div style={{fontSize:"2.5rem",marginBottom:16,animation:"floatEmoji 2s ease-in-out infinite"}}>✨</div>
        <div style={{color:"var(--muted)",fontSize:".9rem"}}>Opening your wish…</div>
        <div className="spinner" style={{margin:"16px auto 0"}}/>
      </div>
    </div>
  );

  if(hasPIN)return(
    <div className="viewer-page">
      <div className="pin-overlay">
        <div className="pin-card">
          <div style={{fontSize:"2.5rem",marginBottom:12}}>🔒</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.5rem",fontWeight:700,marginBottom:6,color:"var(--text)"}}>This wish is protected</div>
          <div style={{fontSize:".85rem",color:"var(--muted)",marginBottom:20}}>Enter the 4-digit PIN to open it</div>
          <input className="pin-input" type="number" maxLength={4} placeholder="0000" value={pinVal} onChange={e=>setPinVal(e.target.value.slice(0,4))} onKeyDown={e=>e.key==="Enter"&&handleVerifyPin()}/>
          {pinError&&<div style={{color:"#E53E3E",fontSize:".82rem",marginTop:8}}>{pinError}</div>}
          <Btn className="btn-gold btn-block" style={{marginTop:16}} onClick={handleVerifyPin} disabled={pinVal.length<4||pinLoading}>
            {pinLoading?<><div className="spinner"/>Checking…</>:"Open Wish 🎁"}
          </Btn>
          <Btn className="btn-ghost btn-block" style={{marginTop:10}} onClick={onBack}>← Go Back</Btn>
        </div>
      </div>
    </div>
  );

  if(expired)return(
    <div className="viewer-page">
      <div className="viewer-not-found">
        <div style={{fontSize:"3rem",marginBottom:16}}>⏰</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.6rem",fontWeight:700,marginBottom:8,color:"var(--text)"}}>Wish Expired</div>
        <div style={{color:"var(--muted)",fontSize:".88rem",marginBottom:24}}>This wish has expired and is no longer available</div>
        <Btn className="btn-gold" onClick={onBack}>← Go Back</Btn>
      </div>
    </div>
  );

  if(notFound)return(
    <div className="viewer-page">
      <div className="viewer-not-found">
        <div style={{fontSize:"3rem",marginBottom:16}}>🔍</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"1.6rem",fontWeight:700,marginBottom:8,color:"var(--text)"}}>Wish Not Found</div>
        <div style={{color:"var(--muted)",fontSize:".88rem",marginBottom:24}}>No wish found with code <strong>{code}</strong></div>
        <Btn className="btn-gold" onClick={onBack}>← Go Back</Btn>
      </div>
    </div>
  );

  return(
    <div className="viewer-page">
      <Confetti active={confetti}/>
      <div className="viewer-banner" style={{"--ev-grad":ev?.grad,background:"linear-gradient(160deg,#FFFDF7,#FFF9EE)"}}>
        <span className="viewer-banner-emoji">{wish.eventEmoji||ev?.emoji}</span>
        <div className="viewer-banner-event">{wish.eventLabel||ev?.label}</div>
      </div>
      <div className="viewer-card">
        {wish.type==="special"&&<><div className="viewer-to">A special wish for</div><div className="viewer-name">{wish.receiver}</div></>}
        {wish.type==="random"&&<div style={{marginBottom:12}}><span style={{background:"rgba(184,134,11,.1)",border:"1px solid var(--border2)",borderRadius:50,padding:"4px 14px",fontSize:".75rem",fontWeight:600,color:"var(--gold3)"}}>🌍 Public Wish</span></div>}
        <div className="viewer-msg">"{wish.message}"</div>
        <div className="viewer-from">— With love from <strong>{wish.sender}</strong></div>

        {/* Views */}
        <div style={{fontSize:".75rem",color:"var(--muted)",marginBottom:16,display:"flex",alignItems:"center",gap:5}}>
          <span>👁</span> {wish.views} {wish.views===1?"view":"views"}
        </div>

        {/* Song */}
        {wish.songTitle&&(
          <div className="viewer-song">
            <span style={{fontSize:"1.3rem"}}>🎵</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:600,fontSize:".85rem",color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{wish.songTitle}</div>
              <div style={{fontSize:".75rem",color:"var(--muted)"}}>{wish.songArtist}</div>
            </div>
            {wish.songUrl&&(
              <button type="button" className="song-yt" onClick={()=>{
                if(songPlaying){
                  viewerAudioRef.current.pause();
                  setSongPlaying(false);
                } else {
                  viewerAudioRef.current.src=wish.songUrl;
                  viewerAudioRef.current.load();
                  viewerAudioRef.current.play()
                    .then(()=>setSongPlaying(true))
                    .catch(err=>console.error("Audio error:",err));
                }
              }}>
                {songPlaying?"⏸":"▶"}
              </button>
            )}
          </div>
        )}

        {/* Gift */}
        {wish.gift&&(
          <button className="viewer-gift-btn" onClick={()=>setGiftOpen(true)}>
            <span className="viewer-gift-btn-emoji">🎁</span>
            You have a gift! Tap to open
          </button>
        )}

        {/* Reactions */}
        <div style={{marginTop:16,marginBottom:8,fontSize:".75rem",fontWeight:600,color:"var(--gold3)",letterSpacing:".08em",textTransform:"uppercase"}}>React</div>
        <div className="reaction-bar">
          {["❤️","😭","🎉","😍","🙏","🔥"].map(emoji=>(
            <button key={emoji} className="reaction-btn" onClick={()=>handleReact(emoji)}>
              <span>{emoji}</span>
              {reactionCounts[emoji]&&<span className="reaction-count">{reactionCounts[emoji]}</span>}
            </button>
          ))}
        </div>

        {/* Replies */}
        <div className="reply-section">
          <div style={{fontSize:".75rem",fontWeight:600,color:"var(--gold3)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:10}}>
            Replies ({replies.length})
          </div>
          {replies.map((r,i)=>(
            <div key={i} className="reply-item">
              <div className="reply-name">
                <span style={{width:26,height:26,borderRadius:"50%",background:"rgba(184,134,11,.12)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:"0.8rem",color:"var(--gold3)"}}>{r.name.charAt(0).toUpperCase()}</span>
                {r.name} replied
              </div>
              <div className="reply-msg">{r.message}</div>
              <div style={{fontSize:"0.7rem",color:"var(--muted)",marginTop:6}}>{new Date(r.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
            </div>
          ))}
          {!showReply?(
            <Btn className="btn-ghost btn-sm" onClick={()=>setShowReply(true)}>💬 Send a Reply</Btn>
          ):(
            <div style={{marginTop:10}}>
              <div className="form-group">
                <input className="form-input" placeholder="Your name" value={replyName} onChange={e=>setReplyName(e.target.value)}/>
              </div>
              <div className="form-group">
                <textarea className="form-textarea" style={{minHeight:80}} placeholder="Write your reply…" value={replyMsg} onChange={e=>setReplyMsg(e.target.value)} maxLength={300}/>
              </div>
              <div style={{display:"flex",gap:8}}>
                <Btn className="btn-ghost btn-sm" onClick={()=>setShowReply(false)}>Cancel</Btn>
                <Btn className="btn-gold btn-sm" onClick={handleReply} disabled={!replyName.trim()||!replyMsg.trim()||replyLoading}>
                  {replyLoading?<><div className="spinner"/>Sending…</>:"Send Reply"}
                </Btn>
              </div>
            </div>
          )}
        </div>

        <div className="viewer-code" style={{marginTop:16}}>
          <div className="viewer-code-label">Wish Code</div>
          <div className="viewer-code-val">{wish.code}</div>
        </div>
        <Btn className="btn-ghost btn-block" onClick={onBack} style={{marginTop:8}}>← Create Your Own Wish</Btn>
      </div>
      {giftOpen&&wish.gift&&<GiftOpenViewer gift={wish.gift} onClose={()=>setGiftOpen(false)}/>}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App(){
  const urlCode=new URLSearchParams(window.location.search).get("wish");
  const[page,setPage]         =useState(urlCode?"viewer":"home");
  const[viewCode,setViewCode] =useState(urlCode||"");
  const[step,setStep]         =useState(0);
  const[key,setKey]           =useState(0);
  const[wishType,setWishType] =useState(null);
  const[sender,setSender]     =useState("");
  const[receiver,setReceiver] =useState("");
  const[msg,setMsg]           =useState("");
  const[event,setEvent]       =useState(null);
  const[customEvent,setCustomEvent]=useState("");
  const[playing,setPlaying]   =useState(null);
  const audioRef             = useRef(new Audio());
  const[song,setSong]         =useState(null);
  const[gift,setGift]         =useState(null);
  const[pin,setPin]           =useState("");
  const[code,setCode]         =useState("");
  const[giftModal,setGiftModal]   =useState(false);
  const[giftViewer,setGiftViewer] =useState(false);
  const[confetti,setConfetti] =useState(false);
  const[toast,setToast]       =useState(null);
  const[copied,setCopied]     =useState(false);
  const[loading,setLoading]   =useState(false);

  const isSpecial =wishType==="special";
  const steps     =isSpecial?STEPS_SPECIAL:STEPS_RANDOM;
  const totalSteps=steps.length;
  const progress  =step===0?0:(step/(totalSteps-1))*100;
  const ev        =event?getEv(event):null;
  const songs     =event?SONGS[event]||[]:[];
  const stepName  =steps[step];

  function go(s){setKey(k=>k+1);setStep(s);}
  function next(){go(step+1);}
  function back(){go(step-1);}

  function canNext(){
    if(stepName==="Type")    return !!wishType;
    if(stepName==="Details") return sender.trim()&&(!isSpecial||receiver.trim());
    if(stepName==="Message") return msg.trim().length>=10;
    if(stepName==="Event")   return !!event&&(event!="custom"||customEvent.trim().length>0);
    return true;
  }

  useEffect(()=>{
    setSong(null);
    audioRef.current.pause();
    audioRef.current.src = "";
    setPlaying(null);
  },[event]);

  useEffect(()=>{
    audioRef.current.pause();
    audioRef.current.src = "";
    setPlaying(null);
  },[step]);

  function showToast(m,type="success"){setToast({msg:m,type});}

  async function handleCreate(){
    setLoading(true);
    try{
      const fd=new FormData();
      fd.append("type",wishType);
      fd.append("sender",sender.trim());
      fd.append("message",msg.trim());
      fd.append("event", event==="custom"?customEvent.trim():event);
      const selectedEvent = event==="custom" ? {label:customEvent.trim()||"Custom", emoji:"✨"} : getEv(event);
      fd.append("eventLabel",selectedEvent.label);
      fd.append("eventEmoji",selectedEvent.emoji);
      if(isSpecial&&receiver.trim()) fd.append("receiver",receiver.trim());
      if(song){fd.append("songTitle",song.title);fd.append("songArtist",song.artist);fd.append("songUrl",song.url);}
      if(pin.trim()) fd.append("pin",pin.trim());
      if(isSpecial&&gift){
        if(gift.giftMsg?.trim()) fd.append("giftMessage",gift.giftMsg.trim());
        if(gift.file){
          fd.append(gift.fileType==="audio"?"giftAudio":"giftMedia",gift.file);
        }
      }
      const{wish}=await api.createWish(fd);
      setCode(wish.code);
      window.history.replaceState({},"",`?wish=${wish.code}`);
      go(step+1);
      setTimeout(()=>setConfetti(true),200);
    }catch(err){
      showToast(err.message||"Something went wrong","error");
    }finally{setLoading(false);}
  }

  function shareWA(c){window.open(`https://wa.me/?text=${encodeURIComponent(`🥳 Someone sent you a wish!\nOpen it here: ${window.location.origin}?wish=${c}\nWish Code: ${c}\n✨ Happy Wisher`)}`,"_blank");}
  function shareFB(c){window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}?wish=${c}`)}`,"_blank");}
  function copyLink(c){
    navigator.clipboard?.writeText(`${window.location.origin}?wish=${c}`).catch(()=>{});
    setCopied(true);showToast("Link copied! 🔗");setTimeout(()=>setCopied(false),2000);
  }

  function reset(){
    setStep(0);setKey(k=>k+1);setWishType(null);setSender("");setReceiver("");
    setMsg("");setEvent(null);setSong(null);setGift(null);setPin("");setCode("");
    audioRef.current.pause();
    audioRef.current.src = "";
    setConfetti(false);
    window.history.replaceState({},"",window.location.pathname);
  }

  // If URL has wish code show viewer
  if(page==="viewer"&&viewCode){
    return(
      <div className="app">
        <style>{CSS}</style>
        <StarCanvas/><div className="grain"/>
        <div className="orb orb1"/><div className="orb orb2"/><div className="orb orb3"/>
        <div className="topbar"><span className="logo-text">Happy Wisher</span></div>
        <WishViewer code={viewCode} onBack={()=>{setPage("home");setViewCode("");window.history.replaceState({},"",window.location.pathname);}}/>
        <div style={{marginTop:24,textAlign:"center",fontSize:".7rem",color:"var(--muted)",letterSpacing:".04em"}}>
          powered by <span style={{color:"var(--gold3)",fontWeight:600}}>HYPER Company</span>
        </div>
      </div>
    );
  }

  return(
    <div className="app">
      <style>{CSS}</style>
      <StarCanvas/><div className="grain"/>
      <div className="orb orb1"/><div className="orb orb2"/><div className="orb orb3"/>
      <div className="topbar"><span className="logo-text">Happy Wisher</span></div>
      <div className="card">
        {step>0&&stepName!=="Done"&&(
          <div className="progress-wrap">
            <div className="progress-label"><span>{stepName}</span><span>{step}/{totalSteps-1}</span></div>
            <div className="progress-track"><div className="progress-fill" style={{width:`${progress}%`}}/></div>
          </div>
        )}
        <div className="card-body">
          <div key={key} className="step-enter">

            {stepName==="Welcome"&&(
              <div className="welcome-center">
                <div className="welcome-title">Happy Wisher</div>
                <p className="welcome-sub">Create beautiful heartfelt wishes with music, gifts & magic ✨</p>
                <div className="welcome-sparkles">{["🎁","✨","🎉","🌟"].map((e,i)=><span key={i} className="ws">{e}</span>)}</div>
                <Btn className="btn-gold btn-lg btn-block" onClick={next}>✨ Create a Wish</Btn>
              </div>
            )}

            {stepName==="Type"&&(
              <>
                <div className="step-title">What kind of wish?</div>
                <div className="step-sub">Choose the type that fits your message</div>
                <div className="type-grid">
                  {[{id:"special",emoji:"🎁",name:"Special Wish",desc:"Private wish for one person. Add photos, videos & a gift!"},{id:"random",emoji:"🥳",name:"Random Wish",desc:"A public wish shared with the whole world!"}].map((t,i)=>(
                    <div key={t.id} className={`type-card anim-delay-${i+1} step-enter ${wishType===t.id?"active":""}`} onClick={()=>setWishType(t.id)}>
                      <span className="type-card-emoji">{t.emoji}</span>
                      <div className="type-card-name">{t.name}</div>
                      <div className="type-card-desc">{t.desc}</div>
                    </div>
                  ))}
                </div>
                <div className="nav-row">
                  <Btn className="btn-ghost" onClick={back}>← Back</Btn>
                  <Btn className="btn-gold btn-block" onClick={next} disabled={!canNext()}>Continue →</Btn>
                </div>
              </>
            )}

            {stepName==="Details"&&(
              <>
                <div className="step-title">Who's sending?</div>
                <div className="step-sub">Tell us who this wish is from{isSpecial?" and for":""}</div>
                <div className="form-group step-enter anim-delay-1">
                  <label className="form-label">Your Name</label>
                  <input className="form-input" placeholder="e.g. Sarah Johnson" value={sender} onChange={e=>setSender(e.target.value)} autoFocus/>
                </div>
                {isSpecial&&(
                  <div className="form-group step-enter anim-delay-2">
                    <label className="form-label">Receiver's Name</label>
                    <input className="form-input" placeholder="Who is this wish for?" value={receiver} onChange={e=>setReceiver(e.target.value)}/>
                  </div>
                )}
                {isSpecial&&(
                  <div className="form-group step-enter anim-delay-3">
                    <label className="form-label">PIN Protection (Optional)</label>
                    <input className="form-input" type="number" placeholder="4-digit PIN e.g. 1234" maxLength={4} value={pin} onChange={e=>setPin(e.target.value.slice(0,4))}/>
                    <div style={{fontSize:".72rem",color:"var(--muted)",marginTop:4}}>Leave empty for no PIN protection</div>
                  </div>
                )}
                <div className="nav-row">
                  <Btn className="btn-ghost" onClick={back}>← Back</Btn>
                  <Btn className="btn-gold btn-block" onClick={next} disabled={!canNext()}>Continue →</Btn>
                </div>
              </>
            )}

            {stepName==="Message"&&(
              <>
                <div className="step-title">Write your wish</div>
                <div className="step-sub">Pour your heart into this message ✍️</div>
                <div className="form-group">
                  <label className="form-label">Your Message</label>
                  <textarea className="form-textarea" style={{minHeight:110}} placeholder="Write something heartfelt, funny, or inspiring…" value={msg} onChange={e=>setMsg(e.target.value)} maxLength={500} autoFocus/>
                  <div className="char-count">{msg.length}/500{msg.length<10&&msg.length>0&&<span style={{color:"#E53E3E"}}> · min 10 chars</span>}</div>
                </div>
                <div className="nav-row">
                  <Btn className="btn-ghost" onClick={back}>← Back</Btn>
                  <Btn className="btn-gold btn-block" onClick={next} disabled={!canNext()}>Continue →</Btn>
                </div>
              </>
            )}

            {stepName==="Event"&&(
              <>
                <div className="step-title">Pick an occasion</div>
                <div className="step-sub">Sets the mood and music 🎵 — or create your own!</div>
                <div className="event-grid" style={{marginBottom:20}}>
                  {EVENTS.map((ev,i)=>(
                    <div key={ev.id} className={`event-chip step-enter anim-delay-${Math.min(i+1,5)} ${event===ev.id?"active":""}`} onClick={()=>setEvent(ev.id)}>
                      <span className="event-emoji">{ev.emoji}</span>
                      <span className="event-label">{ev.label}</span>
                    </div>
                  ))}
                  <div className={`event-chip step-enter anim-delay-${Math.min(EVENTS.length+1,5)} ${event==="custom"?"active":""}`} onClick={()=>setEvent("custom")}> 
                    <span className="event-emoji">✨</span>
                    <span className="event-label">Custom</span>
                  </div>
                </div>
                {event==="custom"&&(
                  <div className="form-group step-enter anim-delay-1">
                    <label className="form-label">Custom occasion</label>
                    <input className="form-input" placeholder="e.g. Anniversary, Graduation Party" value={customEvent} onChange={e=>setCustomEvent(e.target.value)} autoFocus/>
                  </div>
                )}
                <div className="nav-row">
                  <Btn className="btn-ghost" onClick={back}>← Back</Btn>
                  <Btn className="btn-gold btn-block" onClick={next} disabled={!canNext()}>Continue →</Btn>
                </div>
              </>
            )}

            {stepName==="Song"&&(
              <>
                <div className="step-title">Choose a song</div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontSize:"1.4rem"}}>{ev?.emoji}</span>
                  <div className="step-sub" style={{margin:0}}>Songs for <strong style={{color:"var(--gold3)"}}>{ev?.label}</strong> — optional</div>
                </div>
                <div className="song-list" style={{marginBottom:20,marginTop:14}}>
                  {songs.map((s,i)=>(
                    <div key={i} className={`song-row step-enter anim-delay-${i+1} ${song?.title===s.title?"active":""}`} onClick={()=>setSong(song?.title===s.title?null:s)}>
                      <button type="button" className="song-yt" style={{marginRight:10,flexShrink:0}} onClick={e=>{
                          e.preventDefault();
                          e.stopPropagation();
                          if(playing===i){
                            audioRef.current.pause();
                            setPlaying(null);
                          } else {
                            audioRef.current.pause();
                            audioRef.current.src=s.url;
                            audioRef.current.load();
                            audioRef.current.play()
                              .then(()=>setPlaying(i))
                              .catch(err=>console.error("Audio error:",err));
                          }
                        }}>
                        {playing===i?"⏸":"▶"}
                      </button>
                      <div className="song-info">
                        <div className="song-title">{s.title}</div>
                        <div className="song-artist">{s.artist}</div>
                      </div>
                      {song?.title===s.title&&<div className="song-tick">✓</div>}
                    </div>
                  ))}
                </div>
                <audio ref={audioRef} style={{display:"none"}} preload="none" />
                <div className="nav-row">
                  <Btn className="btn-ghost" onClick={()=>{
                    audioRef.current.pause();
                    audioRef.current.src = "";
                    setPlaying(null);
                    back();
                  }}>← Back</Btn>
                  <Btn className="btn-gold btn-block" onClick={()=>{
                    audioRef.current.pause();
                    audioRef.current.src = "";
                    setPlaying(null);
                    isSpecial?next():handleCreate();
                  }} disabled={loading}>
                    {loading?<><div className="spinner"/>Saving…</>:isSpecial?"Continue →":"Create Wish 🌟"}
                  </Btn>
                </div>
              </>
            )}

            {stepName==="Gift"&&(
              <>
                <div className="step-title">Add a gift 🎁</div>
                <div className="step-sub">Surprise <strong style={{color:"var(--gold3)"}}>{receiver}</strong> with something special</div>
                {!gift?(
                  <div className="gift-zone" onClick={()=>setGiftModal(true)} style={{marginBottom:20}}>
                    <span className="gift-big-emoji">🎁</span>
                    <div className="gift-zone-title">Add a Gift</div>
                    <div className="gift-zone-sub">Photos, videos, audio & a personal note</div>
                  </div>
                ):(
                  <div className="gift-zone has-gift" style={{marginBottom:20}} onClick={()=>setGiftModal(true)}>
                    <span style={{fontSize:"2.2rem",display:"block",marginBottom:8}}>🎀</span>
                    <div className="gift-zone-title" style={{color:"var(--gold3)"}}>Gift Added! ✓</div>
                    <div className="gift-zone-sub">"{(gift.giftMsg||"").slice(0,50)}{(gift.giftMsg||"").length>50?"…":""}"</div>
                    <div style={{marginTop:10}}>
                      <Btn className="btn-ghost btn-sm" onClick={e=>{e.stopPropagation();setGiftViewer(true);}}>Preview 👁</Btn>
                    </div>
                  </div>
                )}
                <div className="nav-row">
                  <Btn className="btn-ghost" onClick={back}>← Back</Btn>
                  <Btn className="btn-gold btn-block" onClick={handleCreate} disabled={loading}>
                    {loading?<><div className="spinner"/>Saving…</>:gift?"Create Wish 🌟":"Skip & Create →"}
                  </Btn>
                </div>
              </>
            )}

            {stepName==="Done"&&(
              <>
                <div style={{textAlign:"center",marginBottom:20}}>
                  <span className="done-emoji">🎉</span>
                  <div className="done-type-badge">{isSpecial?"🎁 Special Wish":"🌍 Random Wish"}</div>
                  <div className="step-title" style={{fontSize:"clamp(1.4rem,5vw,1.9rem)"}}>Wish Created!</div>
                  <div className="step-sub">Saved to database — share the link! ✨</div>
                </div>
                <div className="wish-preview step-enter anim-delay-1">
                  <div className="wp-banner" style={{"--ev-grad":ev?.grad}}>
                    <span className="wp-emoji">{ev?.emoji}</span>
                    <div className="wp-event">{ev?.label}</div>
                  </div>
                  <div className="wp-body">
                    {isSpecial&&<><div className="wp-to">A special wish for</div><div className="wp-name">{receiver}</div></>}
                    <div className="wp-msg">{msg}</div>
                    <div className="wp-from">— {sender}</div>
                    {song&&(
                      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:12,padding:"9px 12px",background:"rgba(184,134,11,.07)",borderRadius:10}}>
                        <span style={{fontSize:"1.1rem"}}>🎵</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:600,fontSize:".83rem",color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{song.title}</div>
                          <div style={{fontSize:".72rem",color:"var(--muted)"}}>{song.artist}</div>
                        </div>
                        <a href={song.url} target="_blank" rel="noreferrer" className="song-yt">▶</a>
                      </div>
                    )}
                    {pin&&<div style={{marginTop:8,fontSize:".78rem",color:"var(--muted)"}}>🔒 PIN protected</div>}
                  </div>
                </div>
                <div className="code-wrap step-enter anim-delay-2">
                  <div className="code-label">Your Wish Code</div>
                  <div className="code-val">{code}</div>
                  <div className="code-sub">Share the link — anyone who opens it sees the wish!</div>
                </div>
                <div style={{marginBottom:16}} className="step-enter anim-delay-3">
                  <div style={{fontSize:".7rem",fontWeight:600,color:"var(--gold3)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:8}}>Share Your Wish</div>
                  <div className="share-grid">
                    <button className="share-btn sh-wa" onClick={()=>shareWA(code)}><span className="share-icon">💬</span>WhatsApp</button>
                    <button className="share-btn sh-fb" onClick={()=>shareFB(code)}><span className="share-icon">👍</span>Facebook</button>
                    <button className="share-btn sh-cp" onClick={()=>copyLink(code)}><span className="share-icon">{copied?"✓":"🔗"}</span>{copied?"Copied!":"Copy Link"}</button>
                  </div>
                </div>
                <Btn className="btn-gold btn-block btn-lg step-enter anim-delay-4" onClick={reset}>✨ Create Another Wish</Btn>
              </>
            )}

          </div>
        </div>
      </div>
      <div style={{marginTop:24,textAlign:"center",fontSize:".7rem",color:"var(--muted)",animation:"fadeDown .8s .4s both",letterSpacing:".04em"}}>
        powered by <span style={{color:"var(--gold3)",fontWeight:600}}>HYPER Company</span>
      </div>
      {giftModal&&<GiftModal initial={gift} onClose={()=>setGiftModal(false)} onSave={g=>{setGift(g);showToast("Gift saved! 🎁");}}/>}
      {giftViewer&&gift&&<GiftOpenViewer gift={gift} onClose={()=>setGiftViewer(false)}/>}
      {toast&&<Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
      <Confetti active={confetti}/>
    </div>
  );
}
