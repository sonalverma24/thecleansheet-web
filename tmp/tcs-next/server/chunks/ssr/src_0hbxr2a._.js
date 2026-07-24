module.exports=[80686,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/src/components/PrintTrigger.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/src/components/PrintTrigger.tsx <module evaluation>","default")},39197,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/src/components/PrintTrigger.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/src/components/PrintTrigger.tsx","default")},74781,a=>{"use strict";a.i(80686);var b=a.i(39197);a.n(b)},62069,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/src/components/PrintBar.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/src/components/PrintBar.tsx <module evaluation>","default")},67183,a=>{"use strict";a.s(["default",()=>b]);let b=(0,a.i(11857).registerClientReference)(function(){throw Error("Attempted to call the default export of [project]/src/components/PrintBar.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"[project]/src/components/PrintBar.tsx","default")},23626,a=>{"use strict";a.i(62069);var b=a.i(67183);a.n(b)},75850,a=>{"use strict";var b=a.i(7997);a.i(70396);var c=a.i(73727),d=a.i(22359),e=a.i(74781),f=a.i(23626);async function g({params:a}){let{slug:b}=await a,c=(0,d.getGuideBySlug)(b);return c?{title:`The Clean Sheet™ Guide to ${c.skinType}`}:{}}async function h({params:a}){let{slug:g}=await a,i=(0,d.getGuideBySlug)(g);return i||(0,c.notFound)(),(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(e.default,{}),(0,b.jsx)("style",{children:`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Inter:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', system-ui, sans-serif;
          background: #fff;
          color: #0a1f16;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        @page {
          size: A4;
          margin: 0;
        }

        /* Hide print trigger button in print */
        .no-print { display: none !important; }

        /* Force page breaks */
        .page-break { page-break-after: always; break-after: page; }
        .avoid-break { page-break-inside: avoid; break-inside: avoid; }

        /* Screen: show close button */
        @media screen {
          .screen-only { display: flex; }
        }
        @media print {
          .screen-only { display: none !important; }
        }
      `}),(0,b.jsx)(f.default,{}),(0,b.jsxs)("div",{className:"page-break avoid-break",style:{width:"210mm",minHeight:"297mm",background:"linear-gradient(160deg, #0a2420 0%, #0f3d38 45%, #083028 100%)",position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",padding:"0",marginTop:40},children:[(0,b.jsx)("div",{style:{position:"absolute",inset:0,opacity:.04,backgroundImage:"linear-gradient(#5eead4 1px, transparent 1px), linear-gradient(90deg, #5eead4 1px, transparent 1px)",backgroundSize:"28px 28px"}}),(0,b.jsxs)("svg",{style:{position:"absolute",top:"10%",right:"-5%",opacity:.08,width:340,height:340},viewBox:"0 0 480 480",fill:"none",children:[[[60,120,160,80],[160,80,260,140],[260,140,360,80],[360,80,440,140],[160,80,140,20],[360,80,380,20],[260,140,260,240],[160,80,100,160],[260,240,200,320],[260,240,320,320],[100,160,60,220],[200,320,180,400],[320,320,360,400]].map(([a,c,d,e],f)=>(0,b.jsx)("line",{x1:a,y1:c,x2:d,y2:e,stroke:"#5eead4",strokeWidth:"2",strokeDasharray:"5 4"},f)),[{cx:60,cy:120,r:6},{cx:160,cy:80,r:9},{cx:260,cy:140,r:7},{cx:360,cy:80,r:9},{cx:440,cy:140,r:6},{cx:140,cy:20,r:5},{cx:380,cy:20,r:5},{cx:260,cy:240,r:8},{cx:100,cy:160,r:5},{cx:200,cy:320,r:5},{cx:320,cy:320,r:5},{cx:60,cy:220,r:4},{cx:180,cy:400,r:4},{cx:360,cy:400,r:4}].map(({cx:a,cy:c,r:d},e)=>(0,b.jsx)("circle",{cx:a,cy:c,r:d,fill:"#5eead4",fillOpacity:"0.7"},e))]}),(0,b.jsx)("div",{style:{position:"absolute",bottom:-120,left:-80,width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)"}}),(0,b.jsxs)("div",{style:{position:"relative",zIndex:10,padding:"52px 56px",flex:1,display:"flex",flexDirection:"column"},children:[(0,b.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:64},children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{style:{fontSize:11,fontWeight:800,color:"#5eead4",textTransform:"uppercase",letterSpacing:"0.2em",marginBottom:4},children:"The Clean Sheet™"}),(0,b.jsx)("div",{style:{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:"0.15em",textTransform:"uppercase"},children:"thecleansheet.in"})]}),(0,b.jsx)("div",{style:{width:44,height:44,background:"rgba(255,255,255,0.08)",borderRadius:8,border:"1px solid rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,b.jsxs)("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",children:[(0,b.jsx)("rect",{x:"2",y:"2",width:"8",height:"8",rx:"1.5",fill:"#14b8a6",opacity:"0.9"}),(0,b.jsx)("rect",{x:"14",y:"2",width:"8",height:"8",rx:"1.5",fill:"#14b8a6",opacity:"0.9"}),(0,b.jsx)("rect",{x:"2",y:"14",width:"8",height:"8",rx:"1.5",fill:"#14b8a6",opacity:"0.9"}),(0,b.jsx)("rect",{x:"14",y:"14",width:"4",height:"4",rx:"1",fill:"#5eead4",opacity:"0.7"}),(0,b.jsx)("rect",{x:"19",y:"14",width:"3",height:"3",rx:"0.75",fill:"#5eead4",opacity:"0.5"}),(0,b.jsx)("rect",{x:"14",y:"19",width:"3",height:"3",rx:"0.75",fill:"#5eead4",opacity:"0.5"})]})})]}),(0,b.jsx)("div",{style:{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(20,184,166,0.15)",border:"1px solid rgba(20,184,166,0.3)",borderRadius:20,padding:"5px 14px",width:"fit-content",fontSize:9,fontWeight:700,color:"#5eead4",textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:28},children:"✦ Skin Type Guide"}),(0,b.jsxs)("div",{style:{flex:1},children:[(0,b.jsxs)("div",{style:{fontFamily:"'Playfair Display', Georgia, serif",fontSize:60,fontWeight:900,lineHeight:1.05,color:"#ffffff",marginBottom:20},children:["Guide to",(0,b.jsx)("br",{}),(0,b.jsx)("span",{style:{color:"#5eead4"},children:i.skinType})]}),(0,b.jsx)("p",{style:{fontSize:14,color:"rgba(255,255,255,0.6)",lineHeight:1.7,maxWidth:380,marginBottom:48},children:i.tagline}),(0,b.jsxs)("div",{style:{background:"rgba(20,184,166,0.1)",border:"1px solid rgba(20,184,166,0.25)",borderRadius:12,padding:"16px 20px",maxWidth:420},children:[(0,b.jsx)("div",{style:{fontSize:9,fontWeight:800,color:"#5eead4",textTransform:"uppercase",letterSpacing:"0.15em",marginBottom:6},children:"The Upside"}),(0,b.jsx)("p",{style:{fontSize:12,color:"rgba(255,255,255,0.75)",lineHeight:1.6},children:i.silverLining})]})]}),(0,b.jsxs)("div",{style:{borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:20,display:"flex",alignItems:"center",justifyContent:"space-between"},children:[(0,b.jsx)("div",{style:{fontSize:10,color:"rgba(255,255,255,0.3)"},children:"India's first independent beauty & personal care standard"}),(0,b.jsx)("div",{style:{fontSize:10,color:"rgba(255,255,255,0.3)"},children:"thecleansheet.in"})]})]})]}),(0,b.jsxs)("div",{style:{width:"210mm",background:"#fff",fontFamily:"'Inter', system-ui, sans-serif"},children:[(0,b.jsx)("style",{children:`
          .content-page {
            position: relative;
            padding: 48px 52px;
            min-height: 297mm;
          }
          .content-page::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image: repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 60px,
              rgba(13, 148, 136, 0.025) 60px,
              rgba(13, 148, 136, 0.025) 62px
            );
            pointer-events: none;
          }

          /* Page header */
          .page-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 14px;
            border-bottom: 2px solid #0d9488;
            margin-bottom: 32px;
          }
          .page-header-brand {
            font-size: 8px;
            font-weight: 800;
            color: #0d9488;
            text-transform: uppercase;
            letter-spacing: 0.2em;
          }
          .page-header-title {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 13px;
            font-weight: 700;
            color: #0a1f16;
          }

          /* Section headings */
          .section-num {
            font-family: 'Inter', sans-serif;
            font-size: 9px;
            font-weight: 800;
            color: #5eead4;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .section-title {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 20px;
            font-weight: 700;
            color: #0a1f16;
            margin-bottom: 16px;
          }

          /* Cards */
          .card {
            background: #f0fdfa;
            border: 1px solid #ccfbf1;
            border-radius: 10px;
            padding: 16px;
          }
          .card-heading {
            font-size: 8px;
            font-weight: 800;
            color: #0d9488;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            margin-bottom: 10px;
          }
          .bullet-item {
            display: flex;
            gap: 8px;
            margin-bottom: 7px;
            font-size: 10px;
            line-height: 1.5;
            color: #374151;
          }
          .bullet-dot {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #14b8a6;
            flex-shrink: 0;
            margin-top: 4px;
          }

          /* Mistake row */
          .mistake-row {
            display: flex;
            gap: 10px;
            padding: 10px 14px;
            background: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 8px;
            margin-bottom: 6px;
            font-size: 10px;
            line-height: 1.5;
            color: #374151;
          }
          .mistake-icon {
            color: #d97706;
            font-size: 11px;
            flex-shrink: 0;
            margin-top: 1px;
          }

          /* Ingredient section */
          .ing-section {
            margin-bottom: 10px;
            border: 1px solid #ccfbf1;
            border-radius: 8px;
            overflow: hidden;
          }
          .ing-heading {
            background: #f0fdfa;
            padding: 8px 14px;
            font-size: 8px;
            font-weight: 800;
            color: #0d9488;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            border-bottom: 1px solid #ccfbf1;
          }
          .ing-body { padding: 10px 14px; }

          /* Routine */
          .routine-col {
            flex: 1;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
          }
          .routine-am-header {
            background: linear-gradient(90deg, #fffbeb, #fefce8);
            padding: 10px 16px;
            font-size: 9px;
            font-weight: 800;
            color: #b45309;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            border-bottom: 1px solid #fde68a;
          }
          .routine-pm-header {
            background: linear-gradient(90deg, #0f2e2b, #0a3d38);
            padding: 10px 16px;
            font-size: 9px;
            font-weight: 800;
            color: #99f6e4;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            border-bottom: 1px solid #0d9488;
          }
          .routine-body { padding: 14px 16px; }
          .routine-step {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
            font-size: 10px;
            line-height: 1.5;
          }
          .step-num {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #ccfbf1;
            color: #0d9488;
            font-size: 9px;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          /* Checklist */
          .checklist-box {
            background: linear-gradient(135deg, #0a2420, #0f3d38);
            border-radius: 12px;
            padding: 24px 28px;
          }
          .checklist-item {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
            font-size: 10.5px;
            line-height: 1.5;
            color: #ccfbf1;
          }
          .check-icon { color: #14b8a6; flex-shrink: 0; margin-top: 1px; }

          /* Page footer */
          .page-footer {
            position: absolute;
            bottom: 24px;
            left: 52px;
            right: 52px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 8px;
            color: #9ca3af;
            border-top: 1px solid #f3f4f6;
            padding-top: 8px;
          }
        `}),(0,b.jsxs)("div",{className:"content-page avoid-break",children:[(0,b.jsxs)("div",{className:"page-header",children:[(0,b.jsx)("span",{className:"page-header-brand",children:"The Clean Sheet™ · thecleansheet.in"}),(0,b.jsx)("span",{className:"page-header-title",children:i.skinType})]}),(0,b.jsxs)("div",{style:{marginBottom:32},children:[(0,b.jsx)("div",{className:"section-num",children:"01"}),(0,b.jsx)("div",{className:"section-title",children:"Understanding Your Skin"}),(0,b.jsx)("div",{style:{display:"flex",gap:14},children:i.causes.map(({label:a,items:c})=>(0,b.jsxs)("div",{className:"card",style:{flex:1},children:[(0,b.jsx)("div",{className:"card-heading",children:a}),c.map((a,c)=>{let[d,...e]=a.split(": ");return(0,b.jsxs)("div",{className:"bullet-item",children:[(0,b.jsx)("span",{className:"bullet-dot"}),(0,b.jsx)("span",{children:e.length?(0,b.jsxs)(b.Fragment,{children:[(0,b.jsxs)("strong",{children:[d,":"]})," ",e.join(": ")]}):a})]},c)})]},a))})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{className:"section-num",children:"02"}),(0,b.jsx)("div",{className:"section-title",children:"Essential Habits & Hygiene"}),(0,b.jsx)("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8},children:i.habits.map((a,c)=>{let[d,...e]=a.split(": ");return(0,b.jsxs)("div",{style:{display:"flex",gap:8,padding:"10px 12px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,fontSize:10,lineHeight:1.5,color:"#374151"},children:[(0,b.jsx)("span",{style:{color:"#0d9488",fontSize:11,flexShrink:0},children:"✓"}),(0,b.jsx)("span",{children:e.length?(0,b.jsxs)(b.Fragment,{children:[(0,b.jsxs)("strong",{style:{color:"#0a1f16"},children:[d,":"]})," ",e.join(": ")]}):a})]},c)})})]}),(0,b.jsxs)("div",{className:"page-footer",children:[(0,b.jsx)("span",{children:"© The Clean Sheet™ · India's first independent beauty standard"}),(0,b.jsx)("span",{children:"thecleansheet.in"})]})]}),(0,b.jsxs)("div",{className:"content-page avoid-break page-break",children:[(0,b.jsxs)("div",{className:"page-header",children:[(0,b.jsx)("span",{className:"page-header-brand",children:"The Clean Sheet™ · thecleansheet.in"}),(0,b.jsx)("span",{className:"page-header-title",children:i.skinType})]}),(0,b.jsxs)("div",{style:{marginBottom:28},children:[(0,b.jsx)("div",{className:"section-num",children:"03"}),(0,b.jsx)("div",{className:"section-title",children:"Common Mistakes to Avoid"}),i.mistakes.map((a,c)=>{let[d,...e]=a.split(": ");return(0,b.jsxs)("div",{className:"mistake-row",children:[(0,b.jsx)("span",{className:"mistake-icon",children:"⚠"}),(0,b.jsx)("span",{children:e.length?(0,b.jsxs)(b.Fragment,{children:[(0,b.jsxs)("strong",{style:{color:"#92400e"},children:[d,":"]})," ",e.join(": ")]}):a})]},c)})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{className:"section-num",children:"04"}),(0,b.jsx)("div",{className:"section-title",children:"Ingredient Guide & Product Selection"}),i.ingredientSections.map(({heading:a,tips:c})=>(0,b.jsxs)("div",{className:"ing-section",children:[(0,b.jsx)("div",{className:"ing-heading",children:a}),(0,b.jsx)("div",{className:"ing-body",children:c.map((a,c)=>{let[d,...e]=a.split(": ");return(0,b.jsxs)("div",{className:"bullet-item",children:[(0,b.jsx)("span",{className:"bullet-dot"}),(0,b.jsx)("span",{children:e.length?(0,b.jsxs)(b.Fragment,{children:[(0,b.jsxs)("strong",{children:[d,":"]})," ",e.join(": ")]}):a})]},c)})})]},a))]}),(0,b.jsxs)("div",{className:"page-footer",children:[(0,b.jsx)("span",{children:"© The Clean Sheet™ · India's first independent beauty standard"}),(0,b.jsx)("span",{children:"thecleansheet.in"})]})]}),(0,b.jsxs)("div",{className:"content-page avoid-break page-break",children:[(0,b.jsxs)("div",{className:"page-header",children:[(0,b.jsx)("span",{className:"page-header-brand",children:"The Clean Sheet™ · thecleansheet.in"}),(0,b.jsx)("span",{className:"page-header-title",children:i.skinType})]}),(0,b.jsxs)("div",{style:{marginBottom:32},children:[(0,b.jsx)("div",{className:"section-num",children:"05"}),(0,b.jsx)("div",{className:"section-title",children:"Your Simplified Daily Routine"}),(0,b.jsxs)("div",{style:{display:"flex",gap:14},children:[(0,b.jsxs)("div",{className:"routine-col",children:[(0,b.jsx)("div",{className:"routine-am-header",children:"☀ Morning Routine"}),(0,b.jsx)("div",{className:"routine-body",children:i.morningRoutine.map(({step:a,action:c,detail:d})=>(0,b.jsxs)("div",{className:"routine-step",children:[(0,b.jsx)("div",{className:"step-num",children:a}),(0,b.jsxs)("div",{children:[(0,b.jsxs)("strong",{style:{color:"#0a1f16"},children:[c,":"]})," ",(0,b.jsx)("span",{style:{color:"#4b5563"},children:d})]})]},a))})]}),(0,b.jsxs)("div",{className:"routine-col",children:[(0,b.jsx)("div",{className:"routine-pm-header",children:"🌙 Night Routine"}),(0,b.jsx)("div",{className:"routine-body",children:i.nightRoutine.map(({step:a,action:c,detail:d})=>(0,b.jsxs)("div",{className:"routine-step",children:[(0,b.jsx)("div",{className:"step-num",children:a}),(0,b.jsxs)("div",{children:[(0,b.jsxs)("strong",{style:{color:"#0a1f16"},children:[c,":"]})," ",(0,b.jsx)("span",{style:{color:"#4b5563"},children:d})]})]},a))})]})]})]}),(0,b.jsxs)("div",{style:{marginBottom:28},children:[(0,b.jsx)("div",{className:"section-num",children:"06"}),(0,b.jsx)("div",{className:"section-title",children:"Summary Checklist"}),(0,b.jsx)("div",{className:"checklist-box",children:(0,b.jsx)("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 20px"},children:i.checklist.map((a,c)=>(0,b.jsxs)("div",{className:"checklist-item",children:[(0,b.jsx)("span",{className:"check-icon",children:"✓"}),(0,b.jsx)("span",{children:a})]},c))})})]}),(0,b.jsxs)("div",{style:{background:"linear-gradient(90deg, #0a2420, #0f3d38)",borderRadius:12,padding:"20px 28px",display:"flex",alignItems:"center",justifyContent:"space-between"},children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{style:{fontSize:10,fontWeight:800,color:"#5eead4",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.15em"},children:"The Clean Sheet™"}),(0,b.jsx)("div",{style:{fontSize:11,color:"rgba(255,255,255,0.6)"},children:"India's first independent beauty & personal care standard"})]}),(0,b.jsxs)("div",{style:{textAlign:"right"},children:[(0,b.jsx)("div",{style:{fontSize:13,fontWeight:700,color:"#fff"},children:"thecleansheet.in"}),(0,b.jsx)("div",{style:{fontSize:9,color:"rgba(255,255,255,0.4)",marginTop:2},children:"Analyze any product free · Ask Clean"})]})]}),(0,b.jsxs)("div",{className:"page-footer",children:[(0,b.jsx)("span",{children:"© The Clean Sheet™ · India's first independent beauty standard"}),(0,b.jsx)("span",{children:"thecleansheet.in"})]})]})]})]})}a.s(["default",0,h,"generateMetadata",0,g,"generateStaticParams",0,function(){return(0,d.getAllGuideSlugs)().map(a=>({slug:a}))}])},18595,a=>{a.n(a.i(75850))}];

//# sourceMappingURL=src_0hbxr2a._.js.map